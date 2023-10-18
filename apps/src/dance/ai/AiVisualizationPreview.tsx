import {BlockSvg} from 'blockly';
import React, {useCallback, useEffect, useRef} from 'react';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import ProgramExecutor from '../lab2/ProgramExecutor';
import moduleStyles from './ai-visualization-preview.module.scss';

interface AiVisualizationPreviewProps {
  blocks: BlockSvg[];
}

const PREVIEW_DIV_ID = 'ai-preview';

/**
 * Previews the output of the AI block in Dance Party.
 */
const AiVisualizationPreview: React.FunctionComponent<
  AiVisualizationPreviewProps
> = ({blocks}) => {
  // Generate setup code for previewing the given blocks.
  const generateSetupCode = useCallback((): string => {
    if (blocks.length === 0) {
      console.log('No blocks to preview');
      return '';
    }
    // Create a temporary setup block
    const setup: BlockSvg = Blockly.getMainWorkspace().newBlock(
      BLOCK_TYPES.danceWhenSetup
    ) as BlockSvg;

    // Attach the blocks to the setup block
    setup.getInput('DO')?.connection?.connect(blocks[0].previousConnection);

    if (!Blockly.getGenerator().isInitialized) {
      Blockly.getGenerator().init(Blockly.getMainWorkspace());
    }

    // Remove the temp setup block from the workspace so it doesn't remain after preview
    Blockly.getMainWorkspace().removeTopBlock(setup);
    return Blockly.getGenerator().blockToCode(setup);
  }, [blocks]);

  useEffect(() => {
    // Create a new program executor whenever preview code changes
    // to ensure that P5 is destroyed and reloaded correctly.
    const executor: ProgramExecutor = new ProgramExecutor(
      PREVIEW_DIV_ID,
      () => generateSetupCode(),
      () => undefined, // no-op on puzzle complete
      false, // isReadonly not used
      false // no replay log
    );
    executor.preview();
    return () => {
      executor.destroy();
    };
  }, [blocks, generateSetupCode]);

  const containerRef = useRef<HTMLDivElement>(null);
  const blockPreviewContainerRef = useRef<HTMLDivElement>(null);

  // HACK: P5 Play hardcodes the canvas size to 400x400 no matter what the container
  // size is. This forces the canvas size to match the container size (200x200).
  useEffect(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.children[0] as HTMLElement;
      if (canvas) {
        canvas.style.width = moduleStyles.previewSize;
        canvas.style.height = moduleStyles.previewSize;
      }
    }
  }, [containerRef]);

  return (
    <div>
      <div
        id={PREVIEW_DIV_ID}
        className={moduleStyles.previewVisualization}
        ref={containerRef}
      />
    </div>
  );
};

export default AiVisualizationPreview;
