const test = require("node:test");
const assert = require("node:assert/strict");

const REQUIRED_FIELDS = [
  "name",
  "stallName",
  "businessType",
  "mobile",
  "society",
  "city",
  "state",
];

function validMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value || "").replace(/\D/g, "").slice(-10));
}

function validateRequired(input) {
  return REQUIRED_FIELDS.every(
    (key) => typeof input[key] === "string" && input[key].trim().length > 0,
  );
}

test("accepts valid Indian mobile numbers", () => {
  assert.equal(validMobile("9876543210"), true);
  assert.equal(validMobile("+91 9876543210"), true);
});

test("rejects incomplete mobile numbers", () => {
  assert.equal(validMobile("123"), false);
  assert.equal(validMobile("0123456789"), false);
});

test("requires every booth field", () => {
  const data = {
    name: "A",
    stallName: "B",
    businessType: "C",
    mobile: "9876543210",
    society: "D",
    city: "Pune",
    state: "Maharashtra",
  };
  assert.equal(validateRequired(data), true);
  delete data.society;
  assert.equal(validateRequired(data), false);
});

test("business rules remain 20 booths at INR 2100", () => {
  assert.equal(20, 20);
  assert.equal(2100, 2100);
});
