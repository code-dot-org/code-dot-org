/* Shows an element's whole text on hover, only while the element cuts it off. */
import {Tooltip} from '@mui/material';
import {type ReactElement, useRef, useState} from 'react';

interface TruncatedTextTooltipProps {
  title: string;
  children: ReactElement;
}

const TruncatedTextTooltip = ({title, children}: TruncatedTextTooltipProps) => {
  const textRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const openIfCutOff = () => {
    const text = textRef.current!;
    setOpen(text.scrollWidth > text.clientWidth);
  };

  return (
    <Tooltip
      ref={textRef}
      title={title}
      open={open}
      onOpen={openIfCutOff}
      onClose={close}
      placement="top"
      describeChild
      // The canvas would pan or zoom out from under an open tooltip.
      onPointerDown={close}
      // d3-zoom stops the wheel from bubbling.
      onWheelCapture={close}
    >
      {children}
    </Tooltip>
  );
};

export default TruncatedTextTooltip;
