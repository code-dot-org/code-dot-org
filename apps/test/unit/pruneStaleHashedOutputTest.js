/** @file Tests for script/pruneStaleHashedOutput.js */
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  pruneStaleHashedOutput,
  formatBytes,
} = require('../../script/pruneStaleHashedOutput');

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 0, 15);

// Hash lengths the build actually produces: 16, 20 and 32 hex characters.
const HASH_16 = 'f'.repeat(16);
const HASH_20_OLD = 'a'.repeat(20);
const HASH_20_NEW = 'b'.repeat(20);
const HASH_32 = 'c'.repeat(32);

let root;

/** Writes `name` with the given size and age, creating parent directories. */
function writeFile(name, ageDays, size = 10) {
  const full = path.join(root, name);
  fs.mkdirSync(path.dirname(full), {recursive: true});
  fs.writeFileSync(full, 'x'.repeat(size));
  const time = new Date(NOW - ageDays * DAY_MS);
  fs.utimesSync(full, time, time);
  return full;
}

function exists(name) {
  return fs.existsSync(path.join(root, name));
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'prune-stale-hashed-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

describe('pruneStaleHashedOutput', () => {
  it('keeps only the newest bundle under a given name', () => {
    writeFile(`applabwp${HASH_20_OLD}.min.js`, 2);
    writeFile(`applabwp${HASH_20_NEW}.min.js`, 1);

    const {count} = pruneStaleHashedOutput(root, {now: NOW});

    expect(count).toBe(1);
    expect(exists(`applabwp${HASH_20_OLD}.min.js`)).toBe(false);
    expect(exists(`applabwp${HASH_20_NEW}.min.js`)).toBe(true);
  });

  it('deletes source maps belonging to a replaced bundle', () => {
    writeFile(`applabwp${HASH_20_OLD}.min.js.map`, 2);
    writeFile(`applabwp${HASH_20_NEW}.min.js.map`, 1);

    pruneStaleHashedOutput(root, {now: NOW});

    expect(exists(`applabwp${HASH_20_OLD}.min.js.map`)).toBe(false);
    expect(exists(`applabwp${HASH_20_NEW}.min.js.map`)).toBe(true);
  });

  it('recognizes every hash length the build emits', () => {
    writeFile(`301wp${HASH_16}.min.js`, 9);
    writeFile(`301wp${HASH_20_OLD}.min.js`, 3);
    writeFile(`301wp${HASH_32}.min.js`, 1);

    const {count} = pruneStaleHashedOutput(root, {now: NOW});

    expect(count).toBe(2);
    expect(exists(`301wp${HASH_32}.min.js`)).toBe(true);
  });

  it('keeps a lone bundle however old, since nothing replaced it', () => {
    writeFile(`999wp${HASH_20_OLD}.min.js`, 400);

    const {count} = pruneStaleHashedOutput(root, {now: NOW});

    expect(count).toBe(0);
    expect(exists(`999wp${HASH_20_OLD}.min.js`)).toBe(true);
  });

  it('keeps both bundles when their timestamps tie', () => {
    writeFile(`tiewp${HASH_20_OLD}.min.js`, 5);
    writeFile(`tiewp${HASH_20_NEW}.min.js`, 5);

    const {count} = pruneStaleHashedOutput(root, {now: NOW});

    expect(count).toBe(0);
  });

  it('never touches files without a hash in their name', () => {
    writeFile('applab.js', 100);
    writeFile('webpack-runtime.min.js', 100);
    writeFile('media/blockly/sprite.png', 400);
    // 15 hex characters is too short to be one of our hashes.
    writeFile(`shortwp${'e'.repeat(15)}.min.js`, 60);

    const {count} = pruneStaleHashedOutput(root, {
      pruneSubdirs: true,
      now: NOW,
    });

    expect(count).toBe(0);
  });

  it('reports the number and size of the files it deleted', () => {
    writeFile(`applabwp${HASH_20_OLD}.min.js`, 2, 4096);
    writeFile(`applabwp${HASH_20_NEW}.min.js`, 1, 4096);

    expect(pruneStaleHashedOutput(root, {now: NOW})).toEqual({
      count: 1,
      bytes: 4096,
    });
  });

  it('returns zero for a directory that does not exist', () => {
    expect(
      pruneStaleHashedOutput(path.join(root, 'missing'), {now: NOW})
    ).toEqual({count: 0, bytes: 0});
  });

  describe('subdirectories', () => {
    it('deletes hashed files past the age limit when asked', () => {
      writeFile(`images/canvaswp${HASH_20_OLD}.svg`, 40);
      writeFile(`json/animationswp${HASH_20_OLD}.json`, 31);
      writeFile(`media/skins/foo/walkwp${HASH_32}.png`, 90);

      const {count} = pruneStaleHashedOutput(root, {
        pruneSubdirs: true,
        now: NOW,
      });

      expect(count).toBe(3);
    });

    it('keeps hashed files within the age limit', () => {
      writeFile(`images/canvaswp${HASH_20_NEW}.svg`, 1);
      writeFile(`media/skins/foo/walkwp${HASH_32}.png`, 29);

      const {count} = pruneStaleHashedOutput(root, {
        pruneSubdirs: true,
        now: NOW,
      });

      expect(count).toBe(0);
    });

    it('keeps recent files that share a name, since both may be in use', () => {
      // Two different source files can share a basename, so once the hash
      // is stripped they collide; newest-wins would delete a live file.
      writeFile(`images/canvaswp${HASH_16}.svg`, 3);
      writeFile(`images/canvaswp${HASH_20_OLD}.svg`, 8);

      const {count} = pruneStaleHashedOutput(root, {
        pruneSubdirs: true,
        now: NOW,
      });

      expect(count).toBe(0);
    });

    it('leaves subdirectories alone unless pruneSubdirs is set', () => {
      writeFile(`images/canvaswp${HASH_20_OLD}.svg`, 400);

      const {count} = pruneStaleHashedOutput(root, {now: NOW});

      expect(count).toBe(0);
      expect(exists(`images/canvaswp${HASH_20_OLD}.svg`)).toBe(true);
    });

    it('honors a caller-supplied age limit', () => {
      writeFile(`images/canvaswp${HASH_20_OLD}.svg`, 10);

      const {count} = pruneStaleHashedOutput(root, {
        pruneSubdirs: true,
        maxAgeMs: 7 * DAY_MS,
        now: NOW,
      });

      expect(count).toBe(1);
    });
  });
});

describe('formatBytes', () => {
  it('reports megabytes at or above one megabyte', () => {
    expect(formatBytes(179306496)).toBe('171MB');
    expect(formatBytes(1024 * 1024)).toBe('1MB');
  });

  it('reports kilobytes below one megabyte, never zero', () => {
    expect(formatBytes(4096)).toBe('4KB');
    expect(formatBytes(10)).toBe('1KB');
  });
});
