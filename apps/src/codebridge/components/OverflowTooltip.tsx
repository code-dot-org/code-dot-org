import React, {useEffect, useMemo, useRef, useState} from 'react';

import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

interface OverflowTooltipProps {
  children: React.ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  className?: string;
}

// Component that wraps children with a tooltip is showTooltip is true,
// otherwise it just renders the children wrapped in a div.
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
  }, [containerRef]);

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
