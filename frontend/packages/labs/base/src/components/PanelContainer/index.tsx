import classNames from 'classnames';
import type {PropsWithChildren, ReactNode} from 'react';
import {forwardRef} from 'react';
import PanelContainerHeader from './PanelContainerHeader';

import moduleStyles from './panelContainer.module.scss';

export interface PanelContainerProps extends PropsWithChildren {
  id: string;
  headerContent: ReactNode;
  rightHeaderContent?: ReactNode;
  leftHeaderContent?: ReactNode;
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
        <div
          className={classNames(
            'panelContainerHeader',
            moduleStyles.panelContainerHeader,
            headerClassName,
          )}
        >
          <div
            className={classNames(
              'panelContainerHeaderItemLeft',
              moduleStyles.panelContainerHeaderItem,
              moduleStyles.panelContainerHeaderItemLeft,
            )}
          >
            {leftHeaderContent}
          </div>
          <PanelContainerHeader>{headerContent}</PanelContainerHeader>
          <div
            className={classNames(
              'panelContainerHeaderItemRight',
              moduleStyles.panelContainerHeaderItem,
              moduleStyles.panelContainerHeaderItemRight,
            )}
          >
            {rightHeaderContent}
          </div>
        </div>
      )}
      {children}
    </div>
  ),
);

export {PanelContainerHeader};

export default PanelContainer;
