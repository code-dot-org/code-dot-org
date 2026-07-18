import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {getActiveFileForSource, saveFileContents} from '../utils/multiFileSource';

/**
 * A minimal single-file editor over the Codebridge multi-file source. It reads
 * the active file from the base `SourcesContext` and writes edits straight back
 * through `updateSources`, which persists via `LabRegistry.projectManager`.
 *
 * This is the vertical-slice editor: a bare `<textarea>` that proves the
 * read/edit/save seam end to end. It is replaced by the CodeMirror editor and
 * the surrounding workspace chrome (file browser, tabs, console) as they land.
 */
const CodebridgeTextEditor = () => {
  const {currentSources, updateSources} = useSources<MultiFileSource>();
  const source = currentSources.source;
  const activeFile = getActiveFileForSource(source);

  if (!activeFile) {
    return <div>No file open</div>;
  }

  return (
    <textarea
      aria-label={`Editing ${activeFile.name}`}
      value={activeFile.contents}
      onChange={e =>
        updateSources({
          ...currentSources,
          source: saveFileContents(source, activeFile.id, e.target.value),
        })
      }
    />
  );
};

export default CodebridgeTextEditor;
