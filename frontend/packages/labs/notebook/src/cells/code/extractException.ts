/**
 * Parses a Pyodide error string (raw Python traceback) into structured fields.
 *
 * Pyodide surfaces Python exceptions as a string that may include a full
 * traceback with frame lines and a final exception type+message line.
 * Structured extraction lets the UI display line numbers and friendly names
 * without passing raw Python internals to the learner.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Parsed exception fields extracted from a Pyodide error string. */
export interface ParsedException {
  /** Exception class name, e.g. "NameError", "SyntaxError". */
  name: string;
  /** Exception message, e.g. "name 'foo' is not defined". */
  message: string;
  /** 1-based line number of the offending line, if determinable. */
  line?: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Regex that matches every `File "<exec>", line N` frame annotation.
 * Used with the `g` flag so all occurrences can be collected.
 */
const EXEC_FRAME_RE = /File "<exec>", line (\d+)/g;

/**
 * Regex that matches the final exception class + message line in a traceback.
 * Covers standard built-ins, user-defined exception names ending in "Error"
 * or "Exception", plus SyntaxError (already in the class list but explicit
 * for clarity).  The alternation is intentionally ordered longest-first so
 * `ModuleNotFoundError` matches before any shorter suffix.
 */
const EXCEPTION_LINE_RE =
  /^([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*Error|[A-Za-z][A-Za-z0-9]*Exception|SyntaxError|ValueError|TypeError|NameError|KeyError|IndexError|AttributeError|ImportError|ModuleNotFoundError|ZeroDivisionError|StopIteration|RuntimeError): (.+)$/gm;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extracts structured exception info from a raw Pyodide error string.
 * Finds the last `File "<exec>", line N` frame for the line number.
 * Falls back to `name: 'Error', message: raw` when parsing fails.
 * @param raw Raw error string from the Pyodide worker
 * @returns ParsedException
 */
export function extractException(raw: string): ParsedException {
  // Collect all <exec> frame line numbers; keep only the last one — that frame
  // is the direct site of the error inside learner code.
  let lastLine: number | undefined;
  let frameMatch: RegExpExecArray | null;
  while ((frameMatch = EXEC_FRAME_RE.exec(raw)) !== null) {
    lastLine = parseInt(frameMatch[1], 10);
  }

  // Find all exception type+message occurrences, keep the last.  A chained
  // traceback may have multiple; the outermost is the one Pyodide shows last.
  let lastExceptionMatch: RegExpExecArray | null = null;
  let exceptionMatch: RegExpExecArray | null;
  while ((exceptionMatch = EXCEPTION_LINE_RE.exec(raw)) !== null) {
    lastExceptionMatch = exceptionMatch;
  }

  if (lastExceptionMatch === null) {
    // No recognisable exception line — surface the raw string as-is.
    return {name: 'Error', message: raw.trim()};
  }

  const result: ParsedException = {
    name: lastExceptionMatch[1],
    message: lastExceptionMatch[2],
  };
  if (lastLine !== undefined) {
    result.line = lastLine;
  }
  return result;
}
