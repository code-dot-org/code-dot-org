import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

import {AnimationEditor} from './animationEditor/AnimationEditor';
import {followImages} from './appearance/sheetCompanions';
import {BlocklyFileEditor} from './blockly/BlocklyFileEditor';
import {label} from './blockly/label';
import {authoredName} from './blockly/projectModules';
import {EffectFileEditor} from './effect/EffectFileEditor';
import {ImageFileEditor} from './imageEditor/ImageFileEditor';
import {MapEditor} from './mapEditor/MapEditor';
import {whyKeepFile} from './rules/deleteGuard';
import {resolveRuleContents} from './rules/ruleReference';

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
  // Learners can upload PNG sprites and their own sounds; both are stored in
  // the assets backend and referenced by URL (the game resolves them for the
  // preview — see UPLOADS.md and specs/SOUND.md).
  //
  // The audio types are the ones a browser will play and a learner is likely to
  // have. `soundFiles.isSoundFile` decides the same question by extension for
  // the dropdowns and the driver; the two lists are allowed to differ, and this
  // is the narrower one — a MIME type is what a file picker filters on, and
  // offering a format we cannot name is worse than not offering it.
  validMimeTypes: [
    'image/png',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
  ],
  // 2MB. There was no cap on anything before sounds, and this is the first
  // (specs/SOUND.md): roughly two minutes of ordinary mp3 — generous for
  // anything one-shot, enough for a loop, and short of the point where a
  // project stops loading. It applies to every upload, not only to sounds,
  // because a size limit that depended on the kind of file would be a second
  // rule to explain.
  maxUploadBytes: 2 * 1024 * 1024,
  // A `.sheet` belongs to the `.png` of the same name: the image editor writes
  // it when an image is made a spritesheet and deletes it when it stops being
  // one, so it is not a file to open (appearance/sheetFile).
  hiddenFileTypes: ['sheet'],
  // A `.sheet` is hidden, so nothing can move, rename or delete it by hand: it
  // goes wherever its `.png` goes, in the same write (appearance/sheetCompanions).
  reconcileSource: followImages,
  // The tree's delete asks what the rules panel asks: a rule another rule
  // requires cannot go, and the refusal says which (rules/deleteGuard). Two
  // routes to the same act, one answer.
  blockFileDeletion: whyKeepFile,
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
  /**
   * What a TAB calls a file: the name the file declares.
   *
   * `main.world` holds a world called "Platform World", and that is the word on
   * its blocks, in every dropdown that offers it, and in the menu the learner
   * opened it from (`files/FileMenus`) — so a tab reading `main.world` was the
   * one place in the lab saying something else. One rule, one answer:
   * `authoredName`, falling back to the file's own stem titled, which is what
   * every dropdown does for a file that declares nothing.
   *
   * The file BROWSER still shows file names, and should: it is a view of files.
   */
  fileLabel: file =>
    // Resolved: a rule nobody has edited holds a reference to the library's
    // and declares nothing of its own (rules/ruleReference), so without this
    // the tab for every unedited rule reads its stem — the one place in the
    // lab saying something else, which is the thing this whole option exists
    // to stop.
    authoredName(resolveRuleContents(file.contents ?? '')) ??
    label((file.name ?? '').replace(/\.[^.]+$/, '')),
  // File-browser icons for World's own extensions (all FontAwesome solid). The
  // built-in types (js/json/png/…) keep their defaults; these give each World
  // file type a distinct, meaningful glyph.
  fileIcons: {
    world: {iconName: 'planet-ringed', iconStyle: 'solid', isBrand: false},
    actor: {iconName: 'masks-theater', iconStyle: 'solid', isBrand: false},
    effect: {iconName: 'wand-sparkles', iconStyle: 'solid', isBrand: false},
    rule: {iconName: 'scroll', iconStyle: 'solid', isBrand: false},
    map: {iconName: 'map', iconStyle: 'solid', isBrand: false},
    anim: {iconName: 'film', iconStyle: 'solid', isBrand: false},
    sheet: {iconName: 'table-cells', iconStyle: 'solid', isBrand: false},
  },
};
