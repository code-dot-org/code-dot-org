import {BlockSvg, Workspace, WorkspaceSvg} from 'blockly';
import React, {useEffect, useRef} from 'react';
import moduleStyles from './ai-block-preview.module.scss';
import {generateBlocksFromResult} from './utils';

interface AiBlockPreviewProps {
  fadeIn: boolean;
  resultJson: string;
  onComplete: () => void;
}

/**
 * Previews the blocks generated by the AI block in Dance Party.
 */
const AiBlockPreview: React.FunctionComponent<AiBlockPreviewProps> = ({
  fadeIn,
  resultJson,
  onComplete,
}) => {
  const blockPreviewContainerRef = useRef<HTMLSpanElement>(null);
  const refTimer = useRef<number | null>(null);
  const workspaceRef = useRef<Workspace | null>(null);

  // Create the workspace once the container has been rendered.
  useEffect(() => {
    if (!blockPreviewContainerRef.current) {
      return;
    }

    const emptyBlockXml = Blockly.utils.xml.textToDom('<xml></xml>');
    workspaceRef.current = Blockly.BlockSpace.createReadOnlyBlockSpace(
      blockPreviewContainerRef.current,
      emptyBlockXml,
      {}
    );
  }, [blockPreviewContainerRef]);

  // Start the timer.
  useEffect(() => {
    refTimer.current = window.setTimeout(
      () => {
        onComplete();
        if (refTimer.current) {
          clearTimeout(refTimer.current);
          refTimer.current = null;
        }
      },
      fadeIn ? 5000 : 2500
    );

    return () => {
      if (refTimer.current) {
        clearTimeout(refTimer.current);
      }
    };
  }, [onComplete, fadeIn]);

  // Build out the blocks.
  useEffect(() => {
    if (!blockPreviewContainerRef.current || !workspaceRef.current) {
      return;
    }
    const blocksSvg = generateBlocksFromResult(workspaceRef.current);
    blocksSvg.forEach((blockSvg: BlockSvg) => {
      blockSvg.initSvg();
      blockSvg.render();
    });
    Blockly.svgResize(workspaceRef.current as WorkspaceSvg);

    return () => {
      workspaceRef.current?.clear();
    };
  }, [blockPreviewContainerRef, generateBlocksFromResult]);

  // Dispose of the workspace on unmount.
  useEffect(() => () => workspaceRef.current?.dispose(), []);

  return (
    <div id={fadeIn ? 'fade-in' : undefined}>
      <span ref={blockPreviewContainerRef} className={moduleStyles.container} />
    </div>
  );
};

export default AiBlockPreview;
