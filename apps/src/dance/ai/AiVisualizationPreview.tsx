import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import danceMetricsReporter from '../danceMetricsReporter';
import {DanceState} from '../danceRedux';
import ProgramExecutor from '../lab2/ProgramExecutor';

import moduleStyles from './ai-visualization-preview.module.scss';

interface AiVisualizationPreviewProps {
  id: string;
  code: string;
  size: number;
  durationMs?: number;
}

/**
 * Previews the output of the AI block in Dance Party.
 */
const AiVisualizationPreview: React.FunctionComponent<
  AiVisualizationPreviewProps
> = ({id, code, size, durationMs}) => {
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
      false, // no replay log
      danceMetricsReporter
    );
  }, [id]);

  useEffect(() => {
    if (songMetadata === undefined || executorRef.current === null) {
      return;
    }

    if (!executorRef.current.isLivePreviewRunning()) {
      executorRef.current.startLivePreview(code, songMetadata, durationMs);
    } else {
      executorRef.current.updateLivePreview(code, songMetadata, durationMs);
    }
  }, [songMetadata, code, durationMs]);

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
    <div
      id={id}
      style={{width: size, height: size}}
      className={moduleStyles.previewVisualization}
      ref={containerRef}
    />
  );
};

export default React.memo(AiVisualizationPreview);
