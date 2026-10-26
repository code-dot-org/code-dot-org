// A door for everything the folder buttons did (specs/SHELL_FINISH_PLAN.md,
// step 5).
//
// The buttons were removed after an audit of what only they reached. This
// walks that list, item by item, and finds the door that does each thing now:
// the source file that asks for the act. Each door has its own test of what
// it does (`ActorEditor`, `LayerInspector`, `ThemeField`, `PlaceHeading`,
// `RulesInPlayDialog`, `SoundLibraryDialog`, `toolboxStyle`); this one is the
// list, so that taking a door away fails a test that names what it was for.

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

/** A source file, from the package root — vitest's cwd. */
const source = (path: string): string =>
  readFileSync(join(process.cwd(), 'src', path), 'utf8');

/** A door: the file it is in, and what in it asks for the act. */
type Door = [file: string, asks: RegExp];

const ACTOR_EDITOR = 'actors/editor/ActorEditor.tsx';
const BACKGROUND_FIELD = 'mapEditor/BackgroundField.tsx';
const THEME_FIELD = 'mapEditor/ThemeField.tsx';
const SHELVES = 'library/LibraryImports.tsx';

/** The audit's list, as it was written, with the door for each item now. */
const AUDIT: ReadonlyArray<[item: string, doors: readonly Door[]]> = [
  // 1. Opening four editors.
  [
    'the image editor, for a sprite',
    [
      [ACTOR_EDITOR, /act: 'open',\s+fileId: lookFile\.id/],
      ['blockly/extensions/openSourceButton.ts', /getFieldValue\('SPRITE'\)/],
    ],
  ],
  ['the image editor, for a background', [[BACKGROUND_FIELD, /act: 'open'/]]],
  // The animation editor went with the `.anim` files: an animation is the
  // actor's own, and is reached in the Actor Editor
  // (specs/ANIMATION_PLAN.md).
  ['an animation', [[ACTOR_EDITOR, /requestAppearanceImport\('animation'\)/]]],
  [
    'the effect editor',
    [[ACTOR_EDITOR, /path: `\$\{effect\.effect\}\.effect`/]],
  ],
  [
    'the theme editor',
    [[THEME_FIELD, /act: 'open', path: `\$\{value\}\.style`/]],
  ],
  // 2. Making from nothing.
  ['a new sprite', [[ACTOR_EDITOR, /act: 'make',\s+folder: 'sprites'/]]],
  [
    'a new background',
    [[BACKGROUND_FIELD, /act: 'make',\s+folder: BACKGROUNDS_FOLDER/]],
  ],
  ['a new effect', [[ACTOR_EDITOR, /act: 'make',\s+folder: 'effects'/]]],
  ['a new theme', [[THEME_FIELD, /act: 'make',\s+folder: 'styles'/]]],
  ['a new rule', [[SHELVES, /act: 'make', folder: 'rules'/]]],
  // 3. Uploading.
  [
    'uploading a sprite',
    [[ACTOR_EDITOR, /act: 'upload',\s+folder: 'sprites'/]],
  ],
  [
    'uploading a background',
    [[BACKGROUND_FIELD, /act: 'upload',\s+folder: BACKGROUNDS_FOLDER/]],
  ],
  ['uploading a sound', [[SHELVES, /act: 'upload', folder: SOUNDS_FOLDER/]]],
  // 4. An AI-drawn background.
  [
    'drawing a background from words',
    [[BACKGROUND_FIELD, /act: 'draw',\s+folder: BACKGROUNDS_FOLDER/]],
  ],
  // 5. Rename, clone and delete.
  [
    'renaming, cloning and removing a rule',
    [
      [SHELVES, /onRename=/],
      [SHELVES, /onClone=/],
      [SHELVES, /onRemove=\{removeHeld\}/],
    ],
  ],
  [
    'renaming, cloning and deleting a sprite or an animation',
    [
      [ACTOR_EDITOR, /act: 'rename',\s+fileId: lookFile\.id/],
      [ACTOR_EDITOR, /act: 'clone',\s+fileId: lookFile\.id/],
      [ACTOR_EDITOR, /act: 'delete',\s+fileId: lookFile\.id/],
    ],
  ],
  [
    'renaming, cloning and deleting a background',
    [
      [BACKGROUND_FIELD, /act: 'rename',\s+path: pathOf/],
      [BACKGROUND_FIELD, /act: 'clone',\s+path: pathOf/],
      [BACKGROUND_FIELD, /act: 'delete',\s+path: pathOf/],
    ],
  ],
  [
    'renaming and deleting a sound',
    [
      [SHELVES, /onRename=\{fileId/],
      [SHELVES, /onDelete=\{fileId/],
    ],
  ],
  [
    'renaming, cloning and deleting an effect',
    [
      [
        ACTOR_EDITOR,
        /act: 'rename',\s+path: `\$\{effectMenu\.effect\}\.effect`/,
      ],
      [
        ACTOR_EDITOR,
        /act: 'clone',\s+path: `\$\{effectMenu\.effect\}\.effect`/,
      ],
      [
        ACTOR_EDITOR,
        /act: 'delete',\s+path: `\$\{effectMenu\.effect\}\.effect`/,
      ],
    ],
  ],
  [
    'renaming, cloning and deleting a theme',
    [[THEME_FIELD, /\['rename', 'clone', 'delete'\] as const/]],
  ],
  ['cloning a map', [['mapEditor/PlaceHeading.tsx', /act: 'clone', fileId/]]],
  // 6. A rule no block on screen names.
  [
    'opening any rule',
    [
      [SHELVES, /act: 'open', fileId: rule\.fileId/],
      ['blockly/toolboxStyle.ts', /'Rules in Play'/],
    ],
  ],
  // 7. A list of everything of one kind.
  ['every rule', [['rules/RulesInPlayDialog.tsx', /heldRules\(source\)/]]],
  ['every sound', [[SHELVES, /own=\{ownSounds\(/]]],
  ['every effect', [[ACTOR_EDITOR, /\{effectFiles\s*\.filter/]]],
  ['every theme', [[THEME_FIELD, /options\.map\(\(\[label, path\]\)/]]],
];

describe('a door for everything the folder buttons did', () => {
  it.each(AUDIT)('%s', (_item, doors) => {
    for (const [file, asks] of doors) {
      expect(source(file), file).toMatch(asks);
    }
  });

  it('and no folder buttons', () => {
    // The host draws nothing of its own (`FileMenus`).
    expect(source('files/FileMenus.tsx')).not.toMatch(/IconButtonWithTooltip/);
    expect(source('layout/WorldLayout.tsx')).toMatch(
      /tabBarStart=\{<FileMenus \/>\}/,
    );
  });
});
