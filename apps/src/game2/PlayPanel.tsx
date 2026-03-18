import React, {useCallback, useEffect, useRef} from 'react';

import {Game2Runtime} from './runtime';
import {Game2ImageEntry} from './types';

import moduleStyles from './game2View.module.scss';

interface PlayPanelProps {
  grid: boolean[][];
  images: Game2ImageEntry[];
  channelId: string | undefined;
  getCode: () => string;
}

const PlayPanel: React.FunctionComponent<PlayPanelProps> = ({
  grid,
  images,
  channelId,
  getCode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Game2Runtime | null>(null);

  const startGame = useCallback(() => {
    if (runtimeRef.current) {
      runtimeRef.current.stop();
      runtimeRef.current = null;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Size canvas to fill container.
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const code = getCode();
    const runtime = new Game2Runtime(canvas, grid, images, channelId);
    runtimeRef.current = runtime;
    runtime.run(code);
  }, [grid, images, channelId, getCode]);

  // Auto-start when the panel mounts.
  useEffect(() => {
    startGame();
    return () => {
      runtimeRef.current?.stop();
      runtimeRef.current = null;
    };
  }, [startGame]);

  // Resize canvas on window resize.
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (canvas && parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={moduleStyles.playPanel}>
      <canvas ref={canvasRef} className={moduleStyles.playCanvas} />
      <button
        type="button"
        className={moduleStyles.playRestart}
        onClick={startGame}
      >
        Restart
      </button>
    </div>
  );
};

export default PlayPanel;
