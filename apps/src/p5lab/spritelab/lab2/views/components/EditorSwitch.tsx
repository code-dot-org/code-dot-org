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
}

const EDITORS: {editor: Editor; icon: string}[] = [
  {editor: 'Code', icon: 'code'},
  {editor: 'World', icon: 'table-cells'},
];

/**
 * Which of the scene's two editors fills the main area: its world or its
 * code. They are peers, each relying on the other's work, so the switch
 * gives them equal rank.
 */
const EditorSwitch: React.FunctionComponent<EditorSwitchProps> = ({
  value,
  onChange,
  vertical = false,
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
