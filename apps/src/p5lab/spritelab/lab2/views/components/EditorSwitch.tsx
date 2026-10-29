import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React from 'react';

export type Editor = 'Images' | 'World' | 'Code';

interface EditorSwitchProps {
  value: Editor;
  onChange: (editor: Editor) => void;
  /** The editors on offer, in order; Code and World unless told otherwise. */
  editors?: Editor[];
  /** Editors this level does not enable; shown disabled rather than left
      out, so the switch keeps one shape across the unit's levels. */
  disabledEditors?: Editor[];
}

const DEFAULT_EDITORS: Editor[] = ['Code', 'World'];
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
}) => (
  <div role="group" aria-label="Edit">
    <SegmentedButtons
      size="s"
      selectedButtonValue={value}
      onChange={editor => onChange(editor as Editor)}
      buttons={editors.map(editor => ({
        value: editor,
        label: editor,
        iconLeft: {iconName: ICONS[editor], iconStyle: 'solid'},
        disabled: disabledEditors.includes(editor),
      }))}
    />
  </div>
);

export default EditorSwitch;
