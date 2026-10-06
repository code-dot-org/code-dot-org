const crypto = require('crypto');
const fs = require('fs');
const scssTransformer = require('jest-scss-transform');
const {getStrippedSource} = require('jest-scss-transform/lib/helpers');
const path = require('path');

const PARTIAL_REF = /@(?:use|import|forward)\s+['"]([^'"]+)['"]/g;
const DECLARATION = /^\s*(\$[\w-]+)\s*:\s*(.+?)\s*(!default)?\s*;/gm;

/** The partial file a reference names, or null when none exists. */
function partialPath(fromFile, ref) {
  const dir = path.join(path.dirname(fromFile), path.dirname(ref));
  const base = path.basename(ref, '.scss');
  const candidates = [
    path.join(dir, `_${base}.scss`),
    path.join(dir, `${base}.scss`),
    path.join(dir, base, '_index.scss'),
  ];
  return candidates.find(fs.existsSync) || null;
}

/** The source with comments and every brace-delimited block removed:
    a variable set inside a block is local to it. */
function topLevelSource(source) {
  let stripped = getStrippedSource(source);
  for (let depth = 0; depth < 20 && /\{[^{}]*\}/.test(stripped); depth++) {
    stripped = stripped.replace(/\{[^{}]*\}/g, '');
  }
  return stripped;
}

/** Variable values in a stylesheet and the partials it pulls in. A later
    plain declaration replaces an earlier one; !default sets only an unset
    variable; the stylesheet's own declarations win over its partials'. */
function collectDeclarations(filename, seen = new Set(), found = {}) {
  if (seen.has(filename)) {
    return found;
  }
  seen.add(filename);
  const source = topLevelSource(fs.readFileSync(filename, 'utf8'));
  for (const match of source.matchAll(PARTIAL_REF)) {
    const partial = partialPath(filename, match[1]);
    if (partial) {
      collectDeclarations(partial, seen, found);
    }
  }
  for (const [, name, value, isDefault] of source.matchAll(DECLARATION)) {
    if (!isDefault || !(name in found)) {
      found[name] = value;
    }
  }
  return found;
}

/** The stylesheet and every partial it pulls in. */
function dependencyFiles(filename, seen = new Set()) {
  if (seen.has(filename) || !fs.existsSync(filename)) {
    return seen;
  }
  seen.add(filename);
  const source = getStrippedSource(fs.readFileSync(filename, 'utf8'));
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
    // ("$slider-width"), not its value.
    let exported;
    try {
      exported = JSON.parse(
        transformed.code.slice('module.exports = '.length, -1)
      );
    } catch {
      return transformed;
    }
    const declared = collectDeclarations(filename);
    for (const [key, value] of Object.entries(exported)) {
      let resolved = value;
      for (let hops = 0; hops < 10; hops++) {
        // guide.$padding and $padding name the same variable.
        const name = resolved.replace(/^[\w-]+\.(?=\$)/, '');
        if (!(name in declared)) {
          break;
        }
        resolved = declared[name];
      }
      exported[key] = resolved;
    }
    return {code: `module.exports = ${JSON.stringify(exported)};`};
  },

  getCacheKey(src, filename, options) {
    const hash = crypto
      .createHash('sha1')
      .update(src)
      .update(filename)
      .update(fs.readFileSync(__filename, 'utf8'));
    for (const file of dependencyFiles(filename)) {
      hash.update(fs.readFileSync(file, 'utf8'));
    }
    hash.update(options?.configString ?? '');
    hash.update(options?.instrument ? 'instrument' : '');
    return hash.digest('hex');
  },
};
