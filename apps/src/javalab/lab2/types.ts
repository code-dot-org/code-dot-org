import {CodebridgeLevelProperties} from '@codebridge/types';

export type CsaViewMode = 'console' | 'neighborhood' | 'theater';

// Java Lab's legacy on-the-wire source shape. The S3 main.json holds
// {source: <JavalabFlatSource>} and startSources /
// templateSources / exemplarSources are also in this shape.
export interface JavalabFlatFile {
  text: string;
  tabOrder?: number;
  isVisible: boolean;
  isValidation?: boolean;
  // Whether this file's tab is currently open in the editor. Optional;
  // absent means open. Only meaningful on visible non-validation files.
  isOpen?: boolean;
  // Whether this file's tab is the currently focused one.
  // At most one file in a source should set this true.
  isActive?: boolean;
  // Asset (image/audio) entries set this to where the bytes live
  // (/v3/assets/... or /level_starter_assets/...)
  url?: string;
  // Set on visible starter files the levelbuilder locked: editable by
  // students but not deletable or renamable. Round-trips
  // ProjectFileType.LOCKED_STARTER, which the flat shape can't otherwise
  // represent (it doesn't persist file types).
  locked?: boolean;
}

export type JavalabFlatSource = Record<string, JavalabFlatFile>;

// Java Lab 2's levelProperties extend the codebridge ones. start_sources,
// template_sources, and exemplar_sources arrive over the wire in the
// legacy flat JavalabFlatSource shape, but they share field names with
// the codebridge MultiFileSource view; Javalab2View converts at mount.
// We do not retype the source fields here because the shared
// LevelProperties constraint (LabProps<T extends LevelProperties>)
// requires `ProjectSources | MultiFileSource`, and JavalabFlatSource is
// assignable to neither. Use `flatSourceFromLevelProperties` to read.
//
// `validation` is the decrypted validation map. Only sent to levelbuilders;
// everyone else gets a names-only stub (`{filename => ""}`).
export interface JavalabLevelProperties extends CodebridgeLevelProperties {
  csaViewMode?: CsaViewMode;
  validation?: JavalabFlatSource;
}

// The on-the-wire source fields are typed as ProjectSources |
// MultiFileSource by the shared LevelProperties contract, but Javalab
// always sends JavalabFlatSource. Cast at the boundary.
export function flatSourceFromLevelProperties(
  source: JavalabLevelProperties['startSources']
): JavalabFlatSource | undefined {
  return source as JavalabFlatSource | undefined;
}
