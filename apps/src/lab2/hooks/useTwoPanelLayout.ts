import {useRef} from 'react';
import {useResizable} from 'react-resizable-layout';

import {logOnResize} from '@cdo/apps/lab2/utils/resizeUtils';

interface UseTwoPanelLayoutProps {
  sidebarMinWidth: number;
  sidebarInitialWidth?: number;
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
  isSidebarExpanded,
  appName,
}: UseTwoPanelLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    position: sidebarWidth,
    separatorProps: sidebarSeparatorProps,
    isDragging: isSidebarResizing,
  } = useResizable({
    axis: 'x',
    containerRef,
    initial: sidebarInitialWidth,
    min: sidebarMinWidth,
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
