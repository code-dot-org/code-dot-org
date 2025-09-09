import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './panelContainer.module.scss';

interface PanelContainerProps {
  id: string;
  headerContent: React.ReactNode;
  children?: React.ReactNode;
  rightHeaderContent?: React.ReactNode;
  leftHeaderContent?: React.ReactNode;
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
const PanelContainer: React.FunctionComponent<PanelContainerProps> = ({
  id,
  headerContent,
  rightHeaderContent,
  leftHeaderContent,
  children,
  hideHeaders,
  className,
  headerClassName,
}) => {
  return (
    <div
      className={classNames(
        'panelContainer',
        moduleStyles.panelContainer,
        className
      )}
      id={id}
    >
      {!hideHeaders && (
        <div
          className={classNames(
            'panelContainerHeader',
            moduleStyles.panelContainerHeader,
            headerClassName
          )}
        >
          <div
            className={classNames(
              'panelContainerHeaderItemLeft',
              moduleStyles.panelContainerHeaderItem,
              moduleStyles.panelContainerHeaderItemLeft
            )}
          >
            {leftHeaderContent}
          </div>

          <Heading2
            className={classNames(
              'panelContainerHeaderItemText',
              moduleStyles.panelContainerHeaderItem,
              moduleStyles.panelContainerHeaderItemCenter
            )}
            visualAppearance={'body-three'}
          >
            <span
              className={classNames(moduleStyles.panelContainerHeaderItemText)}
            >
              {headerContent}
            </span>
          </Heading2>
          <div
            className={classNames(
              'panelContainerHeaderItemRight',
              moduleStyles.panelContainerHeaderItem,
              moduleStyles.panelContainerHeaderItemRight
            )}
          >
            {rightHeaderContent}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PanelContainer;
