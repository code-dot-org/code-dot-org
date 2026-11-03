// An actor's drawing, on a page of its own (specs/DRAWING_PAGE_PLAN.md): a
// step on the trail, "Label › Drawing". Its head says the size it is drawn
// at, in sockets; the pen and shapes hang below.

import {Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import stepStyles from '../../rules/editor/ruleEditor.module.css';
import type {ActorData} from '../actorData';
import {drawingDocument, withDrawingDocument} from '../actorDrawing';

export interface DrawingPageProps {
  data: ActorData;
  fileId: string;
  isReadOnly: boolean;
  /** Change the actor's data as the file now holds it. */
  onUpdate: (change: (data: ActorData) => ActorData) => void;
}

export const DrawingPage = ({
  data,
  fileId,
  isReadOnly,
  onUpdate,
}: DrawingPageProps) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  // Read once: the editor takes its contents when it mounts.
  const [document] = useState(() => drawingDocument(data));
  const id = `${fileId}-drawing`;

  return (
    <div className={stepStyles.stepPage}>
      <div
        className={stepStyles.stepBar}
        role="group"
        aria-labelledby={`${id}-heading`}
      >
        <Typography
          ref={heading}
          id={`${id}-heading`}
          tabIndex={-1}
          variant="h5"
          component="h2"
          className={stepStyles.heading}
        >
          Drawing: {data.name}
        </Typography>
        <Typography variant="body3" component="p" className={stepStyles.note}>
          The size is the picture, and how big {data.name} is for clicks and
          collisions. The pen and the shapes go below it.
        </Typography>
      </div>
      <div className={stepStyles.codeBlocks}>
        <BlocklyFileEditor
          fileId={fileId}
          language="actor"
          isReadOnly={isReadOnly}
          initialContents={document}
          memberHead={{drawing: true}}
          onChange={saved => onUpdate(now => withDrawingDocument(now, saved))}
        />
      </div>
    </div>
  );
};
