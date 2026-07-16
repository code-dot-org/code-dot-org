import React from 'react';

type FocusVisibleOnlyProps = {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  // Props injected by WithTooltip via cloneElement. Not intended to be set
  // by callers.
  'aria-describedby'?: string;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
};

// Filter that makes a WithTooltip open only on keyboard-visible focus. Sits
// as the direct child of WithTooltip so it receives WithTooltip's cloned
// onFocus/onBlur/onMouseEnter/onMouseLeave, then forwards a filtered onFocus
// to its own child and drops the mouse handlers entirely.
//
//   <WithTooltip tooltipProps={...}>
//     <FocusVisibleOnly>
//       <div tabIndex={0}>...</div>
//     </FocusVisibleOnly>
//   </WithTooltip>
//
// The tooltip's aria-describedby is merged with any pre-existing
// aria-describedby on the child (e.g. dnd-kit's drag-instructions id).
const FocusVisibleOnly: React.FC<FocusVisibleOnlyProps> = ({
  children,
  'aria-describedby': ariaDescribedBy,
  onFocus,
  onBlur,
}) => {
  const filteredOnFocus = (e: React.FocusEvent<HTMLElement>) => {
    if ((e.target as Element).matches(':focus-visible')) {
      onFocus?.(e);
    }
    children.props.onFocus?.(e);
  };
  const wrappedOnBlur = (e: React.FocusEvent<HTMLElement>) => {
    onBlur?.(e);
    children.props.onBlur?.(e);
  };
  const mergedDescribedBy =
    [ariaDescribedBy, children.props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;
  return React.cloneElement(children, {
    'aria-describedby': mergedDescribedBy,
    onFocus: filteredOnFocus,
    onBlur: wrappedOnBlur,
  });
};

export default FocusVisibleOnly;
