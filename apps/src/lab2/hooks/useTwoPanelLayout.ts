import {useEffect, useRef, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';

interface UseTwoPanelLayoutProps {
  sidebarMinWidth: number;
  sidebarInitialWidth?: number;
  // Floor left for the content panel, in px - the sidebar's drag max is
  // derived from this and the container's current width, so dragging can't
  // squeeze the content panel below it even though its own CSS min-width is 0.
  contentMinWidth: number;
  isSidebarExpanded: boolean;
  appName: string;
}

/**
 * Layout mechanics for a resizable sidebar next to a content panel: drag to
 * resize the sidebar, disabled (and left at its collapsed width) when
 * isSidebarExpanded is false.
 */
export const useTwoPanelLayout = ({
  sidebarMinWidth,
  sidebarInitialWidth = sidebarMinWidth,
  contentMinWidth,
  isSidebarExpanded,
  appName,
}: UseTwoPanelLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarMaxWidth, setSidebarMaxWidth] = useState(Infinity);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const updateMaxWidth = () =>
      setSidebarMaxWidth(
        Math.max(sidebarMinWidth, container.clientWidth - contentMinWidth)
      );
    updateMaxWidth();
    const observer = new ResizeObserver(updateMaxWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [contentMinWidth, sidebarMinWidth]);

  const {
    position: sidebarWidth,
    separatorProps: sidebarSeparatorProps,
    isDragging: isSidebarResizing,
  } = useResizable({
    axis: 'x',
    containerRef,
    initial: sidebarInitialWidth,
    min: sidebarMinWidth,
    max: sidebarMaxWidth,
    disabled: !isSidebarExpanded,
    onResizeStart: () =>
      logOnResize(appName, {layout: 'two-pane', resizeBar: 'sidebar'}),
  });

  return {
    containerRef,
    sidebarWidth,
    sidebarSeparatorProps,
    isSidebarResizing,
  };
};
