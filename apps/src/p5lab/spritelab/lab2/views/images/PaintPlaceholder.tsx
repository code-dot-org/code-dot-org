import classNames from 'classnames';
import React, {useLayoutEffect, useRef} from 'react';

import styles from './images-tab.module.scss';

interface PaintPlaceholderProps {
  /** The picture, decoded ahead, or a copy of the canvas being left,
      painted before the first frame; an <img> of the URL would take a
      frame to show, which reads as a flash of the empty frame. */
  picture?: HTMLImageElement | HTMLCanvasElement;
  /** The picture's address, for when it has not been decoded. */
  src?: string;
  pixelated?: boolean;
}

/** A picture laid over the frame until what is under it has been drawn:
    over the tools' canvas while they decode their own copy, and over the
    stored picture as the tools close. */
const PaintPlaceholder: React.FunctionComponent<PaintPlaceholderProps> = ({
  picture,
  src,
  pixelated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !picture) {
      return;
    }
    const image = 'naturalWidth' in picture;
    canvas.width = image ? picture.naturalWidth : picture.width;
    canvas.height = image ? picture.naturalHeight : picture.height;
    canvas.getContext('2d')?.drawImage(picture, 0, 0);
  }, [picture]);
  const className = classNames(
    styles.paintPlaceholder,
    pixelated && styles.pixelArt
  );
  return picture ? (
    <canvas ref={canvasRef} className={className} aria-hidden />
  ) : (
    <img src={src} alt="" className={className} />
  );
};

export default PaintPlaceholder;
