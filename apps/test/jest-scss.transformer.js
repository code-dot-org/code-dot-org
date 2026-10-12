const crypto = require('crypto');
const fs = require('fs');
const scssTransformer = require('jest-scss-transform');
const {getStrippedSource} = require('jest-scss-transform/lib/helpers');
const path = require('path');

const PARTIAL_STATEMENT = /@(?:use|import|forward)\s+([^;]+);/g;
const QUOTED = /['"]([^'"]+)['"]/g;
const DECLARATION = /^\s*(\$[\w-]+)\s*:\s*(.+?)\s*(!default)?\s*;/gm;
const INTERPOLATION = /#\{[^{}]*\}/g;
const INTERPOLATED = '\0';

// The directories the bundlers' sass includePaths name (webpack.config.js).
const INCLUDE_DIRS = [path.join(__dirname, '..', '..', 'shared', 'css')];

const OWN_SOURCE = fs.readFileSync(__filename, 'utf8');

/** The partial file a reference names, or null when none exists. */
function partialPath(fromFile, ref) {
  const base = path.basename(ref, '.scss');
  const dirs = [path.dirname(fromFile), ...INCLUDE_DIRS].map(dir =>
    path.join(dir, path.dirname(ref))
  );
  const candidates = dirs.flatMap(dir => [
    path.join(dir, `_${base}.scss`),
    path.join(dir, `${base}.scss`),
    path.join(dir, base, '_index.scss'),
  ]);
  return candidates.find(fs.existsSync) || null;
}

/** Every partial a stylesheet pulls in, in source order. */
function partialRefs(source) {
  return [...source.matchAll(PARTIAL_STATEMENT)].flatMap(([, statement]) =>
    [...statement.matchAll(QUOTED)].map(([, ref]) => ref)
  );
}

/** Source with comments and brace blocks removed; a variable set inside a
    block is local to it. */
function topLevelSource(source) {
  let stripped = getStrippedSource(source).replace(INTERPOLATION, INTERPOLATED);
  for (let depth = 0; depth < 20 && /\{[^{}]*\}/.test(stripped); depth++) {
    stripped = stripped.replace(/\{[^{}]*\}/g, '');
  }
  return stripped;
}

/** Partials are collected first, so the stylesheet's own declarations
    override theirs; all share one map, namespaces included. */
function collectDeclarations(filename, source, seen = new Set(), found = {}) {
  if (seen.has(filename)) {
    return found;
  }
  seen.add(filename);
  const topLevel = topLevelSource(source);
  for (const ref of partialRefs(topLevel)) {
    const partial = partialPath(filename, ref);
    if (partial) {
      collectDeclarations(
        partial,
        fs.readFileSync(partial, 'utf8'),
        seen,
        found
      );
    }
  }
  for (const [, name, value, isDefault] of topLevel.matchAll(DECLARATION)) {
    if (value.includes(INTERPOLATED)) {
      continue;
    }
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
  for (const ref of partialRefs(source)) {
    const partial = partialPath(filename, ref);
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
    const declared = collectDeclarations(filename, src);
    for (const [key, value] of Object.entries(exported)) {
      let resolved = value;
      for (let hops = 0; hops < 10; hops++) {
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
      .update(OWN_SOURCE);
    for (const file of dependencyFiles(filename)) {
      hash.update(fs.readFileSync(file, 'utf8'));
    }
    hash.update(options?.configString ?? '');
    hash.update(options?.instrument ? 'instrument' : '');
    return hash.digest('hex');
  },
};
