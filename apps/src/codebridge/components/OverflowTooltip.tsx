import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Tooltip, TooltipProps} from '@mui/material';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';

type OverflowTooltipProps = {
  children: React.ReactElement;
  title: React.ReactNode;
  placement?: TooltipProps['placement'];
};

function hasTruncatedText(el: HTMLElement): boolean {
  const {overflowX, whiteSpace} = getComputedStyle(el);
  const clips = overflowX === 'hidden' || overflowX === 'clip';
  // Icons report overflow even when the name isn't (folder-open is
  // wider than its 12px box). Only nowrap + clipped text counts.
  if (clips && whiteSpace === 'nowrap' && el.scrollWidth > el.clientWidth) {
    return true;
  }
  return Array.from(el.children).some(
    child => child instanceof HTMLElement && hasTruncatedText(child)
  );
}

/** Tooltip with `title` only when the child text is truncated. */
const OverflowTooltip: React.FunctionComponent<OverflowTooltipProps> = ({
  children,
  title,
  placement = 'left',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const {theme} = useTheme();

  const updateOverflow = useCallback(() => {
    if (containerRef.current) {
      setIsOverflowing(hasTruncatedText(containerRef.current));
    }
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, title, updateOverflow]);

  return (
    <Tooltip
      title={isOverflowing ? title : ''}
      placement={placement}
      // Default describeChild would overwrite the row's dnd-kit aria-describedby.
      describeChild={false}
      slotProps={{
        popper: {'data-theme': theme},
        tooltip: {'data-theme': theme},
      }}
    >
      {React.cloneElement(children, {
        ref: containerRef,
      } as {ref: React.Ref<HTMLElement>})}
    </Tooltip>
  );
};

export default OverflowTooltip;
