// Deletes build output left behind by earlier builds.
//
// Minified builds write content-hashed bundles ([name]wp<hash>.min.js) to
// build/package/js and never remove the previous build's files, so every
// rebuild leaves the files it replaced behind on disk.  Left alone this
// grows the directory by the full bundle size per build; one development
// machine reached 16GB twice.  Content hashing has worked this way since
// PR #30901 (2019), and CI builds in fresh workspaces, so only long-lived
// development checkouts accumulate anything.
//
// Two rules, because the two kinds of output can be told apart in
// different ways.
//
// Bundles at the top level: entry and chunk names are unique within a
// build, so once the hash is stripped from the filename, every file but
// the newest under a given name was replaced by a later build.  Callers
// run this before building rather than after, so that a build currently
// being served out of this directory keeps working while its replacement
// compiles, and so that anything deleted which the new build still wants
// is simply written again.
//
// Hashed files in subdirectories (images/, json/, media/, and hashed i18n
// and lib copies): these accumulate slowly, because an asset's hash only
// changes when its content does.  Newest-wins cannot be used on them --
// two different source files with the same basename, say two canvas.svg,
// produce the same filename once the hash is stripped, so both may still
// be in use -- and modification time cannot separate the live files from
// the replaced ones on its own, because webpack skips rewriting an output
// whose content has not changed.  What makes an age rule safe is the
// build that runs next: a full production build writes every hashed
// output it still references, with the same content, hash and filename,
// so deleting old files first only permanently removes the ones nothing
// references any more.  Callers therefore pass pruneSubdirs only for a
// full production build.  A --app build compiles a subset and would not
// restore other apps' files, and a development build does not write every
// hashed form.

const fs = require('fs');
const path = require('path');

// Hash lengths seen in build output: 16, 20 (the webpack default), and 32.
const HASHED = /^(.*)wp[0-9a-f]{16,32}(\..+)$/;

const DEFAULT_SUBDIR_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * @param {string} root - directory to prune, usually build/package/js
 * @param {Object} [options]
 * @param {boolean} [options.pruneSubdirs] - also delete hashed files below
 *   the top level once they pass maxAgeMs.  Only safe ahead of a full
 *   production build; see above.
 * @param {number} [options.maxAgeMs] - age limit for subdirectory files
 * @param {number} [options.now] - current time, injectable for tests
 * @returns {{count: number, bytes: number}} what was deleted
 */
function pruneStaleHashedOutput(root, options = {}) {
  const {
    pruneSubdirs = false,
    maxAgeMs = DEFAULT_SUBDIR_MAX_AGE_MS,
    now = Date.now(),
  } = options;
  if (!fs.existsSync(root)) {
    return {count: 0, bytes: 0};
  }
  const subdirCutoff = now - maxAgeMs;
  const hashedFiles = [];
  const newestByName = new Map();
  (function walk(dir, topLevel) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (pruneSubdirs) {
          walk(full, false);
        }
      } else if (entry.isFile()) {
        const match = HASHED.exec(entry.name);
        if (match) {
          const {mtimeMs, size} = fs.statSync(full);
          const name = topLevel ? match[1] + match[2] : null;
          hashedFiles.push({full, mtimeMs, size, topLevel, name});
          if (topLevel) {
            newestByName.set(
              name,
              Math.max(mtimeMs, newestByName.get(name) ?? 0)
            );
          }
        }
      }
    }
  })(root, true);

  let count = 0;
  let bytes = 0;
  for (const file of hashedFiles) {
    // Top level: the strict comparison keeps files that tie, because two
    // written in the same millisecond give no way to tell which one the
    // current build produced, and keeping both is always safe.
    // Subdirectories: age alone decides, per above.
    const replaced = file.topLevel
      ? file.mtimeMs < newestByName.get(file.name)
      : file.mtimeMs < subdirCutoff;
    if (replaced) {
      fs.unlinkSync(file.full);
      count++;
      bytes += file.size;
    }
  }
  return {count, bytes};
}

/** Renders a byte count for the build log, e.g. "171MB" or "1KB". */
function formatBytes(bytes) {
  const megabytes = bytes / 1024 / 1024;
  return megabytes >= 1
    ? `${Math.round(megabytes)}MB`
    : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

module.exports = {pruneStaleHashedOutput, formatBytes};
