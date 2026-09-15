import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import moduleStyles from './image-details-dialog.module.scss';

// Art rows in the pixelated bot: coarse enough to read as pixel art at the
// bot's 64px display height, fine enough to keep its face.
const PIXEL_BOT_ROWS = 28;

interface TemperatureBotProps {
  src: string;
  /** Draw through a coarse pixel grid, to match pixel-art style. */
  pixelated: boolean;
}

/**
 * The bot beside the temperature slider, whose expression follows it. The
 * pixelated form is the image downsampled onto a small canvas and CSS-upscaled
 * with image-rendering: pixelated. Both forms stay mounted and CSS shows one,
 * so toggling shows a bot that is already drawn instead of flickering through
 * an image load.
 */
const TemperatureBot: React.FunctionComponent<TemperatureBotProps> = ({
  src,
  pixelated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) {
        return;
      }
      canvas.height = PIXEL_BOT_ROWS;
      canvas.width = Math.max(
        1,
        Math.round((PIXEL_BOT_ROWS * image.width) / image.height)
      );
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return (
    <>
      <canvas
        ref={canvasRef}
        className={classNames(
          moduleStyles.bot,
          moduleStyles.botPixelated,
          !pixelated && moduleStyles.botHidden
        )}
        aria-hidden
      />
      <img
        src={src}
        className={classNames(
          moduleStyles.bot,
          pixelated && moduleStyles.botHidden
        )}
        alt=""
        draggable={false}
      />
    </>
  );
};

export default TemperatureBot;
