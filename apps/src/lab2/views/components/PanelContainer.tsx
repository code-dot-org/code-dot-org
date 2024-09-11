import classNames from 'classnames';
import React, {useContext} from 'react';

import {ThemeContext} from '../ThemeWrapper';

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
  style?: React.CSSProperties;
}

/**
 * A container for a top-level panel with a header.  The content of the panel
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
  style,
}) => {
  const {theme} = useContext(ThemeContext);

  return (
    <div
      className={classNames(
        'panelContainer',
        moduleStyles.panelContainer,
        className
      )}
      id={id}
      style={style}
    >
      {!hideHeaders && (
        <div
          className={classNames(
            'panelContainerHeader',
            moduleStyles['panelContainerHeader-' + theme],
            headerClassName
          )}
        >
          {leftHeaderContent && (
            <div
              className={classNames(
                'panelContainerHeaderItemLeft',
                moduleStyles.panelContainerHeaderItem,
                moduleStyles.panelContainerHeaderItemLeft
              )}
            >
              {leftHeaderContent}
            </div>
          )}
          <div
            className={classNames(
              'panelContainerHeaderItemText',
              moduleStyles.panelContainerHeaderItem,
              moduleStyles.panelContainerHeaderItemText
            )}
          >
            {headerContent}
          </div>
          {rightHeaderContent && (
            <div
              className={classNames(
                'panelContainerHeaderItemRight',
                moduleStyles.panelContainerHeaderItem,
                moduleStyles.panelContainerHeaderItemRight
              )}
            >
              {rightHeaderContent}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PanelContainer;
