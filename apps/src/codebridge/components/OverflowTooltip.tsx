import React, {useEffect, useMemo, useRef, useState} from 'react';

import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

interface OverflowTooltipProps {
  children: React.ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  className?: string;
}

// Component that wraps children with a tooltip if the contents of the children
// are larger than a div wrapping them (with the given className).
// This allows us to show a tooltip on hover if the contents are overflowing.
const OverflowTooltip: React.FunctionComponent<OverflowTooltipProps> = ({
  children,
  tooltipOverlayClassName,
  tooltipProps,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    if (containerRef.current) {
      setShowTooltip(
        containerRef.current.offsetWidth < containerRef.current.scrollWidth
      );
    }
  }, [children]);

  const containedChildren = useMemo(() => {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }, [children, className]);

  return showTooltip ? (
    <WithTooltip
      tooltipProps={tooltipProps}
      tooltipOverlayClassName={tooltipOverlayClassName}
    >
      {containedChildren}
    </WithTooltip>
  ) : (
    containedChildren
  );
};

export default OverflowTooltip;
