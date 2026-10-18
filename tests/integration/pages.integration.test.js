import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());

describe("website entry points", () => {
  it("contains the main website pages and October event registration", () => {
    const expected = [
      "index.html",
      "team.html",
      "kalash.html",
      "admin-7x9p2.html",
      "october-event-registration.html",
      "october-event-food-admin.html",
      "october-event-stay-admin.html",
    ];

    for (const file of expected) {
      expect(fs.existsSync(path.join(root, file)), `${file} should exist`).toBe(
        true,
      );
    }
  });

  it("includes October event pages in the GitHub Pages build allowlist", () => {
    const buildScript = fs.readFileSync(
      path.join(root, "scripts/build-pages.mjs"),
      "utf8",
    );

    for (const file of [
      "october-event-registration.html",
      "october-event-food-admin.html",
      "october-event-stay-admin.html",
    ]) {
      expect(buildScript, `${file} should be published`).toContain(`"${file}"`);
    }
  });

  it("does not publish retired registration or coordinator pages", () => {
    for (const file of ["registration.html", "coordinator-7x9p2.html"]) {
      expect(
        fs.existsSync(path.join(root, file)),
        file + " should be removed",
      ).toBe(false);
    }
  });
});
