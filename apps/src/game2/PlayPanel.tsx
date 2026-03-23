import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Game2Runtime} from './runtime';
import {Game2ItemEntry} from './types';

import moduleStyles from './game2View.module.scss';

interface PlayPanelProps {
  visible: boolean;
  grid: string[][];
  items: Game2ItemEntry[];
  channelId: string | undefined;
  getCode: () => string;
}

const PlayPanel: React.FunctionComponent<PlayPanelProps> = ({
  visible,
  grid,
  items,
  channelId,
  getCode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Game2Runtime | null>(null);
  const [debugOn, setDebugOn] = useState(false);

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
    const runtime = new Game2Runtime(canvas, grid, items, channelId);
    runtimeRef.current = runtime;
    // Restore debug state across restarts.
    if (debugOn) {
      runtime.toggleDebug();
    }
    runtime.run(code);
  }, [grid, items, channelId, getCode, debugOn]);

  const handleToggleDebug = useCallback(() => {
    if (runtimeRef.current) {
      const nowOn = runtimeRef.current.toggleDebug();
      setDebugOn(nowOn);
    } else {
      setDebugOn(prev => !prev);
    }
  }, []);

  const hasStartedRef = useRef(false);
  const needsRestartRef = useRef(false);

  // Track when grid/items/code change while not visible — restart on return.
  const prevGridRef = useRef(grid);
  const prevItemsRef = useRef(items);
  useEffect(() => {
    if (grid !== prevGridRef.current || items !== prevItemsRef.current) {
      prevGridRef.current = grid;
      prevItemsRef.current = items;
      if (!visible) {
        needsRestartRef.current = true;
      }
    }
  }, [grid, items, visible]);

  // Auto-start when the panel first becomes visible, or restart if needed.
  useEffect(() => {
    if (visible) {
      if (!hasStartedRef.current || needsRestartRef.current) {
        hasStartedRef.current = true;
        needsRestartRef.current = false;
        startGame();
      }
    }
  }, [visible, startGame]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      runtimeRef.current?.stop();
      runtimeRef.current = null;
    };
  }, []);

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
      <div className={moduleStyles.playControls}>
        <button
          type="button"
          className={moduleStyles.playRestart}
          onClick={startGame}
        >
          Restart
        </button>
        <button
          type="button"
          className={`${moduleStyles.playDebugToggle} ${
            debugOn ? moduleStyles.playDebugToggleOn : ''
          }`}
          onClick={handleToggleDebug}
        >
          Debug
        </button>
      </div>
    </div>
  );
};

export default PlayPanel;
