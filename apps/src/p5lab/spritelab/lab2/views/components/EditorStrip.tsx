import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import EditorSwitch, {Editor} from './EditorSwitch';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface EditorStripProps {
  editor: Editor;
  onChange: (editor: Editor) => void;
  disabledEditors?: Partial<Record<Editor, string>>;
  /** Room kept clear of the preview's column. */
  style?: React.CSSProperties;
}

/**
 * The bar over the editors, as Music Lab's panel headers: the open editor's
 * name centred, the Code | World switch at its end.
 */
const EditorStrip: React.FunctionComponent<EditorStripProps> = ({
  editor,
  onChange,
  disabledEditors,
  style,
}) => (
  <div className={moduleStyles.editorStrip} style={style}>
    <MuiTypography
      component="h2"
      variant="overline2"
      className={moduleStyles.editorStripTitle}
    >
      {editor === 'World' ? 'World' : 'Workspace'}
    </MuiTypography>
    <div className={moduleStyles.editorStripEnd}>
      <EditorSwitch
        value={editor}
        onChange={onChange}
        disabledEditors={disabledEditors}
      />
    </div>
  </div>
);

export default EditorStrip;
