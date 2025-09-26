import {BodyOneText} from '@code-dot-org/component-library/typography';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import AiTutorChatContextButton from '@codebridge/Editor/AiTutorChatContextButton';
import {esLint} from '@codemirror/lang-javascript';
import {LanguageSupport} from '@codemirror/language';
import {linter, lintGutter} from '@codemirror/lint';
import {EditorState, Extension, StateField} from '@codemirror/state';
import {EditorView, showTooltip, Tooltip} from '@codemirror/view';
import js from '@eslint/js';
import {
  colorPicker,
  wrapperClassName,
} from '@replit/codemirror-css-color-picker';
import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';
import React, {useCallback, useMemo} from 'react';
import ReactDOM from 'react-dom';

import {addItemToUserAddedSelectionContext} from '@cdo/apps/aichat/redux/slice';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {saveFileThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  editableFileType,
  enableUserAddedSelectionContext,
  viewableImageFileType,
} from '../utils';

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
    const extensions: Extension[] = [];
    if (
      file?.name &&
      enableUserAddedSelectionContext(levelProperties.appName, file?.url)
    ) {
      console.log('adding tooltip?');
      const getCursorTooltips = (state: EditorState) => {
        return state.selection.ranges
          .filter(range => !range.empty)
          .map(range => {
            const startingPosition = state.selection.main.from;
            const endingPosition = state.selection.main.to;
            const startingLine = state.doc.lineAt(startingPosition).number;
            const endingLine = state.doc.lineAt(endingPosition).number;
            const selection = state.doc.sliceString(
              startingPosition,
              endingPosition
            );
            const selectionDisplayName = `${file.name} (${startingLine}-${endingLine})`;
            return {
              pos: range.to,
              above: false,
              strictSide: true,
              arrow: false,
              clip: false,
              create: () => {
                const dom = document.createElement('div');
                dom.className = moduleStyles.aiTutorTooltip;
                ReactDOM.render(
                  <AiTutorChatContextButton
                    saveSelectionContext={() =>
                      dispatch(
                        addItemToUserAddedSelectionContext({
                          sourceCode: selection,
                          displayName: selectionDisplayName,
                          lineReference: {start: startingLine, end: endingLine},
                          filename: file.name,
                        })
                      )
                    }
                  />,
                  dom
                );
                return {dom};
              },
            };
          });
      };

      const cursorTooltipField = StateField.define<readonly Tooltip[]>({
        create: getCursorTooltips,

        update(tooltips, tr) {
          if (!tr.docChanged && !tr.selection) return tooltips;
          return getCursorTooltips(tr.state);
        },

        provide: f => showTooltip.computeN([f], state => state.field(f)),
      });
      extensions.push(cursorTooltipField);
    } else {
      console.log('not adding tooltip');
    }
    if (file?.language && langMapping[file.language]) {
      extensions.push(langMapping[file.language]);
      if (file.language === 'js') {
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
      } else if (file.language === 'css') {
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

      return extensions;
    } else {
      return [];
    }
  }, [
    dispatch,
    file?.language,
    file?.name,
    file?.url,
    langMapping,
    levelProperties.appName,
  ]);

  if (file?.url && viewableImageFileType(file.language)) {
    return (
      <div>
        <img src={file.url} alt={file.name} />
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
