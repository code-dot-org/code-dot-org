import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {esLint} from '@codemirror/lang-javascript';
import {LanguageSupport} from '@codemirror/language';
import {linter, lintGutter} from '@codemirror/lint';
import {unifiedMergeView} from '@codemirror/merge';
import {Extension} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import js from '@eslint/js';
import {
  colorPicker,
  wrapperClassName,
} from '@replit/codemirror-css-color-picker';
import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';
import React, {useCallback, useMemo} from 'react';

import {CodebridgeEmptyState} from '@cdo/apps/codebridge/components/CodebridgeEmptyState';
import emptyFilesPlaceholderImage from '@cdo/apps/codebridge/images/empty-files-placeholder.svg';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {saveFileThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  editableFileType,
  enableUserAddedSelectionContext,
  viewableImageFileType,
} from '../utils';

import {getAddToAiTutorField} from './addToAiTutorField';

import moduleStyles from './styles/editor.module.scss';

interface EditorProps {
  langMapping: {[key: string]: LanguageSupport};
  editableFileTypes: string[];
}

export const Editor = ({langMapping, editableFileTypes}: EditorProps) => {
  const {levelProperties} = useCodebridgeContext();
  const activeFile = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return getActiveFileForSource(source);
  });
  const isAiTutorVersion = useAppSelector(
    state => state.lab2Project.viewingAiTutorVersion
  );
  const projectSourceBeforeAiTutorVersion = useAppSelector(
    state => state.lab2Project.projectSourceBeforeAiTutorVersion
  );

  const allowMergeView = experiments.isEnabledAllowingQueryString(
    experiments.ACCEPT_REJECT_UNIFIED_DIFF
  );

  const allowSplitView = experiments.isEnabledAllowingQueryString(
    experiments.ACCEPT_REJECT_SPLIT_DIFF
  );

  const dispatch = useAppDispatch();

  const onChange = useCallback(
    (value: string) => {
      if (activeFile?.id) {
        dispatch(saveFileThunk({fileId: activeFile.id, contents: value}));
      }
    },
    [dispatch, activeFile?.id]
  );

  // Only show unified diff view when we have AI tutor mode and projectSourceBeforeAiTutorVersion.
  // For new files that don't exist in projectSourceBeforeAiTutorVersion, we'll show diff against an empty document (empty string).
  // Used in key so we remount CodeEditor when this becomes true.
  const hasMergeView = useMemo(() => {
    return (
      isAiTutorVersion && projectSourceBeforeAiTutorVersion && activeFile?.name
    );
  }, [isAiTutorVersion, projectSourceBeforeAiTutorVersion, activeFile?.name]);

  const codeBeforeAiTutorVersion = useMemo(() => {
    if (projectSourceBeforeAiTutorVersion) {
      const originalFiles = projectSourceBeforeAiTutorVersion.files;
      const activeOriginalFile = activeFile?.name
        ? Object.values(originalFiles).find(f => f.name === activeFile.name)
        : undefined;

      // For new files that don't exist in the original version, we still want
      // to show diff highlighting so will assign an empty string to the original contents.
      const activeOriginalFileContents = activeOriginalFile?.contents ?? '';
      return activeOriginalFileContents;
    }
    return undefined;
  }, [projectSourceBeforeAiTutorVersion, activeFile?.name]);
  console.log('codeBeforeAiTutorVersion', codeBeforeAiTutorVersion);

  const editorConfigExtensions = useMemo(() => {
    const extensions: Extension[] = [];
    if (
      activeFile?.name &&
      enableUserAddedSelectionContext(levelProperties.appName)
    ) {
      const addToAiTutorField = getAddToAiTutorField(activeFile.name, dispatch);
      extensions.push(addToAiTutorField);
    }

    if (activeFile?.language && langMapping[activeFile.language]) {
      extensions.push(langMapping[activeFile.language]);
      if (activeFile.language === 'js') {
        // eslint configuration
        const config = {
          ...js.configs.recommended,
          languageOptions: {
            globals: {
              ...globals.browser,
            },
          },
        };

        extensions.push(linter(esLint(new eslint.Linter(), config)));
        extensions.push(lintGutter());
      } else if (activeFile.language === 'css') {
        // Add css color picker and remove white outline from color indicator.
        extensions.push(colorPicker);
        extensions.push(
          EditorView.theme({
            [`.${wrapperClassName}`]: {
              outlineColor: 'transparent',
            },
          })
        );
      }
    }
    if (
      allowMergeView &&
      !allowSplitView &&
      hasMergeView &&
      projectSourceBeforeAiTutorVersion
    ) {
      // For new files that don't exist in the original version, we still want
      // to show diff highlighting so will assign an empty string to the original contents.
      const activeOriginalFileContents = codeBeforeAiTutorVersion ?? '';
      extensions.push(
        unifiedMergeView({
          original: activeOriginalFileContents,
          mergeControls: false,
        })
      );
      // For new files (empty original), hide deletion markers so only green additions show.
      if (activeOriginalFileContents.length === 0) {
        extensions.push(
          EditorView.theme({
            '.cm-deletedLine': {display: 'none'},
            '.cm-deletedChunk': {display: 'none'},
          })
        );
      }
    }
    return extensions;
  }, [
    dispatch,
    activeFile?.language,
    activeFile?.name,
    langMapping,
    levelProperties.appName,
    hasMergeView,
    projectSourceBeforeAiTutorVersion,
    allowMergeView,
    allowSplitView,
    codeBeforeAiTutorVersion,
  ]);

  if (activeFile?.url && viewableImageFileType(activeFile.language)) {
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    return <img src={activeFile.url} alt={activeFile.name} tabIndex={0} />;
  }

  if (activeFile && !editableFileType(activeFile.language, editableFileTypes)) {
    return (
      <div>
        {codebridgeI18n.cannotEditFile({language: activeFile.language})}
      </div>
    );
  }

  return (
    <div className={moduleStyles.editorContainer}>
      {activeFile ? (
        <CodeEditor
          key={`${activeFile.id}/${hasMergeView ? 'diff' : 'normal'}`}
          onCodeChange={onChange}
          initialCode={activeFile.contents}
          appName={levelProperties.appName}
          editorConfigExtensions={editorConfigExtensions}
          codeBeforeAiTutorVersion={codeBeforeAiTutorVersion}
        />
      ) : (
        <CodebridgeEmptyState
          imageProps={{src: emptyFilesPlaceholderImage}}
          title={codebridgeI18n.noFilesOpen()}
          description={codebridgeI18n.noFilesOpenDescription()}
        />
      )}
    </div>
  );
};
