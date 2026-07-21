import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  ReactNode,
  HTMLAttributes,
} from 'react';
import {createPortal} from 'react-dom';

import {updatePositionedElementStyles} from '@/common/helpers';
import {ComponentPlacementDirection} from '@/common/types';

import Tooltip, {TooltipOverlay, TooltipProps} from './_Tooltip';

const TAIL_OFFSET = 4;
const TAIL_LENGTHS = {l: 12, m: 9, s: 6, xs: 6};

// Track keyboard vs pointer input at the document level. We do this instead
// of using :focus-visible because jsdom cannot distinguish the two.
let hadKeyboardEvent = false;
let listenersAttached = false;

const trackInputMode = () => {
  if (listenersAttached || typeof document === 'undefined') return;
  listenersAttached = true;
  const clearKeyboardFlag = () => {
    hadKeyboardEvent = false;
  };
  document.addEventListener(
    'keydown',
    event => {
      // Modifier-only presses (Alt/Ctrl/Meta) aren't navigation.
      if (event.metaKey || event.altKey || event.ctrlKey) return;
      hadKeyboardEvent = true;
    },
    true,
  );
  document.addEventListener('mousedown', clearKeyboardFlag, true);
  document.addEventListener('pointerdown', clearKeyboardFlag, true);
  document.addEventListener('touchstart', clearKeyboardFlag, true);
};

export interface WithKeyboardTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
}

// Like WithTooltip, but only shows on keyboard focus — hover and click are
// ignored. Use for keyboard-navigation hints.
//
// WCAG: only put content that is genuinely keyboard-specific here (e.g.,
// "Press arrows to move"). Info a mouse user also needs belongs in
// WithTooltip — hiding it from pointer users breaks information parity.
const WithKeyboardTooltip: React.FC<WithKeyboardTooltipProps> = ({
  children,
  tooltipOverlayClassName,
  tooltipProps,
}) => {
  // Non-null anchor = tooltip is shown, positioned relative to it.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [direction, setDirection] = useState<ComponentPlacementDirection>(
    tooltipProps.direction || 'onTop',
  );
  const [styles, setStyles] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(trackInputMode, []);

  useEffect(() => {
    if (!anchor) return;
    const reposition = () =>
      updatePositionedElementStyles({
        nodePosition: anchor,
        positionedElementRef: tooltipRef,
        direction,
        setPositionedElementStyles: setStyles,
        setPositionedElementDirection: setDirection,
        tailOffset: TAIL_OFFSET,
        tailLength: TAIL_LENGTHS[tooltipProps.size || 'm'],
      });
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [anchor, direction, tooltipProps.size]);

  useEffect(() => {
    if (!anchor) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAnchor(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [anchor]);

  const wrapped =
    isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    cloneElement(children, {
      'aria-describedby': tooltipProps.tooltipId,
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        if (hadKeyboardEvent) setAnchor(event.target as HTMLElement);
        children.props.onFocus?.(event);
      },
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        setAnchor(null);
        children.props.onBlur?.(event);
      },
    });

  return (
    <TooltipOverlay className={tooltipOverlayClassName}>
      {wrapped}
      {anchor &&
        createPortal(
          <Tooltip
            {...tooltipProps}
            direction={direction}
            ref={tooltipRef}
            style={{...styles, ...tooltipProps.style}}
          />,
          document.body,
        )}
    </TooltipOverlay>
  );
};

export default WithKeyboardTooltip;
