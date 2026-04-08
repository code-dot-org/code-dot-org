import classNames from 'classnames';
import type {ReactNode} from 'react';
import {forwardRef} from 'react';
import PanelContainerHeader, {
  type PanelContainerHeaderProps,
} from './PanelContainerHeader';

import moduleStyles from './panelContainer.module.scss';

export interface PanelContainerProps
  extends Omit<PanelContainerHeaderProps, 'className'> {
  id: string;
  headerContent: ReactNode;
  hideHeaders?: boolean;
  className?: string;
  headerClassName?: string;
}

/**
 * A container for a top-level panel, typically with a header.  The content of the panel
 * is provided as children.  Whether the header is shown is determined by an
 * external state value.  The panel container always occupies the full size of
 * its parent; this means that the main scene is responsible for allocating
 * the layout of all the panels.
 */
const PanelContainer = forwardRef<HTMLDivElement, PanelContainerProps>(
  (
    {
      id,
      headerContent,
      rightHeaderContent,
      leftHeaderContent,
      children,
      hideHeaders,
      className,
      headerClassName,
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={classNames(
        'panelContainer',
        moduleStyles.panelContainer,
        className,
      )}
      id={id}
    >
      {!hideHeaders && (
        <PanelContainerHeader
          className={headerClassName}
          leftHeaderContent={leftHeaderContent}
          rightHeaderContent={rightHeaderContent}
        >
          {headerContent}
        </PanelContainerHeader>
      )}
      {children}
    </div>
  ),
);

export {PanelContainerHeader, type PanelContainerHeaderProps};

export default PanelContainer;
