import {createContext, useContext} from 'react';
import type {PropsWithChildren} from 'react';

import type {FileId, FolderId, MultiFileSource} from '@code-dot-org/core/api';

import {getFileExtension} from './utils/multiFileSource';

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
 */
export interface CodebridgeConfig {
  /** Extensions the user may create/edit (e.g. ['py']). Empty = unrestricted. */
  editableFileTypes: string[];
  /** Extensions the project supports at all (superset of editable). */
  supportedFileTypes: string[];
  /** Extension -> language identifier for new files. Falls back to the extension. */
  languageMapping: {[extension: string]: string};
  /** Hide the new-folder affordances. */
  hideNewFolderButton?: boolean;
}

export const DEFAULT_CODEBRIDGE_CONFIG: CodebridgeConfig = {
  editableFileTypes: [],
  supportedFileTypes: [],
  languageMapping: {},
};

const CodebridgeConfigContext = createContext<CodebridgeConfig>(
  DEFAULT_CODEBRIDGE_CONFIG,
);

/** The current Codebridge config. Returns permissive defaults with no provider. */
export const useCodebridgeConfig = () => useContext(CodebridgeConfigContext);

export const CodebridgeConfigProvider = ({
  config,
  children,
}: PropsWithChildren<{config: CodebridgeConfig}>) => (
  <CodebridgeConfigContext.Provider value={config}>
    {children}
  </CodebridgeConfigContext.Provider>
);

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
