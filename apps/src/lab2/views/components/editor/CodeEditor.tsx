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
import i18n from '@cdo/apps/pythonlab/locale';
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
    let observer: MutationObserver | null = null;
    let cleanup: (() => void) | null = null;

    function setup() {
      // This is not 'reacty' but we have to query them because CodeMirror
      // manages these elements within the extension.
      const cmScroller = document.querySelector(
        '.cm-scroller'
      ) as HTMLElement | null;
      const cmContentDiv = document.querySelector(
        '.cm-content'
      ) as HTMLElement | null;
      if (!cmScroller || !cmContentDiv) return false;

      // Make scroller part of tab order, make editor hidden from tab order, and
      // set labels on both elements
      cmContentDiv.setAttribute('tabIndex', '-1');
      cmScroller.setAttribute('tabIndex', '0');
      cmContentDiv.setAttribute('aria-label', i18n.codeEditorEditing());
      cmScroller.setAttribute('id', 'uitest-codebridge-editor');
      cmScroller.setAttribute('aria-label', i18n.codeEditorDescription());

      // Keydown handler for cmScroller
      const onScrollerKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          cmContentDiv.focus();
        }
      };
      cmScroller.addEventListener('keydown', onScrollerKeyDown);

      // Keydown handler for cmContentDiv (Escape to return focus)
      const onContentKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          cmScroller.focus();
        }
      };
      cmContentDiv.addEventListener('keydown', onContentKeyDown);

      // Cleanup function
      cleanup = () => {
        cmScroller.removeEventListener('keydown', onScrollerKeyDown);
        cmContentDiv.removeEventListener('keydown', onContentKeyDown);
      };

      return true;
    }

    if (!setup()) {
      observer = new MutationObserver(() => {
        if (setup()) {
          observer?.disconnect();
        }
      });
      observer.observe(document.body, {childList: true, subtree: true});
    }

    return () => {
      observer?.disconnect();
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (editorView) {
        console.log('destroying editorView on unmount');
        editorView.destroy();
        setDidInit(false);
      }
    };
  }, [editorView]);

  useEffect(() => {
    if (!editorFontSizeLoaded || editorRef.current === null || didInit) {
      return;
    }

    if (editorView) {
      console.log('destroying existing editorView');
      editorView.destroy();
    }

    const onEditorUpdate = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        if (update.docChanged) {
          onCodeChange(update.state.doc.toString());
        } else {
          console.log('skipping onCodeChange, doc not changed');
          console.log({update});
        }
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
    editorView,
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
      console.log(`new code, resetting editor`);
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
