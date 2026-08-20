import {useEffect, useRef} from 'react';
import type {PointerEvent} from 'react';

import styles from './build-lab.module.scss';

type Tool = 'Draw' | 'Fill' | 'Eraser';

interface Props {
  color: string;
  height: number;
  imageData?: string;
  onChange: (dataUrl: string) => void;
  seedColor: string;
  tool: Tool;
}

const ART_WIDTH = 32;

export default function InlinePixelEditor({
  color,
  height,
  imageData,
  onChange,
  seedColor,
  tool,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const drawSeed = () => {
      context.clearRect(0, 0, ART_WIDTH, height);
      context.fillStyle = seedColor;
      context.fillRect(0, 0, ART_WIDTH, height);
      context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      context.fillRect(3, 3, 10, 10);
      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
      context.fillRect(19, height - 12, 10, 9);
    };

    if (!imageData) {
      drawSeed();
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, ART_WIDTH, height);
      context.drawImage(image, 0, 0, ART_WIDTH, height);
    };
    image.onerror = drawSeed;
    image.src = imageData;
  }, [height, imageData, seedColor]);

  const pointForEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          ART_WIDTH - 1,
          Math.floor(((event.clientX - rect.left) / rect.width) * ART_WIDTH),
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          height - 1,
          Math.floor(((event.clientY - rect.top) / rect.height) * height),
        ),
      ),
    };
  };

  const paint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const {x, y} = pointForEvent(event);
    if (tool === 'Fill') {
      context.clearRect(0, 0, ART_WIDTH, height);
      context.fillStyle = color;
      context.fillRect(0, 0, ART_WIDTH, height);
      drawingRef.current = false;
      onChange(canvas.toDataURL('image/png'));
      return;
    }

    if (tool === 'Eraser') {
      context.clearRect(x, y, 1, 1);
    } else {
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    }
  };

  const finishStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) {
      return;
    }
    drawingRef.current = false;
    onChange(canvas.toDataURL('image/png'));
  };

  return (
    <canvas
      aria-label="Pixel art editor"
      className={styles.pixelCanvas}
      height={height}
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drawingRef.current = true;
        paint(event);
      }}
      onPointerLeave={finishStroke}
      onPointerMove={event => drawingRef.current && paint(event)}
      onPointerUp={finishStroke}
      ref={canvasRef}
      width={ART_WIDTH}
    />
  );
}
