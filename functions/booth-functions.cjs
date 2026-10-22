const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { randomUUID } = require("node:crypto");
const { FIRESTORE_DATABASE_ID } = require("./config");
const ADMIN_KEY = defineSecret("OCTOBER_EVENT_ADMIN_KEY");
const EVENT_ID = "booth-2026-10-25";
const LIMIT = 20;
const FEE = 2100;
const db = () => getFirestore(undefined, FIRESTORE_DATABASE_ID);
const origins = ["https://badebabakharadi.com","https://www.badebabakharadi.com","https://babakharadi.com","https://www.babakharadi.com","https://badebabakharadi.github.io","http://localhost:5500","http://localhost:5501","http://localhost:5173","http://127.0.0.1:5500","http://127.0.0.1:5501","http://127.0.0.1:5173"];
function fail(message, code="invalid-argument"){ throw new HttpsError(code,message); }
function validMobile(v){ return /^[6-9]\d{9}$/.test(String(v||"").replace(/\D/g,"").slice(-10)); }
function clean(v,max=120){ return typeof v==="string" ? v.trim().slice(0,max) : ""; }
function validate(input, requireReceipt=true){
 const fields=["name","stallName","businessType","mobile","society","city","state"];
 for(const f of fields) if(!clean(input[f],f==="businessType"?80:120)) fail("Please complete every required field: "+f+".");
 if(!validMobile(input.mobile)) fail("Enter a valid 10-digit Indian mobile number.");
 if(requireReceipt && (!input.receiptBase64 || !/^image\/(jpeg|png|webp)$/.test(input.receiptMime||""))) fail("Upload a valid payment receipt image (JPG, PNG or WebP).");
 if(input.receiptBase64 && input.receiptBase64.length>1900000) fail("Receipt image is too large. Please upload an image under 1.4 MB.");
 return {name:clean(input.name),stallName:clean(input.stallName),businessType:clean(input.businessType,80),mobile:String(input.mobile).replace(/\D/g,"").slice(-10),society:clean(input.society),city:clean(input.city),state:clean(input.state)};
}
function assertAdmin(data){if(!data?.accessKey || data.accessKey!==ADMIN_KEY.value()) fail("Unauthorized.", "permission-denied");}
function wrap(fn){return async request=>{try{return await fn(request)}catch(e){if(e instanceof HttpsError) throw e;console.error("Booth registration error",e);throw new HttpsError("internal","Booth service failed. Please try again.");}}}
exports.boothLookup = onCall({cors:true},wrap(async request=>{
 const mobile=String(request.data?.mobile||"").replace(/\D/g,"").slice(-10);
 if(!validMobile(mobile)) fail("Enter a valid 10-digit mobile number.");
 const snap=await db().collection("boothRegistrations").where("eventId","==",EVENT_ID).where("mobile","==",mobile).limit(1).get();
 if(snap.empty) return {exists:false,available:await availableCount()};
 const d=snap.docs[0].data();
 return {exists:true,registration:{id:snap.docs[0].id,name:d.name,stallName:d.stallName,businessType:d.businessType,mobile:d.mobile,society:d.society,city:d.city,state:d.state,status:d.status,receiptUrl:d.receiptUrl||"",createdAt:d.createdAt?.toDate?.().toISOString()||null}};
}));
exports.boothSave = onCall({cors:true,timeoutSeconds:60,memory:"512MiB"},wrap(async request=>{
 const input=request.data||{};
 const data=validate(input,true);
 const col=db().collection("boothRegistrations");
 const existing=await col.where("eventId","==",EVENT_ID).where("mobile","==",data.mobile).limit(1).get();
 const id=existing.empty?randomUUID():existing.docs[0].id;
 const old=existing.empty?null:existing.docs[0].data();
 if(old?.disabled) fail("This registration is disabled. Please contact the event administrator.","failed-precondition");
 if(!old && await availableCount()<=0) fail("All 20 booth registrations have been received. Registration is closed.","resource-exhausted");
 const buffer=Buffer.from(input.receiptBase64,"base64");
 if(buffer.length>1400000) fail("Receipt image must be smaller than 1.4 MB.");
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[input.receiptMime];
 const path="booth-receipts/"+EVENT_ID+"/"+id+"."+ext;
 const token=randomUUID();
 const file=getStorage().bucket().file(path);
 await file.save(buffer,{resumable:false,metadata:{contentType:input.receiptMime,metadata:{firebaseStorageDownloadTokens:token}}});
 const receiptUrl="https://firebasestorage.googleapis.com/v0/b/"+getStorage().bucket().name+"/o/"+encodeURIComponent(path)+"?alt=media&token="+token;
 await col.doc(id).set({...data,eventId:EVENT_ID,fee: FEE,receiptUrl,receiptPath:path,receiptMime:input.receiptMime,status:"pending",disabled:false,createdAt:old?.createdAt||FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp(),paymentVerified:false,verifiedAt:null,verifiedBy:null}, {merge:true});
 return {saved:true,registrationId:id,status:"pending",message:"Registration submitted. Booth is not confirmed until payment is verified by the administrator."};
}));
async function availableCount(){
 const snap=await db().collection("boothRegistrations").where("eventId","==",EVENT_ID).where("disabled","==",false).get();
 return Math.max(0,LIMIT-snap.size);
}
exports.boothAdminVerify = onCall({cors:origins,secrets:[ADMIN_KEY]},wrap(async request=>{assertAdmin(request.data);return {verified:true};}));
exports.boothAdminList = onCall({cors:origins,secrets:[ADMIN_KEY]},wrap(async request=>{
 assertAdmin(request.data);
 const snap=await db().collection("boothRegistrations").where("eventId","==",EVENT_ID).get();
 const registrations=snap.docs.map(doc=>({id:doc.id,...doc.data()})).sort((a,b)=>(a.createdAt?.toMillis?.()||0)-(b.createdAt?.toMillis?.()||0)).map(d=>({...d,receiptBase64:undefined,createdAt:d.createdAt?.toDate?.().toISOString()||null,updatedAt:d.updatedAt?.toDate?.().toISOString()||null}));
 return {registrations,limit:LIMIT,fee:FEE,activeCount:registrations.filter(r=>!r.disabled).length,available:Math.max(0,LIMIT-registrations.filter(r=>!r.disabled).length)};
}));
exports.boothAdminUpdate = onCall({cors:origins,secrets:[ADMIN_KEY]},wrap(async request=>{
 const data=request.data||{};assertAdmin(data);
 if(!["verify","disable","enable"].includes(data.action)||!data.registrationId) fail("Invalid admin action.");
 const ref=db().collection("boothRegistrations").doc(data.registrationId);const snap=await ref.get();if(!snap.exists||snap.data().eventId!==EVENT_ID) fail("Registration not found.","not-found");
 const update=data.action==="verify"?{paymentVerified:true,status:"verified",verifiedAt:FieldValue.serverTimestamp(),verifiedBy:"admin"}:data.action==="disable"?{disabled:true,status:"disabled",disabledAt:FieldValue.serverTimestamp()}:{disabled:false,status:snap.data().paymentVerified?"verified":"pending"};
 await ref.update({...update,updatedAt:FieldValue.serverTimestamp()});return {updated:true,action:data.action};
}));
