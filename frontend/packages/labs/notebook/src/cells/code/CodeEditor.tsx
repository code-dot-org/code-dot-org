/**
 * CodeMirror host component for Python source editing.
 *
 * Mounts a CodeMirror 6 EditorView into a div ref on first render and tears it
 * down on unmount.  The extensions array is assembled at mount time; theme
 * changes are therefore reflected only on the next mount, which is acceptable
 * because theme switches in Phase 3 require a full lab reload.  A Compartment
 * wraps the readOnly facet so it can be reconfigured via dispatch without
 * recreating the editor (which would lose cursor position).
 *
 * A second Compartment (`lineHighlightCompartment`) manages error-line
 * highlighting.  When `highlightLine` changes the compartment is reconfigured
 * via dispatch, avoiding a full editor recreate.
 */

import { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { EditorView, Decoration, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { useEditorTheme } from './themes';

// ---------------------------------------------------------------------------
// Error-line highlight helpers
// ---------------------------------------------------------------------------

/**
 * Base theme that styles lines decorated with the `cm-errorLine` class.
 * Hex value is allowed here — it is a CM6 theme constant, not an MUI sx prop.
 */
const errorLineBaseTheme: ReturnType<typeof EditorView.baseTheme> =
  EditorView.baseTheme({
    '.cm-errorLine': {backgroundColor: 'rgba(239, 83, 80, 0.15)'},
  });

/**
 * Builds a DecorationSet that marks a single line (1-based) with the
 * `cm-errorLine` class.  Returns an empty set when `line` is out of range.
 * @param view Live EditorView
 * @param line 1-based target line number
 * @returns DecorationSet with the line decoration applied, or empty
 */
function buildLineDecoration(view: EditorView, line: number): DecorationSet {
  try {
    const lineObj = view.state.doc.line(line);
    return Decoration.set([
      Decoration.line({attributes: {class: 'cm-errorLine'}}).range(lineObj.from),
    ]);
  } catch {
    // line() throws RangeError if the line number is out of bounds.
    return Decoration.none;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for CodeEditor. */
interface CodeEditorProps {
  /** Initial source lines to display (joined for the editor doc). */
  initialValue: string;
  /** Called when editor content changes. */
  onChange: (value: string) => void;
  /** Whether the editor is read-only. */
  readOnly?: boolean;
  /** 1-based line number to highlight as an error (e.g. from traceback parsing). */
  highlightLine?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a CodeMirror 6 editor with Python syntax highlighting.
 * The editor fills its parent container's width and has a minimum height to
 * remain usable when the source is empty.
 */
export function CodeEditor({
  initialValue,
  onChange,
  readOnly = false,
  highlightLine,
}: CodeEditorProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Compartment enables reconfiguring readOnly without recreating the editor.
  const readOnlyCompartmentRef = useRef<Compartment>(new Compartment());
  // Compartment enables reconfiguring error-line highlighting without recreating the editor.
  const lineHighlightCompartmentRef = useRef<Compartment>(new Compartment());
  const editorTheme = useEditorTheme();

  // Mount the editor once.  onChange is captured in the closure; its identity
  // may change on re-renders but that only affects cells triggered after the
  // first mount — acceptable for Phase 3 where the handler is stable.
  useEffect(() => {
    if (containerRef.current === null) return;

    const readOnlyCompartment = readOnlyCompartmentRef.current;
    const lineHighlightCompartment = lineHighlightCompartmentRef.current;

    const onChangeExtension = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    });

    const startState = EditorState.create({
      doc: initialValue,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        keymap.of(defaultKeymap),
        python(),
        EditorView.lineWrapping,
        readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
        // Error-line base theme is a one-time static extension; it does not
        // go inside the compartment so the class style is always available.
        errorLineBaseTheme,
        // Line-highlight compartment starts empty; updated via highlightLine effect.
        lineHighlightCompartment.of(EditorView.decorations.of(Decoration.none)),
        editorTheme,
        onChangeExtension,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally runs only on mount — readOnly and highlightLine changes
    // are handled by separate effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Propagate readOnly changes to the live view without recreating the editor.
  useEffect(() => {
    const view = viewRef.current;
    if (view === null) return;

    view.dispatch({
      effects: readOnlyCompartmentRef.current.reconfigure(
        EditorState.readOnly.of(readOnly)
      ),
    });
  }, [readOnly]);

  // Propagate error-line highlight changes to the live view.
  useEffect(() => {
    const view = viewRef.current;
    if (view === null) return;

    const deco =
      highlightLine !== undefined && highlightLine > 0
        ? buildLineDecoration(view, highlightLine)
        : Decoration.none;

    view.dispatch({
      effects: lineHighlightCompartmentRef.current.reconfigure(
        EditorView.decorations.of(deco)
      ),
    });
  }, [highlightLine]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: 80,
        '& .cm-editor': { height: '100%' },
        '& .cm-scroller': { fontFamily: 'JetBrainsMono, "Fira Mono", monospace' },
      }}
    />
  );
}

export default CodeEditor;
