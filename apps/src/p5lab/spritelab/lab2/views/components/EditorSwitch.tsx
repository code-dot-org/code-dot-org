import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import moduleStyles from '../sprite-lab2-view.module.scss';

export type Editor = 'World' | 'Code';

interface EditorSwitchProps {
  value: Editor;
  onChange: (editor: Editor, event: React.MouseEvent<HTMLElement>) => void;
  /** Stacked, to fit within the editors' left strip. */
  vertical?: boolean;
  /** Editors not on offer, each with its reason on hover: shown disabled,
      so the switch looks as it will once they are. */
  disabledEditors?: Partial<Record<Editor, string>>;
}

const EDITORS: {editor: Editor; icon: string}[] = [
  {editor: 'Code', icon: 'code'},
  {editor: 'World', icon: 'table-cells'},
];

/**
 * Which of the scene's two editors fills the main area: its world or its
 * code.
 */
const EditorSwitch: React.FunctionComponent<EditorSwitchProps> = ({
  value,
  onChange,
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
    {EDITORS.map(({editor, icon}) => (
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
        <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
        {editor}
      </button>
    ))}
  </div>
);

export default EditorSwitch;
