import AddToAiTutorChatButton from '@codebridge/Editor/AddToAiTutorChatButton';
import {EditorState, StateField} from '@codemirror/state';
import {showTooltip, Tooltip} from '@codemirror/view';
import React from 'react';
import ReactDOM from 'react-dom';

import {addItemToUserAddedSelectionContext} from '@cdo/apps/aichat/redux/slice';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/editor.module.scss';

/**
 * Returns a CodeMirror StateField extension that adds a tooltip button
 * to add the current selection to the AI Tutor context. The button will only show up
 * when there is a non-empty selection. The button appears on the line below
 * the current selection, aligned to the beginning of the line to ensure the button is visible.
 * If the last line in the editor is selected and the last line is at the bottom of the screen,
 * the button will appear above the selection.
 *
 * Codemirror tooltip example: https://codemirror.net/examples/tooltip/
 */
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
