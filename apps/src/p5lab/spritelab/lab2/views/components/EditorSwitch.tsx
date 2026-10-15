import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import moduleStyles from '../sprite-lab2-view.module.scss';

export type Editor = 'Pictures' | 'World' | 'Code';

interface EditorSwitchProps {
  value: Editor;
  onChange: (editor: Editor, event: React.MouseEvent<HTMLElement>) => void;
  /** The editors on offer, in order; Code and World unless told otherwise. */
  editors?: Editor[];
  /** Stacked, to fit within the editors' left strip. */
  vertical?: boolean;
  /** Editors not on offer, each with its reason on hover: shown disabled,
      so the switch looks as it will once they are. */
  disabledEditors?: Partial<Record<Editor, string>>;
}

const DEFAULT_EDITORS: Editor[] = ['Code', 'World'];
const ICONS: Record<Editor, string> = {
  Pictures: 'images',
  Code: 'code',
  World: 'table-cells',
};

/** Which of the scene's editors fills the main area. */
const EditorSwitch: React.FunctionComponent<EditorSwitchProps> = ({
  value,
  onChange,
  editors = DEFAULT_EDITORS,
  vertical = false,
  disabledEditors = {},
}) => (
  <div
    className={classNames(
      moduleStyles.editorSwitch,
      vertical && moduleStyles.editorSwitchVertical
    )}
    role="group"
    aria-label="Edit"
  >
    {editors.map(editor => (
      <button
        key={editor}
        type="button"
        aria-pressed={value === editor}
        disabled={disabledEditors[editor] !== undefined}
        title={disabledEditors[editor]}
        className={classNames(
          moduleStyles.editorSwitchButton,
          value === editor && moduleStyles.editorSwitchActive
        )}
        onClick={event => {
          blurAfterPointerClick(event);
          onChange(editor, event);
        }}
      >
        <FontAwesomeV6Icon iconName={ICONS[editor]} iconStyle="solid" />
        {editor}
      </button>
    ))}
  </div>
);

export default EditorSwitch;
