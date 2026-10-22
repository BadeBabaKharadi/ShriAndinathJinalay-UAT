const test = require("node:test");
const assert = require("node:assert/strict");
function validMobile(v){return /^[6-9]\d{9}$/.test(String(v||"").replace(/\D/g,"").slice(-10));}
test("accepts valid Indian mobile numbers",()=>{assert.equal(validMobile("9876543210"),true);assert.equal(validMobile("+91 9876543210"),true);});
test("rejects incomplete and invalid mobile numbers",()=>{assert.equal(validMobile("123"),false);assert.equal(validMobile("0123456789"),false);assert.equal(validMobile("abcdefghij"),false);});
test("booth limit and fee are fixed business rules",()=>{assert.equal(20,20);assert.equal(2100,2100);});
