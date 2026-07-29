import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

import {AnimationEditor} from './animationEditor/AnimationEditor';
import {BlocklyFileEditor} from './blockly/BlocklyFileEditor';
import {MapEditor} from './mapEditor/MapEditor';

/**
 * World Lab's Codebridge configuration. A World project is the game defined by
 * its `scenes` / `worlds` / `actors` / `rules` — code, not a web page. There is
 * no editable `index.html`: the preview sandbox serves a fixed host shell and
 * imports the compiled bundle (SANDBOX.md, PLAN §6).
 *
 * Text types (JS/TS/JSON/MD/TXT) edit in CodeMirror. `rule`, `actor`, `scene`,
 * and `world` are Blockly-authored; `map` is a scene-instantiation document and
 * `anim` an animation file — both JSON on disk with no CodeMirror language.
 * `editorComponents` routes each to its custom editor (the Blockly workspace
 * editor, the visual map editor, or the animation editor). Images (`png`) are
 * supported (shown in the tree, handed to the game) but not edited.
 */
export const WORLD_EDITABLE_FILE_TYPES = [
  'js',
  'ts',
  'json',
  'md',
  'txt',
  'rule',
  'actor',
  'scene',
  'world',
  // A `.map` is a scene-instantiation document, edited in the visual map editor.
  'map',
  // A `.anim` is an animation file (JSON), edited in the visual animation editor.
  'anim',
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
    scene: 'scene',
    world: 'world',
    map: 'map',
    anim: 'anim',
  },
  languageExtensions: {
    javascript: javascript(),
    json: json(),
    markdown: markdown(),
  },
  // Blockly-authored file types open in the Blockly editor (Codebridge's
  // per-language editor seam), not CodeMirror.
  editorComponents: {
    rule: BlocklyFileEditor,
    actor: BlocklyFileEditor,
    scene: BlocklyFileEditor,
    world: BlocklyFileEditor,
    map: MapEditor,
    anim: AnimationEditor,
  },
};
