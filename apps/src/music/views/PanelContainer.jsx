import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import moduleStyles from './panelContainer.module.scss';

/**
 * A container for a top-level panel with a header.  The content of the panel
 * is provided as children.  Whether the header is shown is determined by an
 * external state value.  The panel container always occupies the full size of
 * its parent; this means that the main scene is responsible for allocating
 * the layout of all the panels.
 */
const PanelContainer = ({
  id,
  headerText,
  rightHeaderContent,
  leftHeaderContent,
  children,
}) => {
  const isHeadersShowing = useSelector(state => state.music.isHeadersShowing);

  return (
    <div
      className={classNames('panelContainer', moduleStyles.panelContainer)}
      id={id}
    >
      {isHeadersShowing && (
        <div
          className={classNames(
            'panelContainerHeader',
            moduleStyles.panelContainerHeader
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
            {headerText}
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

PanelContainer.propTypes = {
  id: PropTypes.string.isRequired,
  headerText: PropTypes.string.isRequired,
  children: PropTypes.object,
  rightHeaderContent: PropTypes.node,
  leftHeaderContent: PropTypes.node,
};

export default PanelContainer;
