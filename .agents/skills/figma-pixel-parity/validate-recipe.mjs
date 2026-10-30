#!/usr/bin/env node
// Usage: node .agents/skills/figma-pixel-parity/validate-recipe.mjs <recipe.json>
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// ajv and ajv-formats are transitive dependencies of frontend/, not direct ones.
const require = createRequire(join(here, "../../../frontend/package.json"));

const recipePath = process.argv[2];
if (!recipePath) {
  console.error("usage: validate-recipe.mjs <recipe.json>");
  process.exit(2);
}

let Ajv2020, addFormats;
try {
  Ajv2020 = require("ajv/dist/2020").default;
  addFormats = require("ajv-formats").default;
} catch {
  console.error(
    "ajv or ajv-formats not found; run `yarn install` in frontend/",
  );
  process.exit(2);
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(readJson(join(here, "visual-recipe.schema.json")));

if (validate(readJson(resolve(recipePath)))) {
  console.log(`ok ${recipePath}`);
} else {
  for (const error of validate.errors) {
    console.error(`${error.instancePath || "/"} ${error.message}`);
  }
  process.exit(1);
}
