import AddToAiTutorChatButton from '@codebridge/Editor/AddToAiTutorChatButton';
import {EditorState, StateField} from '@codemirror/state';
import {showTooltip, Tooltip} from '@codemirror/view';
import React from 'react';
import ReactDOM from 'react-dom';

import {addItemToUserAddedSelectionContext} from '@cdo/apps/aichat/redux/slice';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/editor.module.scss';

export const getAddToAiTutorField = (
  filename: string,
  dispatch: AppDispatch
) => {
  const getAddToAiTutorTooltips = (state: EditorState) => {
    return state.selection.ranges
      .filter(range => !range.empty)
      .map(range => {
        const startingPosition = state.selection.main.from;
        const endingPosition = state.selection.main.to;
        const startingLine = state.doc.lineAt(startingPosition);
        const endingLine = state.doc.lineAt(endingPosition);

        const selection = state.doc.sliceString(
          startingPosition,
          endingPosition
        );
        const selectionDisplayName = `${filename} (${startingLine.number}-${endingLine.number})`;
        const saveSelection = () =>
          dispatch(
            addItemToUserAddedSelectionContext({
              sourceCode: selection,
              displayName: selectionDisplayName,
              lineReference: {
                start: startingLine.number,
                end: endingLine.number,
              },
              filename: filename,
            })
          );
        return {
          pos: endingLine.from,
          above: false,
          arrow: false,
          clip: false,
          create: () => {
            const dom = document.createElement('div');
            dom.className = moduleStyles.aiTutorTooltip;
            ReactDOM.render(
              <AddToAiTutorChatButton saveSelectionContext={saveSelection} />,
              dom
            );
            return {dom};
          },
        };
      });
  };

  const addToAiTutorField = StateField.define<readonly Tooltip[]>({
    create: getAddToAiTutorTooltips,

    update(tooltips, tr) {
      if (!tr.docChanged && !tr.selection) return tooltips;
      return getAddToAiTutorTooltips(tr.state);
    },

    provide: f => showTooltip.computeN([f], state => state.field(f)),
  });

  return addToAiTutorField;
};
