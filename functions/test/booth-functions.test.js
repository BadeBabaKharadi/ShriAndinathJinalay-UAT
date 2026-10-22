const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

test("booth form requires all fields", () => {
  const cwd = process.cwd();
  const root = path.basename(cwd) === "functions" ? path.dirname(cwd) : cwd;
  const html = readFileSync(path.join(root, "booth-registration.html"), "utf8");
  const requiredIds = [
    "mobile",
    "name",
    "stallName",
    "businessType",
    "formMobile",
    "society",
    "city",
    "state",
    "receipt",
  ];

  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id="${id}"[^>]*required`));
  }

  assert.match(html, /20 बूथ/);
  assert.match(html, /₹2,100/);
  assert.match(html, /टेबल और 2 कुर्सियाँ/);
});

test("mobile validation rejects invalid values", () => {
  const validMobile = /^[6-9]\d{9}$/;
  assert.equal(validMobile.test("9876543210"), true);
  assert.equal(validMobile.test("123"), false);
  assert.equal(validMobile.test("0123456789"), false);
});
