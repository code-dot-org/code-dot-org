import AiTutorChatContextButton from '@codebridge/Editor/AiTutorChatContextButton';
import {EditorState, StateField} from '@codemirror/state';
import {showTooltip, Tooltip} from '@codemirror/view';
import React from 'react';
import ReactDOM from 'react-dom';

import {addItemToUserAddedSelectionContext} from '@cdo/apps/aichat/redux/slice';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/editor.module.scss';

export const getAddToAiTutorExtension = (
  filename: string,
  dispatch: AppDispatch
) => {
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
        const selectionDisplayName = `${filename} (${startingLine}-${endingLine})`;
        const saveSelection = () =>
          dispatch(
            addItemToUserAddedSelectionContext({
              sourceCode: selection,
              displayName: selectionDisplayName,
              lineReference: {start: startingLine, end: endingLine},
              filename: filename,
            })
          );
        return {
          pos: range.to,
          above: false,
          arrow: false,
          clip: false,
          create: () => {
            const dom = document.createElement('div');
            dom.className = moduleStyles.aiTutorTooltip;
            ReactDOM.render(
              <AiTutorChatContextButton saveSelectionContext={saveSelection} />,
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

  return cursorTooltipField;
};
