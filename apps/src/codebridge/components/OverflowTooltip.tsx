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
  // Icons and flex wrappers often report scrollWidth > clientWidth even
  // when the label isn't truncated (folder-open is wider than the 12px box).
  // Only a nowrap + clipped text node is an ellipsis'd name.
  if (clips && whiteSpace === 'nowrap' && el.scrollWidth > el.clientWidth) {
    return true;
  }
  return Array.from(el.children).some(
    child => child instanceof HTMLElement && hasTruncatedText(child)
  );
}

/**
 * Shows an MUI tooltip with `title` only when `children` overflow.
 * Clones `children` so the tooltip anchors to that element (hover and focus).
 */
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
      // Theme defaults describeChild on, which would overwrite the file
      // row's dnd-kit aria-describedby. The trigger already names itself.
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
