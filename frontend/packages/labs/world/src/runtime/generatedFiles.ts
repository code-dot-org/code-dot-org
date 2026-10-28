// Generated JavaScript, kept between compiles.
//
// A `.rule` / `.actor` / `.screen` file is Blockly JSON that has to become a
// module before esbuild sees it, and generating one means loading it into a
// headless workspace and walking it. That is the expensive part of a compile —
// the default project's two large rules are a quarter of a second between them
// — and almost none of it is work that needs doing twice: editing one file
// leaves the other six byte-identical.
//
// So a generated module is cached under what it was generated FROM. Three
// things go into that key:
//
//   - the file's own path and contents, the obvious part;
//   - the project's module layout — the sorted list of its file paths; and
//   - the ENVIRONMENT the generator reads (`blockly/projectDropdowns`).
//
// The last two are not obvious, and they are the reason this is a key rather
// than a plain path→JS map. A block that says `use rule Gravity` names a rule,
// not a file; generation resolves the name to whatever module currently holds
// it (`ruleRegistry`). Move that rule to another file and this file's contents
// have not changed, but its generated import has. A rename needs nothing
// special: renaming a rule rewrites every file that refers to it, so their
// contents — and their keys — change with it.
//
// The environment is that argument taken to its conclusion, and leaving it out
// was a bug with a long tail. The game's module emits `world.useRules` from the
// project's rule modules and `world.useImageSizes` from what the editor has
// MEASURED — neither of which is in this file, or in any file. An image served
// from the assets backend is measured only once it has decoded, which lands in
// a render of its own: no file changed, so every key was a hit, and the world
// went on compiling to a module that never learnt how big its pictures were.
// The engine then read those actors as the fallback 32-by-32 box
// (`rules/stock/collisions`), so a player dropped onto a wide ground tile fell
// straight past it. Only a page reload fixed it, because only a page reload
// emptied this map.

/** Turn one Blockly file into a module. Throws on malformed input. */
export type Generate = (contents: string, path: string) => string;

export interface GeneratedFileCache {
  /**
   * Every file, with the Blockly ones replaced by their generated JavaScript.
   *
   * `isBlockly` decides which those are; everything else is passed through
   * untouched.
   */
  generateAll(
    files: Record<string, string>,
    isBlockly: (path: string) => boolean,
    generate: Generate,
    /**
     * What the generator reads BESIDES the file — the installed project
     * registries, as one comparable string (`generationEnvironment`).
     *
     * Passed in rather than read here: this module knows about caching and
     * nothing about Blockly. The default is the empty string, which is what a
     * caller whose generator reads nothing else gives it.
     */
    environment?: string,
  ): Record<string, string>;
  /** How many files the last call had to generate. For tests and for measuring. */
  readonly lastMisses: number;
}

export function createGeneratedFileCache(): GeneratedFileCache {
  let cache = new Map<string, string>();
  let lastMisses = 0;

  return {
    get lastMisses() {
      return lastMisses;
    },
    generateAll(files, isBlockly, generate, environment = '') {
      const layout = Object.keys(files).sort().join('\n');
      // Rebuilt rather than pruned: a file that is gone should take its entry
      // with it, and this is one pass instead of two.
      const next = new Map<string, string>();
      const out: Record<string, string> = {};
      let misses = 0;
      for (const [path, contents] of Object.entries(files)) {
        if (!isBlockly(path)) {
          out[path] = contents;
          continue;
        }
        const key = `${environment}\0${layout}\0${path}\0${contents}`;
        let js = cache.get(key);
        if (js === undefined) {
          // Not caught: a malformed file is the caller's to report, and a
          // failed generation must not be remembered as an answer.
          js = generate(contents, path);
          misses++;
        }
        next.set(key, js);
        out[path] = js;
      }
      cache = next;
      lastMisses = misses;
      return out;
    },
  };
}
