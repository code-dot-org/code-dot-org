import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {autocompletion} from '@codemirror/autocomplete';
import {Compartment, EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {FontSize} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {
  fetchAndSaveEditorFontSize,
  setEditorFontSizeLoaded,
} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {AppName} from '@cdo/apps/lab2/types';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {editorConfig} from './editorConfig';
import {
  darkMode as darkModeTheme,
  lightMode as lightModeTheme,
} from './editorThemes';

import moduleStyles from './code-editor.module.scss';

interface CodeEditorProps {
  onCodeChange: (code: string) => void;
  editorConfigExtensions: Extension[];
  startCode: string;
  appName: AppName;
}

const CodeEditor: React.FunctionComponent<CodeEditorProps> = ({
  onCodeChange,
  editorConfigExtensions,
  startCode,
  appName,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [didInit, setDidInit] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const {editorFontSizeKey, editorFontSizeLoaded} = useAppSelector(
    state => state.lab2View
  );
  const {signInState} = useAppSelector(state => state.currentUser);
  const {theme} = useTheme();

  // Load the user's preferred editor font size from the backend which is saved
  // per app type (currently either pythonlab or weblab) for signed-in users.
  // When the user selects a different font size from settings, it's saved on the backend.
  // We mark font size is loaded once the value is fetched (signed-in) or skipped (signed-out).
  useEffect(() => {
    if (signInState !== SignInState.SignedIn) {
      dispatch(setEditorFontSizeLoaded(true));
      return;
    }
    dispatch(fetchAndSaveEditorFontSize({appName}));
  }, [dispatch, signInState, appName]);

  // These two compartments control read-only settings.
  // Controls if you can type in the editor or not.
  const editorReadOnlyCompartment = useMemo(() => new Compartment(), []);
  // Controls if the dom is focusable or not (and therefore if a cursor is visible in the editor or not).
  const editorEditableCompartment = useMemo(() => new Compartment(), []);

  // This compartment controls font size settings for the editor.
  const fontSizeCompartment = useMemo(() => new Compartment(), []);

  //This compartment controls the theme for the editor
  const themeCompartment = useMemo(() => new Compartment(), []);

  const getFontSizeTheme = (fontSize: number) => {
    return EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
      },
    });
  };
  useEffect(() => {
    if (!editorFontSizeLoaded || editorRef.current === null || didInit) {
      return;
    }

    const onEditorUpdate = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        onCodeChange(update.state.doc.toString());
      }
    );

    const editorExtensions = [
      ...editorConfig,

      onEditorUpdate,
      autocompletion(),
      ...editorConfigExtensions,
    ];

    editorExtensions.push(
      editorReadOnlyCompartment.of(EditorState.readOnly.of(isReadOnly)),
      editorEditableCompartment.of(EditorView.editable.of(!isReadOnly)),
      fontSizeCompartment.of(getFontSizeTheme(FontSize[editorFontSizeKey]))
    );
    if (theme === 'Dark') {
      editorExtensions.push(themeCompartment.of(darkModeTheme));
    } else {
      editorExtensions.push(themeCompartment.of(lightModeTheme));
    }
    setEditorView(
      new EditorView({
        state: EditorState.create({
          doc: startCode,
          extensions: editorExtensions,
        }),
        parent: editorRef.current,
        // Always start on the first line.
        // TODO: Determine if we should track line position and scroll to
        // a saved position instead.
        // https://codedotorg.atlassian.net/browse/CT-870
        scrollTo: EditorView.scrollIntoView(0),
      })
    );
    setDidInit(true);
  }, [
    dispatch,
    editorRef,
    editorConfigExtensions,
    onCodeChange,
    startCode,
    didInit,
    theme,
    editorReadOnlyCompartment,
    isReadOnly,
    editorEditableCompartment,
    fontSizeCompartment,
    editorFontSizeKey,
    editorFontSizeLoaded,
    themeCompartment,
  ]);

  // When we have a new fontSizeKey, reset font size.
  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          fontSizeCompartment.reconfigure(
            getFontSizeTheme(FontSize[editorFontSizeKey])
          ),
        ],
      });
    }
  }, [editorView, fontSizeCompartment, editorFontSizeKey]);

  // When we have a new theme, reset the theme.
  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          themeCompartment.reconfigure(
            theme === 'Dark' ? darkModeTheme : lightModeTheme
          ),
        ],
      });
    }
  }, [theme, editorView, themeCompartment]);

  // When we have a new channelId and/or start code, reset the editor with the start code.
  // A new channelId means we are loading a new project, and we need to reset the editor.
  useEffect(() => {
    if (editorView && editorView.state.doc.toString() !== startCode) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: startCode,
        },
      });
    }
  }, [startCode, editorView, channelId]);

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          editorReadOnlyCompartment.reconfigure(
            EditorState.readOnly.of(isReadOnly)
          ),
          editorEditableCompartment.reconfigure(
            EditorView.editable.of(!isReadOnly)
          ),
        ],
      });
    }
  }, [
    isReadOnly,
    editorView,
    editorReadOnlyCompartment,
    editorEditableCompartment,
  ]);

  if (!editorFontSizeLoaded) {
    return null;
  }

  return (
    <div
      ref={editorRef}
      className={classNames(
        'codemirror-container',
        moduleStyles.codeEditorContainer
      )}
    />
  );
};

export default CodeEditor;
