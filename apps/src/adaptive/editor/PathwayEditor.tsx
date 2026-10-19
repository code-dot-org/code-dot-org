import Alert from '@code-dot-org/component-library/alert';
import {json, jsonParseLinter} from '@codemirror/lang-json';
import {linter, lintGutter} from '@codemirror/lint';
import {EditorView} from '@codemirror/view';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {editorConfig} from '@cdo/apps/codemirror/editorConfig';
import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import {
  AdaptiveContentError,
  findReferenceProblems,
  parsePathwaySource,
} from '../schema';

function contentProblems(text: string, pathwayId: string): string[] {
  try {
    const source = parsePathwaySource(JSON.parse(text));
    const problems = findReferenceProblems(source);
    if (source.id !== pathwayId) {
      problems.unshift(
        `id: '${source.id}' does not match the pathway '${pathwayId}'`
      );
    }
    return problems;
  } catch (error) {
    return error instanceof AdaptiveContentError
      ? error.problems
      : [(error as Error).message];
  }
}

async function errorsFrom(error: unknown): Promise<string[]> {
  if (isNetworkError(error) && error.response.status === 422) {
    const body = await error.response.json();
    return body.errors;
  }
  return [(error as Error).message];
}

const editorTheme = EditorView.theme({
  '&': {border: '1px solid #ccc', backgroundColor: 'white'},
  '.cm-scroller': {height: '600px', overflow: 'auto'},
});

interface PathwayEditorProps {
  pathwayId: string;
}

const PathwayEditor: React.FunctionComponent<PathwayEditorProps> = ({
  pathwayId,
}) => {
  const url = `/adaptive_pathways/${pathwayId}`;
  const editorRef = useRef<HTMLDivElement>(null);
  const [savedText, setSavedText] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const isDirty = savedText !== null && text !== savedText;

  useEffect(() => {
    HttpClient.get(url)
      .then(response => response.text())
      .then(loaded => {
        setText(loaded);
        setSavedText(loaded);
      })
      .catch(error => setLoadError(error.message));
  }, [url]);

  const isLoaded = savedText !== null;
  useEffect(() => {
    if (!isLoaded || !editorRef.current) {
      return;
    }
    const view = new EditorView({
      parent: editorRef.current,
      doc: text,
      extensions: [
        editorConfig,
        editorTheme,
        json(),
        linter(jsonParseLinter()),
        lintGutter(),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            setText(update.state.doc.toString());
            setJustSaved(false);
          }
        }),
      ],
    });
    return () => view.destroy();
    // The editor owns the document once created; text only seeds it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const save = async () => {
    const found = contentProblems(text, pathwayId);
    setProblems(found);
    if (found.length > 0) {
      return;
    }
    setIsSaving(true);
    try {
      await HttpClient.put(url, text, true, {
        'Content-Type': 'application/json',
      });
      setSavedText(text);
      setJustSaved(true);
    } catch (error) {
      setProblems(await errorsFrom(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (loadError) {
    return (
      <Alert type="danger" text={`Couldn't load the pathway: ${loadError}`} />
    );
  }

  return (
    <div>
      <div ref={editorRef} />
      <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: 8}}>
        <MuiButton
          variant="contained"
          onClick={save}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Saving…' : 'Save pathway'}
        </MuiButton>
        {isDirty && <span>Unsaved changes</span>}
        {justSaved && !isDirty && <span>Saved</span>}
      </div>
      {problems.length > 0 && (
        <Alert
          type="danger"
          text={
            <>
              <p>Couldn't save: the pathway is invalid.</p>
              <ul>
                {problems.map(problem => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </>
          }
        />
      )}
    </div>
  );
};

export default PathwayEditor;
