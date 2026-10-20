import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useRef} from 'react';

import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';

import EditorSwitch, {Editor} from './EditorSwitch';

import moduleStyles from '../sprite-lab2-view.module.scss';

/** The workspace's undo and redo, offered across from the switch. */
interface EditHistory {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

interface EditorStripProps {
  /** The open editor; with onChange, the switch shows too. */
  editor?: Editor;
  onChange?: (editor: Editor) => void;
  editors?: Editor[];
  disabledEditors?: Partial<Record<Editor, string>>;
  /** The name in the middle; the open editor's unless given. */
  title?: string;
  /** The switch at the bar's start instead of its end. */
  switchAtStart?: boolean;
  history?: EditHistory;
  /** Room kept clear of the preview's column. */
  style?: React.CSSProperties;
}

/**
 * The bar over a pane, as Lab2's panel headers: the pane's name centered,
 * and over the editors the Code | World switch at its end.
 */
const EditorStrip: React.FunctionComponent<EditorStripProps> = ({
  editor,
  onChange,
  editors,
  disabledEditors,
  title,
  switchAtStart = false,
  history,
  style,
}) => {
  // Takes focus from a button that its own click disables.
  const historyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={moduleStyles.editorStrip} style={style}>
      {history && (
        <div
          ref={historyRef}
          tabIndex={-1}
          className={classNames(
            moduleStyles.editorStripHistory,
            switchAtStart
              ? moduleStyles.editorStripEnd
              : moduleStyles.editorStripStart
          )}
        >
          <IconButtonWithTooltip
            id="spritelab2-undo"
            label="Undo"
            icon={{iconName: 'undo', iconStyle: 'solid'}}
            variant="text"
            color="secondary"
            size="extraSmall"
            tooltipDirection="onBottom"
            hideTooltipTail
            disabled={!history.canUndo}
            onClick={history.undo}
            containerRef={historyRef}
          />
          <IconButtonWithTooltip
            id="spritelab2-redo"
            label="Redo"
            icon={{iconName: 'redo', iconStyle: 'solid'}}
            variant="text"
            color="secondary"
            size="extraSmall"
            tooltipDirection="onBottom"
            hideTooltipTail
            disabled={!history.canRedo}
            onClick={history.redo}
            containerRef={historyRef}
          />
        </div>
      )}
      <MuiTypography
        component="h2"
        variant="overline2"
        className={moduleStyles.editorStripTitle}
      >
        {title ?? (editor === 'Code' ? 'Workspace' : editor)}
      </MuiTypography>
      {editor && onChange && (
        <div
          className={
            switchAtStart
              ? moduleStyles.editorStripStart
              : moduleStyles.editorStripEnd
          }
        >
          <EditorSwitch
            value={editor}
            onChange={onChange}
            editors={editors}
            disabledEditors={disabledEditors}
          />
        </div>
      )}
    </div>
  );
};

export default EditorStrip;
