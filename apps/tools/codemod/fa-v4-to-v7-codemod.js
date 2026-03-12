#!/usr/bin/env node

/**
 * Font Awesome v4 → v7 Codemod
 *
 * Directly replaces all v4 icon names, styles, and class names with their v7
 * equivalents across every file type in the codebase.
 *
 * Usage:
 *   node apps/tools/codemod/fa-v4-to-v7-codemod.js --dry-run   # Preview changes
 *   node apps/tools/codemod/fa-v4-to-v7-codemod.js              # Apply changes
 */

const fs = require('fs');
const path = require('path');

// ── CLI flags ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

// ── FA v4 → v7 mapping ──────────────────────────────────────────────────────
// Maps v4 icon names → { name, style } in v7.
// Icons NOT in this map are already v7-compatible and only need the style prefix
// (fa-solid, fa-regular, or fa-brands) applied.

const FA_V4_TO_V7_MAP = {
  // Outline variants (-o suffix) → regular style, drop -o
  'arrow-circle-o-left': {name: 'circle-arrow-left', style: 'regular'},
  'arrow-circle-o-right': {name: 'circle-arrow-right', style: 'regular'},
  'check-square-o': {name: 'square-check', style: 'regular'},
  'circle-o': {name: 'circle', style: 'regular'},
  'circle-thin': {name: 'circle', style: 'regular'},
  'clock-o': {name: 'clock', style: 'regular'},
  'file-pdf-o': {name: 'file-pdf', style: 'regular'},
  'file-text-o': {name: 'file-lines', style: 'regular'},
  'lightbulb-o': {name: 'lightbulb', style: 'regular'},
  'pencil-square-o': {name: 'pen-to-square', style: 'regular'},
  'picture-o': {name: 'image', style: 'regular'},
  'square-o': {name: 'square', style: 'regular'},
  'thumbs-o-down': {name: 'thumbs-down', style: 'regular'},
  'thumbs-o-up': {name: 'thumbs-up', style: 'regular'},
  'trash-o': {name: 'trash-can', style: 'regular'},

  // Renamed icons (solid)
  'angle-double-left': {name: 'angles-left', style: 'solid'},
  'angle-double-right': {name: 'angles-right', style: 'solid'},
  'arrows-alt': {name: 'up-down-left-right', style: 'solid'},
  'arrows-v': {name: 'up-down', style: 'solid'},
  'bar-chart': {name: 'chart-bar', style: 'solid'},
  'chevron-circle-right': {name: 'circle-chevron-right', style: 'solid'},
  close: {name: 'xmark', style: 'solid'},
  cog: {name: 'gear', style: 'solid'},
  edit: {name: 'pen-to-square', style: 'solid'},
  'ellipsis-h': {name: 'ellipsis', style: 'solid'},
  'ellipsis-v': {name: 'ellipsis-vertical', style: 'solid'},
  'exclamation-circle': {name: 'circle-exclamation', style: 'solid'},
  'exclamation-triangle': {name: 'triangle-exclamation', style: 'solid'},
  'external-link': {name: 'arrow-up-right-from-square', style: 'solid'},
  'external-link-square': {name: 'square-arrow-up-right', style: 'solid'},
  'fast-backward': {name: 'backward-fast', style: 'solid'},
  'file-text': {name: 'file-lines', style: 'solid'},
  'info-circle': {name: 'circle-info', style: 'solid'},
  'list-alt': {name: 'rectangle-list', style: 'solid'},
  'minus-square': {name: 'square-minus', style: 'solid'},
  mobile: {name: 'mobile-screen-button', style: 'solid'},
  'mouse-pointer': {name: 'arrow-pointer', style: 'solid'},
  'plus-circle': {name: 'circle-plus', style: 'solid'},
  'plus-square': {name: 'square-plus', style: 'solid'},
  'question-circle': {name: 'circle-question', style: 'solid'},
  refresh: {name: 'arrows-rotate', style: 'solid'},
  repeat: {name: 'rotate-right', style: 'solid'},
  search: {name: 'magnifying-glass', style: 'solid'},
  'search-minus': {name: 'magnifying-glass-minus', style: 'solid'},
  'sign-out': {name: 'right-from-bracket', style: 'solid'},
  times: {name: 'xmark', style: 'solid'},
  'times-circle': {name: 'circle-xmark', style: 'solid'},
  undo: {name: 'rotate-left', style: 'solid'},
  'video-camera': {name: 'video', style: 'solid'},
  'volume-off': {name: 'volume-xmark', style: 'solid'},
  warning: {name: 'triangle-exclamation', style: 'solid'},

  // Brand icons → brands style
  facebook: {name: 'facebook-f', style: 'brands'},
  twitter: {name: 'x-twitter', style: 'brands'},
};

// ── Style prefix map ─────────────────────────────────────────────────────────

const STYLE_PREFIX = {
  solid: 'fa-solid',
  regular: 'fa-regular',
  brands: 'fa-brands',
};

// ── File discovery ───────────────────────────────────────────────────────────

const EXTENSIONS = new Set([
  '.jsx',
  '.tsx',
  '.js',
  '.ts',
  '.haml',
  '.erb',
  '.html',
  '.scss',
  '.css',
  '.rb',
  '.script_json',
  '.json',
]);

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.claude',
  'pegasus',
  'vendor',
]);

const EXCLUDE_FILES = new Set(['icons.js', 'fa-v4-to-v7-codemod.js']);

const ROOT = path.resolve(__dirname, '..', '..', '..');

// ── Counters / logs ──────────────────────────────────────────────────────────

let totalFilesScanned = 0;
let totalFilesModified = 0;
let totalReplacements = 0;
const manualReviewItems = [];
const changeLog = []; // {file, changes: [{line, before, after}]}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveIcon(v4Name) {
  const mapped = FA_V4_TO_V7_MAP[v4Name];
  if (mapped) {
    return {name: mapped.name, style: mapped.style};
  }
  // Not in the map — already v7-compatible, default to solid
  return {name: v4Name, style: 'solid'};
}

function isAlreadyV7(line) {
  return /\bfa-(solid|regular|brands|duotone)\b/.test(line);
}

/**
 * Detect dynamic/conditional icon usage that cannot be auto-codemoded.
 */
function hasDynamicIcon(line) {
  // Ternary in icon prop: icon={condition ? 'x' : 'y'}
  if (/icon=\{[^}]*\?[^}]*\}/.test(line)) return true;
  // Variable in icon prop: icon={variable}
  if (/icon=\{[a-zA-Z_][a-zA-Z0-9_.[\]]*\}/.test(line)) return true;
  // Ternary in className with fa fa-: className={... ? 'fa fa-...' : 'fa fa-...'}
  if (/className=\{[^}]*\?[^}]*fa fa-[^}]*\}/.test(line)) return true;
  // Ternary in iconClass: iconClass={... ? ... : ...}
  if (/iconClass=\{[^}]*\?[^}]*\}/.test(line)) return true;
  return false;
}

// ── Pattern handlers ─────────────────────────────────────────────────────────

/**
 * Pattern A: <FontAwesome icon="iconName" />
 * Replaces icon name and adds style="regular" or style="brands" if needed.
 * Does NOT touch FontAwesomeV6Icon.
 */
function handleFontAwesomeComponent(line) {
  // Skip FontAwesomeV6Icon
  if (/FontAwesomeV6Icon/.test(line)) return line;
  // Skip if no FontAwesome component
  if (!/FontAwesome\s/.test(line) && !/FontAwesome$/.test(line)) return line;

  return line.replace(
    /(<FontAwesome\s[^>]*?)icon=["']([a-z0-9-]+)["']([^>]*?)(\/?>)/g,
    (match, before, iconName, after, closing) => {
      const resolved = resolveIcon(iconName);
      if (resolved.name === iconName && resolved.style === 'solid') {
        return match; // No change needed
      }

      let result = `${before}icon="${resolved.name}"`;

      // Add style prop if not solid (solid is the default)
      if (resolved.style !== 'solid') {
        // Check if style prop already exists
        const combined = before + after;
        if (!/\bstyle=/.test(combined)) {
          result += ` style="${resolved.style}"`;
        }
      }

      result += `${after}${closing}`;
      return result;
    }
  );
}

/**
 * Pattern B, E, F, G, H: CSS class pattern "fa fa-iconName"
 * Replaces with "fa-{style} fa-{v7name}", preserving modifiers.
 *
 * Works in JSX strings, HTML class attributes, Ruby strings, JSON, etc.
 */
function handleCssClassPattern(line) {
  // Match "fa fa-{iconName}" possibly followed by modifiers
  // The \b before "fa" prevents matching "sofa" etc.
  return line.replace(/\bfa\s+fa-([a-z0-9-]+)/g, (match, iconName) => {
    const resolved = resolveIcon(iconName);
    return `${STYLE_PREFIX[resolved.style]} fa-${resolved.name}`;
  });
}

/**
 * Pattern C: HAML chained class syntax: .fa.fa-iconName
 * Replaces with .fa-{style}.fa-{v7name}
 */
function handleHamlChainedClasses(line) {
  return line.replace(/\.fa\.fa-([a-z0-9-]+)/g, (match, iconName) => {
    const resolved = resolveIcon(iconName);
    return `.${STYLE_PREFIX[resolved.style]}.fa-${resolved.name}`;
  });
}

// ── Per-file processing ──────────────────────────────────────────────────────

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const ext = path.extname(filePath);
  const isHaml = ext === '.haml';
  const relPath = path.relative(ROOT, filePath);
  const fileChanges = [];

  const newLines = lines.map((line, idx) => {
    const lineNum = idx + 1;

    // Skip lines that are already v7
    if (isAlreadyV7(line)) return line;

    // Detect dynamic icons — flag for manual review
    if (hasDynamicIcon(line)) {
      manualReviewItems.push({
        file: relPath,
        line: lineNum,
        content: line.trim(),
      });
      return line;
    }

    let newLine = line;

    // Pattern A: FontAwesome component (JSX/TSX only)
    if (ext === '.jsx' || ext === '.tsx' || ext === '.js' || ext === '.ts') {
      newLine = handleFontAwesomeComponent(newLine);
    }

    // Pattern C: HAML chained classes (must be before Pattern B to avoid double-processing)
    if (isHaml) {
      newLine = handleHamlChainedClasses(newLine);
    }

    // Pattern B, D, E, F, G, H: CSS class pattern "fa fa-iconName"
    // This handles all string contexts: JSX, HTML, Ruby, JSON, SCSS, etc.
    newLine = handleCssClassPattern(newLine);

    if (newLine !== line) {
      fileChanges.push({
        line: lineNum,
        before: line.trim(),
        after: newLine.trim(),
      });
    }

    return newLine;
  });

  if (fileChanges.length === 0) return;

  totalFilesModified++;
  totalReplacements += fileChanges.length;
  changeLog.push({file: relPath, changes: fileChanges});

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  }
}

// ── File walker ──────────────────────────────────────────────────────────────

function walkDir(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, {withFileTypes: true});
  } catch {
    return;
  }

  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    if (EXCLUDE_FILES.has(entry.name)) continue;

    const ext = path.extname(entry.name);
    if (!EXTENSIONS.has(ext)) continue;

    // For .json files, only process locale files and script_json
    if (ext === '.json') {
      const relPath = path.relative(ROOT, fullPath);
      const isLocale =
        relPath.includes('i18n/') ||
        relPath.includes('locales/') ||
        relPath.includes('locale/');
      if (!isLocale) continue;
    }

    totalFilesScanned++;
    processFile(fullPath);
  }
}

// ── FontAwesomeV6Icon bug fixes ──────────────────────────────────────────────

function fixFontAwesomeV6IconBugs() {
  const filePath = path.join(
    ROOT,
    'apps/src/signUpFlow/LoginTypeSelection.tsx'
  );

  if (!fs.existsSync(filePath)) {
    console.log(
      '⚠  LoginTypeSelection.tsx not found — skipping V6Icon bug fixes'
    );
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const relPath = 'apps/src/signUpFlow/LoginTypeSelection.tsx';
  const fixes = [];

  // Fix: iconName="brands fa-google" → iconFamily="brands" iconName="google"
  const fix1 = content.replace(
    /iconName="brands fa-google"/g,
    'iconFamily="brands" iconName="google"'
  );
  if (fix1 !== content) {
    fixes.push('brands fa-google → iconFamily="brands" iconName="google"');
    content = fix1;
  }

  // Fix: iconName="brands fa-microsoft" → iconFamily="brands" iconName="microsoft"
  const fix2 = content.replace(
    /iconName="brands fa-microsoft"/g,
    'iconFamily="brands" iconName="microsoft"'
  );
  if (fix2 !== content) {
    fixes.push(
      'brands fa-microsoft → iconFamily="brands" iconName="microsoft"'
    );
    content = fix2;
  }

  // Fix: iconName="kit fa-clever" → iconFamily="kit" iconName="clever"
  const fix3 = content.replace(
    /iconName="kit fa-clever"/g,
    'iconFamily="kit" iconName="clever"'
  );
  if (fix3 !== content) {
    fixes.push('kit fa-clever → iconFamily="kit" iconName="clever"');
    content = fix3;
  }

  if (fixes.length > 0) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    changeLog.push({
      file: relPath,
      changes: fixes.map(f => ({
        line: '(V6Icon fix)',
        before: f.split(' → ')[0],
        after: f.split(' → ')[1],
      })),
    });
    totalFilesModified++;
    totalReplacements += fixes.length;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`\nFont Awesome v4 → v7 Codemod`);
console.log(
  `Mode: ${DRY_RUN ? 'DRY RUN (no files will be modified)' : 'APPLY'}\n`
);

// Run the main codemod
walkDir(ROOT);

// Fix known FontAwesomeV6Icon bugs
fixFontAwesomeV6IconBugs();

// ── Output ───────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(70)}`);
console.log(`  SUMMARY`);
console.log(`${'═'.repeat(70)}`);
console.log(`  Files scanned:  ${totalFilesScanned}`);
console.log(`  Files modified: ${totalFilesModified}`);
console.log(`  Replacements:   ${totalReplacements}`);
console.log(`${'═'.repeat(70)}\n`);

// Per-file change log
if (changeLog.length > 0) {
  console.log(`\n── Changes ${DRY_RUN ? '(would be made)' : 'made'} ──\n`);
  for (const entry of changeLog) {
    console.log(
      `📄 ${entry.file} (${entry.changes.length} change${
        entry.changes.length > 1 ? 's' : ''
      })`
    );
    if (VERBOSE) {
      for (const c of entry.changes) {
        console.log(`   L${c.line}:`);
        console.log(`   - ${c.before}`);
        console.log(`   + ${c.after}`);
      }
    }
  }
}

// Manual review items
if (manualReviewItems.length > 0) {
  console.log(
    `\n── Flagged for manual review (${manualReviewItems.length} items) ──\n`
  );
  for (const item of manualReviewItems) {
    console.log(`  ⚠  ${item.file}:${item.line}`);
    console.log(`     ${item.content}`);
  }
}

if (DRY_RUN) {
  console.log(
    '\n✅ Dry run complete. Run without --dry-run to apply changes.\n'
  );
} else {
  console.log('\n✅ Codemod applied successfully.\n');
}
