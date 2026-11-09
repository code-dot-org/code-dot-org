import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

export type Editor = 'Images' | 'World' | 'Code';

interface EditorSwitchProps {
  value: Editor;
  onChange: (editor: Editor) => void;
  /** The editors on offer, in order; Code and World unless told otherwise. */
  editors?: Editor[];
  /** Editors this level does not enable; shown disabled rather than left
      out, so the switch keeps one shape across the unit's levels. */
  disabledEditors?: Editor[];
  /** Splits the switch in two after an editor, with a control between the
      halves: the scene picker, which the editors after it both reflect. */
  between?: {after: Editor; node: React.ReactNode};
}

const DEFAULT_EDITORS: Editor[] = ['Code', 'World'];

/** The switch button's element id, for a callout to point at. */
export const editorSwitchButtonId = (editor: Editor): string =>
  `editor-switch-${editor.toLowerCase()}`;
const ICONS: Record<Editor, string> = {
  Images: 'images',
  Code: 'code',
  World: 'table-cells',
};

/** Which of the scene's editors fills the main area. */
const EditorSwitch: React.FunctionComponent<EditorSwitchProps> = ({
  value,
  onChange,
  editors = DEFAULT_EDITORS,
  disabledEditors = [],
  between,
}) => {
  const buttons = (group: Editor[]) =>
    group.length > 0 && (
      <SegmentedButtons
        size="s"
        selectedButtonValue={value}
        onChange={editor => onChange(editor as Editor)}
        buttons={group.map(editor => ({
          id: editorSwitchButtonId(editor),
          value: editor,
          label: editor,
          iconLeft: {iconName: ICONS[editor], iconStyle: 'solid'},
          disabled: disabledEditors.includes(editor),
        }))}
      />
    );
  const cut = between ? editors.indexOf(between.after) + 1 : editors.length;
  return (
    <div role="group" aria-label="Edit" className={moduleStyles.editorSwitch}>
      {buttons(editors.slice(0, cut))}
      {between?.node}
      {buttons(editors.slice(cut))}
    </div>
  );
};

export default EditorSwitch;
