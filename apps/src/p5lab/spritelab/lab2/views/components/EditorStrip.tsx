import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import {PixelEditorHistory} from '@cdo/apps/pixelEditor/PixelEditor';

import EditorSwitch, {Editor} from './EditorSwitch';

import moduleStyles from '../sprite-lab2-view.module.scss';

// Least room between the bar's start and a title placed from the left.
const START_GAP = 12;

/** The open editor's undo and redo, offered across from the switch: the
    shape the pixel editor reports, which the Code tab fills from Blockly. */
export type EditHistory = PixelEditorHistory;

interface EditorStripProps {
  /** The open editor; with onChange, the switch shows too. */
  editor?: Editor;
  onChange?: (editor: Editor) => void;
  editors?: Editor[];
  disabledEditors?: Editor[];
  /** Button text to show instead of an editor's name. */
  editorLabels?: Partial<Record<Editor, string>>;
  /** The name in the middle; the open editor's unless given. */
  title?: string;
  /** Shown in place of the name. */
  titleContent?: React.ReactNode;
  /** Where titleContent starts, in pixels from the bar's left edge;
      centered when left out. Never over the bar's start. */
  titleContentLeft?: number;
  /** The switch at the bar's start instead of its end; undo and redo
      sit across from it either way. */
  switchAtStart?: boolean;
  history?: EditHistory;
  /** Receives an empty element at the bar's right end. A caller draws its
      own controls into it (with a portal), such as an info button. */
  endSlotRef?: (element: HTMLDivElement | null) => void;
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
  editorLabels,
  title,
  titleContent,
  titleContentLeft,
  switchAtStart = false,
  history,
  endSlotRef,
  style,
}) => {
  const startRef = useRef<HTMLDivElement>(null);
  const [startEnd, setStartEnd] = useState(0);
  const placedFromLeft = titleContent && titleContentLeft !== undefined;
  useLayoutEffect(() => {
    const start = startRef.current;
    if (!placedFromLeft || !start) {
      return;
    }
    const measure = () => setStartEnd(start.offsetLeft + start.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(start);
    return () => observer.disconnect();
  }, [placedFromLeft]);
  // Takes focus from a button that its own click disables.
  const historyRef = useRef<HTMLDivElement>(null);
  const historyNode = history && (
    <div
      ref={historyRef}
      tabIndex={-1}
      className={moduleStyles.editorStripHistory}
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
  );
  const switchNode = editor && onChange && (
    <EditorSwitch
      value={editor}
      onChange={onChange}
      editors={editors}
      disabledEditors={disabledEditors}
      labels={editorLabels}
    />
  );
  return (
    <div
      className={classNames(
        moduleStyles.editorStrip,
        onChange && moduleStyles.editorStripEditors
      )}
      style={style}
    >
      <div ref={startRef} className={moduleStyles.editorStripStart}>
        {switchAtStart ? switchNode : historyNode}
      </div>
      {titleContent ? (
        <div
          className={classNames(
            moduleStyles.editorStripTitle,
            titleContentLeft !== undefined &&
              moduleStyles.editorStripTitleFromLeft
          )}
          style={
            titleContentLeft !== undefined
              ? {left: Math.max(titleContentLeft, startEnd + START_GAP)}
              : undefined
          }
        >
          {titleContent}
        </div>
      ) : (
        <MuiTypography
          component="h2"
          variant="overline2"
          className={moduleStyles.editorStripTitle}
        >
          {title ?? (editor === 'Code' ? 'Workspace' : editor)}
        </MuiTypography>
      )}
      <div className={moduleStyles.editorStripEnd}>
        {switchAtStart ? historyNode : switchNode}
        {endSlotRef && (
          <div ref={endSlotRef} className={moduleStyles.editorStripEndSlot} />
        )}
      </div>
    </div>
  );
};

export default EditorStrip;
