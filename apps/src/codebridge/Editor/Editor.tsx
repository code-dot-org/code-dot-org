import {BodyOneText} from '@code-dot-org/component-library/typography';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {LanguageSupport} from '@codemirror/language';
import React, {useCallback, useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {saveFileThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {editableFileType, viewableImageFileType} from '../utils';

import moduleStyles from './styles/editor.module.scss';

interface EditorProps {
  langMapping: {[key: string]: LanguageSupport};
  editableFileTypes: string[];
}

export const Editor = ({langMapping, editableFileTypes}: EditorProps) => {
  const {levelProperties} = useCodebridgeContext();
  const file = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return getActiveFileForSource(source);
  });
  const dispatch = useAppDispatch();

  const onChange = useCallback(
    (value: string) => {
      if (file?.id) {
        dispatch(saveFileThunk({fileId: file.id, contents: value}));
      }
    },
    [dispatch, file?.id]
  );

  const editorConfigExtensions = useMemo(() => {
    if (file?.language && langMapping[file.language]) {
      return [langMapping[file.language]];
    } else {
      return [];
    }
  }, [file?.language, langMapping]);

  if (file && viewableImageFileType(file.language)) {
    const base64 = window.btoa(file.contents);
    return (
      <div>
        <img src={`data:image/png;base64,${base64}`} alt={file.name} />
      </div>
    );
  }

  if (file && !editableFileType(file.language, editableFileTypes)) {
    return (
      <div>{codebridgeI18n.cannotEditFile({language: file.language})}</div>
    );
  }

  return (
    <div className={moduleStyles.editorContainer}>
      {file ? (
        <CodeEditor
          key={`${file.id}/${1}`}
          onCodeChange={onChange}
          startCode={file.contents}
          appName={levelProperties.appName}
          editorConfigExtensions={editorConfigExtensions}
        />
      ) : (
        <div className={moduleStyles.noOpenFilesContainer}>
          <BodyOneText className={moduleStyles.noOpenFilesMessage}>
            {codebridgeI18n.noOpenFiles()}
          </BodyOneText>
        </div>
      )}
    </div>
  );
};
