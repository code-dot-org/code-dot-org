import type {Extension} from '@codemirror/state';
import type {ComponentType} from 'react';

import type {FileId, FolderId, MultiFileSource} from '@code-dot-org/core/api';

import type {FileIcon} from './utils/fileIcons';
import {getFileExtension} from './utils/multiFileSource';

/**
 * Props a custom editor receives for the active file. Mirrors the seam the
 * built-in CodeMirror editor uses: `initialContents` loads it (mount once,
 * keyed by `fileId`) and `onChange` persists edits back through the same
 * `saveFile` path.
 */
export interface CustomEditorProps {
  fileId: string;
  initialContents: string;
  /** The file's language tag (from `languageMapping`). */
  language: string;
  isReadOnly: boolean;
  onChange: (contents: string) => void;
}

/**
 * Static configuration for a Codebridge lab: which file types the user may work
 * with, and how a file extension maps to the `language` tag stored on files.
 *
 * A trimmed port of the legacy Codebridge `ConfigType`. Runtime concerns from
 * that type — layouts, preview components, `onRun`/`onStop`/console I/O — are
 * deferred to the console/runtime step (they'll ride a separate context, and the
 * consuming lab supplies layouts). `languageMapping` here is extension ->
 * language identifier (e.g. {py: 'python'}); the CodeMirror `LanguageSupport`
 * lookup will key off the same identifier when the editor is ported.
 *
 * The React context that carries this config lives in
 * `contexts/CodebridgeConfigContext`.
 */
export interface CodebridgeConfig {
  /** Extensions the user may create/edit (e.g. ['py']). Empty = unrestricted. */
  editableFileTypes: string[];
  /** Extensions the project supports at all (superset of editable). */
  supportedFileTypes: string[];
  /** Extension -> language identifier for new files. Falls back to the extension. */
  languageMapping: {[extension: string]: string};
  /**
   * Language identifier -> CodeMirror extension providing syntax support for the
   * editor (e.g. {python: python()}). The language packages (@codemirror/lang-*)
   * are language-specific, so the consuming lab supplies these; the generic shell
   * stays language-agnostic. Keyed by the same identifier as `languageMapping`.
   */
  languageExtensions?: {[languageId: string]: Extension};
  /**
   * Language identifier -> a custom editor component that replaces the default
   * CodeMirror editor for files of that language (e.g. a Blockly editor for a
   * `rule` language). Keyed by the same identifier as `languageMapping`; a file
   * whose language has no entry uses the CodeMirror editor. The component
   * receives the active file via {@link CustomEditorProps}.
   */
  editorComponents?: {[languageId: string]: ComponentType<CustomEditorProps>};
  /**
   * Extension -> FontAwesome icon for the file browser, letting a lab give its
   * own file types (e.g. `.actor`, `.scene`) meaningful icons. Merged over the
   * built-in types (JS/JSON/PNG/…); an extension with no entry falls back to the
   * built-in map, then a generic file icon. Keyed by extension, like
   * `languageMapping`.
   */
  fileIcons?: {[extension: string]: FileIcon};
  /** Hide the new-folder affordances. */
  hideNewFolderButton?: boolean;
  /**
   * MIME types the user may upload (e.g. ['image/png']). Empty/undefined hides
   * the upload affordance. A `text/*` upload is read into the file's contents; any
   * other type is stored in the assets backend and referenced by URL.
   */
  validMimeTypes?: string[];
}

export const DEFAULT_CODEBRIDGE_CONFIG: CodebridgeConfig = {
  editableFileTypes: [],
  supportedFileTypes: [],
  languageMapping: {},
};

/** The `language` tag a new file should carry, per the config's mapping. */
export const languageForFileName = (
  config: CodebridgeConfig,
  fileName: string,
): string => {
  const ext = getFileExtension(fileName);
  return config.languageMapping[ext] ?? ext;
};

const siblingFileNames = (
  source: MultiFileSource,
  folderId: FolderId,
  excludeId?: FileId,
) =>
  Object.values(source.files)
    .filter(f => f.folderId === folderId && f.id !== excludeId)
    .map(f => f.name);

const siblingFolderNames = (
  source: MultiFileSource,
  parentId: FolderId,
  excludeId?: FolderId,
) =>
  Object.values(source.folders)
    .filter(f => f.parentId === parentId && f.id !== excludeId)
    .map(f => f.name);

/**
 * Validate a proposed file name in `folderId`: non-empty, an editable extension
 * (when the config restricts them), and not a duplicate of a sibling. Returns an
 * error message, or undefined when valid. `excludeId` skips the file being
 * renamed from the duplicate check.
 */
export const validateFileName = (
  config: CodebridgeConfig,
  source: MultiFileSource,
  folderId: FolderId,
  name: string,
  excludeId?: FileId,
): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Enter a file name.';
  }
  if (
    config.editableFileTypes.length > 0 &&
    !config.editableFileTypes.includes(getFileExtension(trimmed))
  ) {
    return `File name must end in: ${config.editableFileTypes
      .map(ext => `.${ext}`)
      .join(', ')}`;
  }
  if (siblingFileNames(source, folderId, excludeId).includes(trimmed)) {
    return 'A file with that name already exists here.';
  }
  return undefined;
};

/**
 * Validate MOVING an existing file into `folderId`: only that its name doesn't
 * collide with a sibling there. Unlike {@link validateFileName} this does NOT
 * enforce editable file types — an already-uploaded binary (a `.png` sprite,
 * say) keeps its type when moved. `excludeId` skips the file being moved.
 */
export const validateFileMove = (
  source: MultiFileSource,
  folderId: FolderId,
  name: string,
  excludeId?: FileId,
): string | undefined =>
  siblingFileNames(source, folderId, excludeId).includes(name.trim())
    ? 'A file with that name already exists here.'
    : undefined;

/** Validate a proposed folder name under `parentId`. See {@link validateFileName}. */
export const validateFolderName = (
  source: MultiFileSource,
  parentId: FolderId,
  name: string,
  excludeId?: FolderId,
): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Enter a folder name.';
  }
  if (siblingFolderNames(source, parentId, excludeId).includes(trimmed)) {
    return 'A folder with that name already exists here.';
  }
  return undefined;
};
