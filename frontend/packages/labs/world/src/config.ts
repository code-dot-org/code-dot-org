import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

import {AnimationEditor} from './animationEditor/AnimationEditor';
import {BlocklyFileEditor} from './blockly/BlocklyFileEditor';
import {EffectFileEditor} from './effect/EffectFileEditor';
import {ImageFileEditor} from './imageEditor/ImageFileEditor';
import {MapEditor} from './mapEditor/MapEditor';

/**
 * World Lab's Codebridge configuration. A World project is the game defined by
 * its `worlds` / `actors` / `rules` / `maps` — code, not a web page. There is
 * no editable `index.html`: the preview sandbox serves a fixed host shell and
 * imports the compiled bundle (SANDBOX.md, PLAN §6).
 *
 * Text types (JS/TS/JSON/MD/TXT) edit in CodeMirror. `rule`, `actor`, and
 * `world` are Blockly-authored; `map` is a world-population document,
 * `anim` an animation file, and `effect` a shader graph — all JSON on disk with
 * no CodeMirror language. `editorComponents` routes each to its custom editor
 * (the Blockly workspace editor, the visual map editor, the animation editor,
 * or the effect graph editor). Images (`png`) are supported (shown in the tree,
 * handed to the game) but not edited.
 */
export const WORLD_EDITABLE_FILE_TYPES = [
  'js',
  'ts',
  'json',
  'md',
  'txt',
  'rule',
  'actor',
  'world',
  // A `.map` is a world-population document, edited in the visual map editor.
  'map',
  // A `.anim` is an animation file (JSON), edited in the visual animation editor.
  'anim',
  // An `.effect` is a node graph that compiles to a GLSL shader, edited in the
  // effect editor (specs/EFFECT_EDITOR.md).
  'effect',
  // A `.sheet` says how to cut the image of the same name into cells — what
  // makes a PNG a spritesheet (appearance/sheetFile). JSON, and small enough to
  // read and edit as text.
  'sheet',
];
const IMAGE_FILE_TYPES = ['png'];

export const worldConfig: Partial<CodebridgeConfig> = {
  editableFileTypes: WORLD_EDITABLE_FILE_TYPES,
  supportedFileTypes: [...WORLD_EDITABLE_FILE_TYPES, ...IMAGE_FILE_TYPES],
  // Learners can upload PNG sprites; they're stored in the assets backend and
  // referenced by URL (the game resolves them for the preview — see UPLOADS.md).
  validMimeTypes: ['image/png'],
  languageMapping: {
    js: 'javascript',
    ts: 'javascript',
    json: 'json',
    md: 'markdown',
    rule: 'rule',
    actor: 'actor',
    world: 'world',
    map: 'map',
    anim: 'anim',
    effect: 'effect',
    sheet: 'json',
  },
  languageExtensions: {
    javascript: javascript(),
    json: json(),
    markdown: markdown(),
  },
  // Blockly-authored file types open in the Blockly editor (Codebridge's
  // per-language editor seam), not CodeMirror.
  editorComponents: {
    // A `.png` is bytes, not text: the image editor reads and writes them
    // through the file's `url` (imageEditor/ImageFileEditor).
    png: ImageFileEditor,
    rule: BlocklyFileEditor,
    actor: BlocklyFileEditor,
    world: BlocklyFileEditor,
    map: MapEditor,
    anim: AnimationEditor,
    effect: EffectFileEditor,
  },
  // File-browser icons for World's own extensions (all FontAwesome solid). The
  // built-in types (js/json/png/…) keep their defaults; these give each World
  // file type a distinct, meaningful glyph.
  fileIcons: {
    world: {iconName: 'earth-americas', iconStyle: 'solid', isBrand: false},
    actor: {iconName: 'masks-theater', iconStyle: 'solid', isBrand: false},
    effect: {iconName: 'wand-sparkles', iconStyle: 'solid', isBrand: false},
    rule: {iconName: 'scroll', iconStyle: 'solid', isBrand: false},
    map: {iconName: 'map', iconStyle: 'solid', isBrand: false},
    anim: {iconName: 'film', iconStyle: 'solid', isBrand: false},
    sheet: {iconName: 'table-cells', iconStyle: 'solid', isBrand: false},
  },
};
