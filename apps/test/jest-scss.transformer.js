const crypto = require('crypto');
const fs = require('fs');
const scssTransformer = require('jest-scss-transform');
const path = require('path');

// Partials a stylesheet pulls in: @use 'x', @import 'x', @forward 'x'.
const PARTIAL_REF = /@(?:use|import|forward)\s+['"]([^'"]+)['"]/g;
// A top-level variable declaration: $name: value; (!default allowed).
const DECLARATION = /^\s*(\$[\w-]+)\s*:\s*(.+?)\s*(?:!default)?\s*;/gm;

/** The partial file a reference names, or null when none exists. */
function partialPath(fromFile, ref) {
  const dir = path.dirname(fromFile);
  const base = path.basename(ref);
  const candidates = [
    path.join(dir, path.dirname(ref), `_${base}.scss`),
    path.join(dir, path.dirname(ref), `${base}.scss`),
    path.join(dir, ref, '_index.scss'),
  ];
  return candidates.find(fs.existsSync) || null;
}

/** Variable declarations in a stylesheet and the partials it pulls in. */
function collectDeclarations(filename, seen = new Set(), found = {}) {
  if (seen.has(filename)) {
    return found;
  }
  seen.add(filename);
  const source = fs.readFileSync(filename, 'utf8');
  for (const match of source.matchAll(DECLARATION)) {
    found[match[1]] ??= match[2];
  }
  for (const match of source.matchAll(PARTIAL_REF)) {
    const partial = partialPath(filename, match[1]);
    if (partial) {
      collectDeclarations(partial, seen, found);
    }
  }
  return found;
}

/** Files whose contents decide this stylesheet's exports. */
function dependencyFiles(filename, seen = new Set()) {
  if (seen.has(filename) || !fs.existsSync(filename)) {
    return seen;
  }
  seen.add(filename);
  const source = fs.readFileSync(filename, 'utf8');
  for (const match of source.matchAll(PARTIAL_REF)) {
    const partial = partialPath(filename, match[1]);
    if (partial) {
      dependencyFiles(partial, seen);
    }
  }
  return seen;
}

module.exports = {
  process(src, filename) {
    const transformed = scssTransformer.process(src, filename);

    // For SCSS files that do not have any constants, proxy their key for consistent class names
    // See identity-obj-proxy for more details
    if (transformed.code === 'module.exports = {};') {
      return {
        code: `module.exports = require('identity-obj-proxy')`,
      };
    }

    // jest-scss-transform exports each value as the variable's name
    // ("$slider-width"), so code that parses a number out of it gets NaN.
    // Resolve names declared in this file or in the partials it uses.
    const exported = JSON.parse(
      transformed.code.slice('module.exports = '.length, -1)
    );
    const declared = collectDeclarations(filename);
    for (const [key, value] of Object.entries(exported)) {
      let resolved = value;
      for (let hops = 0; hops < 10 && declared[resolved]; hops++) {
        resolved = declared[resolved];
      }
      exported[key] = resolved;
    }
    return {code: `module.exports = ${JSON.stringify(exported)};`};
  },

  // Partials feed the exports, so their contents belong in the cache key.
  getCacheKey(src, filename, options) {
    const hash = crypto.createHash('sha1').update(src).update(filename);
    for (const file of dependencyFiles(filename)) {
      hash.update(fs.readFileSync(file, 'utf8'));
    }
    hash.update(options?.configString ?? '');
    return hash.digest('hex');
  },
};
