// Lab capability documents fed into the AI Tutor's and lesson generator's
// system prompts.  Everything that can be is derived from the same source
// files the lab itself uses, so the docs never drift from what the student
// will actually see in front of them:
//
//   - Music Lab block list comes from the toolboxBlocks catalog used by
//     the Blockly toolbox, filtered through the default SIMPLE2 mode
//     category-blocks map (the mode AI Lessons projects boot into).
//   - Web Lab 2's allowed network/image/font hostnames come straight from
//     the generated sharedConstants the CSP layer enforces.
//
// Note: importing music/* eagerly evaluates `musicI18n.*` at module load,
// so every AI Lessons haml page must load `music_locale.js` (and the other
// locale chunks that music's transitive deps require — lab2, codebridge,
// pythonlab) for the bundle to parse cleanly.
//
// Two entry points:
//   getCapabilitiesMarkdownAll() — used by the generator, which picks
//     across lab types when shaping a lesson.
//   getCapabilitiesMarkdownFor(labType) — used by the tutor on each turn
//     so it only sees what the current checkpoint's lab can actually do.

import {defaultMaps} from '@cdo/apps/music/blockly/toolbox/definitions';
import toolboxBlocks from '@cdo/apps/music/blockly/toolbox/toolboxBlocks';
import {BlockMode} from '@cdo/apps/music/constants';
import {
  AllowedFontHostnames,
  AllowedHostnameSuffixes,
  AllowedImageHostnameSuffixes,
} from '@cdo/generated-scripts/sharedConstants';

import {LabType} from './types';

// ---- Music ----

function musicCapabilities(): string {
  const simple2 = defaultMaps[BlockMode.SIMPLE2];
  const lines: string[] = [
    'Music Lab — a block-based Blockly workspace where students stack',
    '  blocks under a `when_run` trigger to compose a song.  The default',
    '  block mode is SIMPLE2.  Sounds come from a "library" (default:',
    '  launch2024) and an optional sound "pack" the student selects in-app.',
    '',
    'Blocks available in the toolbox (grouped by category):',
  ];
  for (const category of Object.keys(simple2) as Array<keyof typeof simple2>) {
    const blockTypes = simple2[category] ?? [];
    if (blockTypes.length === 0) continue;
    lines.push(`  ${category}:`);
    for (const blockType of blockTypes) {
      const entry = toolboxBlocks[blockType as string];
      const label =
        entry && entry.levelbuilderText && entry.levelbuilderText !== 'unused'
          ? entry.levelbuilderText
          : blockType;
      lines.push(`    - ${label}  (\`${blockType}\`)`);
    }
  }
  lines.push('');
  lines.push(
    'Do NOT reference blocks outside this list — if a feature would need a'
  );
  lines.push(
    'block that does not exist (e.g. "play MIDI", "import wav"), ask the'
  );
  lines.push('student to do it a different way.');
  return lines.join('\n');
}

// ---- Web Lab 2 ----

function weblab2Capabilities(): string {
  const fetchHosts = AllowedHostnameSuffixes.map(h => `    - ${h}`).join('\n');
  const imgHosts = AllowedImageHostnameSuffixes.map(h => `    - ${h}`).join(
    '\n'
  );
  const fontHosts = AllowedFontHostnames.map(h => `    - ${h}`).join('\n');
  return `Web Lab 2 — a beginner HTML/CSS/JS editor.  Students edit files
  like index.html, style.css, and script.js and the result renders in a
  live preview iframe.

HTML and CSS are wide-open: nearly any tag/property students could
  reasonably want is permitted.  JavaScript runs but is sandboxed by a
  Content Security Policy enforced at the iframe level:
  - The iframe is sandboxed with allow-scripts, allow-same-origin,
    allow-forms.  No popups, no top-level navigation, no downloads.
  - script-src allows inline scripts and eval (for student-friendly
    debugging).
  - Some levels disable scripts entirely (predict levels); when scripts
    are disabled, no <script> tag runs.

Network access from student JS is restricted:
  - fetch() / XMLHttpRequest may target ONLY these hostname suffixes:
${fetchHosts}
  - <img> sources are limited to:
${imgHosts}
  - Web fonts are limited to:
${fontHosts}
  - Any other origin is CSP-blocked.  If a checkpoint needs network
    data, pick an API from the fetch list above.

Console output (console.log/warn/error) and uncaught JS errors are
  captured back to the parent — the tutor sees them in the student work
  snapshot when present.`;
}

// ---- Panels ----

function panelsCapabilities(): string {
  return `Panels — a non-interactive slide carousel.  Each panel shows a
  single caption.  No code, no inputs.  Used for instructional setup,
  mid-lesson explanations, or recap.  The student's only action is
  pressing Continue at the end.`;
}

// ---- Public API ----

const SECTION_RULES = [
  'When you reference a lab, only mention features that exist in the',
  'capability list below.  If you propose something the lab cannot do,',
  'the student will hit a dead end.',
];

export function getCapabilitiesMarkdownFor(labType: LabType): string {
  switch (labType) {
    case 'music':
      return [
        ...SECTION_RULES,
        '',
        '=== Music Lab capabilities ===',
        musicCapabilities(),
      ].join('\n');
    case 'weblab2':
      return [
        ...SECTION_RULES,
        '',
        '=== Web Lab 2 capabilities ===',
        weblab2Capabilities(),
      ].join('\n');
    case 'panels':
      return [
        ...SECTION_RULES,
        '',
        '=== Panels capabilities ===',
        panelsCapabilities(),
      ].join('\n');
  }
}

export function getCapabilitiesMarkdownAll(): string {
  return [
    ...SECTION_RULES,
    '',
    '=== Music Lab capabilities ===',
    musicCapabilities(),
    '',
    '=== Web Lab 2 capabilities ===',
    weblab2Capabilities(),
    '',
    '=== Panels capabilities ===',
    panelsCapabilities(),
  ].join('\n');
}
