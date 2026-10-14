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

interface FullTextTooltipProps {
  title: string;
  focused: boolean;
  placement: TooltipProps['placement'];
  children: ReactElement;
}

function isCutOff(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth;
}

const FullTextTooltip = ({
  title,
  focused,
  placement,
  children,
}: FullTextTooltipProps) => {
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

  useEffect(() => {
    if (open && focused) {
      const dismiss = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          setOpen(false);
        }
      };
      document.addEventListener('keydown', dismiss, true);
      return () => document.removeEventListener('keydown', dismiss, true);
    }
  }, [open, focused]);

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

export default FullTextTooltip;
