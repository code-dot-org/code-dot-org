/**
 * Core types for the notebook renderer component.
 * These types follow the Jupyter Notebook format specification.
 */

/**
 * Metadata for an individual cell in the notebook.
 * Following Jupyter spec, cell metadata can contain arbitrary key-value pairs.
 */
export interface CellMetadata {
  /** Whether the cell can be edited */
  editable?: boolean;
  /** Slideshow-specific metadata */
  slideshow?: {
    slide_type?: string;
  };
  /** Custom tags attached to the cell */
  tags?: string[];
  /** Allow any additional metadata properties */
  [key: string]: any;
}

/**
 * Output from a code cell execution
 */
export interface Output {
  /** Name of the output (e.g., stdout, stderr) */
  name?: string;
  /** Type of output (e.g., stream, execute_result) */
  output_type: string;
  /** Text content of the output */
  text?: string[];
  /** Binary content of the output */
  data?: {
    [key: string]: any;
  };
  /** Traceback content of the output */
  traceback?: string[];
}

/**
 * A single cell in the notebook
 */
export interface Cell {
  /** Unique identifier for the cell - supported in Jupyter 4.5 and above */
  id: string;
  /** Type of cell (code, markdown, raw) */
  cell_type: "code" | "markdown" | "raw";
  /** Execution count for code cells */
  execution_count?: number | null;
  /** Cell-specific metadata */
  metadata: CellMetadata;
  /** Outputs from code cell execution */
  outputs?: Output[];
  /** Cell content as an array of strings */
  source?: string[];
}

/**
 * Kernel specification for the notebook
 */
export interface KernelSpec {
  display_name: string;
  language: string;
  name: string;
}

/**
 * Language-specific information
 */
export interface LanguageInfo {
  codemirror_mode?: {
    name?: string;
    version?: number;
  };
  file_extension?: string;
  mimetype?: string;
  name?: string;
  nbconvert_exporter?: string;
  pygments_lexer?: string;
  version?: string;
}

/**
 * Metadata for the entire notebook.
 * Following Jupyter spec, notebook metadata can contain arbitrary key-value pairs.
 */
export interface NotebookMetadata {
  kernelspec?: KernelSpec;
  language_info?: LanguageInfo;
  /** Allow any additional metadata properties */
  [key: string]: any;
}

/**
 * Complete notebook structure
 */
export interface Notebook {
  cells: Cell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
}

export const NOTEBOOK_SKELETON : Notebook = {
  cells: [],
  metadata: {},
  nbformat: 4,
  nbformat_minor: 2
}