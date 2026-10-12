import {Tooltip, type TooltipProps} from '@mui/material';
import type {Instance} from '@popperjs/core';
import {
  type ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {CanvasMoveContext} from './TreeCanvas';

interface TruncatedTextTooltipProps {
  title: string;
  focused: boolean;
  placement: TooltipProps['placement'];
  children: ReactElement;
}

function isCutOff(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth;
}

const TruncatedTextTooltip = ({
  title,
  focused,
  placement,
  children,
}: TruncatedTextTooltipProps) => {
  const textRef = useRef<HTMLElement>(null);
  const popperRef = useRef<Instance>(null);
  const subscribeToMoves = useContext(CanvasMoveContext);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const text = textRef.current!;
    setOpen((focused || text.matches(':hover')) && isCutOff(text));
  }, [focused]);

  useEffect(() => {
    if (open) {
      return subscribeToMoves(() => popperRef.current!.update());
    }
  }, [open, subscribeToMoves]);

  return (
    <Tooltip
      ref={textRef}
      title={title}
      open={open}
      onOpen={() => setOpen(isCutOff(textRef.current!))}
      onClose={() => setOpen(focused && isCutOff(textRef.current!))}
      placement={placement}
      describeChild
      slotProps={{
        popper: {
          popperRef,
          sx: {'&[data-popper-reference-hidden]': {visibility: 'hidden'}},
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default TruncatedTextTooltip;
