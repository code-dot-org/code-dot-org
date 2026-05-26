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
}

export type JavalabFlatSource = Record<string, JavalabFlatFile>;

// Java Lab 2's levelProperties extend the codebridge ones. start_sources,
// template_sources, and exemplar_sources arrive over the wire in the
// legacy flat JavalabFlatSource shape, but they share field names with
// the codebridge MultiFileSource view; Javalab2View converts at mount.
// We do not retype the source fields here so consumers downstream of
// the conversion (codebridge) can read them as MultiFileSource.
export interface JavalabLevelProperties extends CodebridgeLevelProperties {
  csaViewMode?: CsaViewMode;
}
