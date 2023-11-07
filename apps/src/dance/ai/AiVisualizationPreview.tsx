import {BlockSvg} from 'blockly';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {DanceState} from '../danceRedux';
import ProgramExecutor from '../lab2/ProgramExecutor';
import moduleStyles from './ai-visualization-preview.module.scss';

interface AiVisualizationPreviewProps {
  id: string;
  blocks: BlockSvg[];
  size: number;
}

/**
 * Previews the output of the AI block in Dance Party.
 */
const AiVisualizationPreview: React.FunctionComponent<
  AiVisualizationPreviewProps
> = ({id, blocks, size}) => {
  const songMetadata = useSelector(
    (state: {dance: DanceState}) => state.dance.currentSongMetadata
  );

  const executorRef = useRef<ProgramExecutor | null>(null);
  // Create the executor on mount to make sure the preview div exists.
  useEffect(() => {
    executorRef.current = new ProgramExecutor(
      id,
      () => undefined, // no-op on puzzle complete
      true, // treat this as a readonly workspace
      false // no replay log
    );
  }, [id]);

  // Generate setup code for previewing the given blocks.
  const generateSetupCode = (blocks: BlockSvg[]): string => {
    if (blocks.length === 0) {
      console.log('No blocks to preview');
      return '';
    }
    // Create a temporary setup block
    const setup: BlockSvg = Blockly.getMainWorkspace().newBlock(
      'Dancelab_whenSetup'
    ) as BlockSvg;

    // Attach the blocks to the setup block
    setup.getInput('DO')?.connection?.connect(blocks[0].previousConnection);

    if (!Blockly.getGenerator().isInitialized) {
      Blockly.getGenerator().init(Blockly.getMainWorkspace());
    }

    // Remove the temp setup block from the workspace so it doesn't remain after preview
    Blockly.getMainWorkspace().removeTopBlock(setup);
    return Blockly.getGenerator().blockToCode(setup);
  };

  useEffect(() => {
    if (songMetadata === undefined || executorRef.current === null) {
      return;
    }

    const code = generateSetupCode(blocks);
    if (!executorRef.current.isLivePreviewRunning()) {
      executorRef.current.startLivePreview(code, songMetadata);
    } else {
      executorRef.current.updateLivePreview(code, songMetadata);
    }
  }, [songMetadata, blocks]);

  const containerRef = useRef<HTMLDivElement>(null);

  // HACK: P5 Play hardcodes the canvas size to 400x400 no matter what the container
  // size is. This forces the canvas size to match the container size (200x200).
  useEffect(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.children[0] as HTMLElement;
      if (canvas) {
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
      }
    }
  }, [containerRef, size]);

  // Destroy on unmount
  useEffect(() => () => executorRef.current?.destroy(), []);

  return (
    <div>
      <div
        id={id}
        style={{width: size, height: size}}
        className={moduleStyles.previewVisualization}
        ref={containerRef}
      />
    </div>
  );
};

export default AiVisualizationPreview;
