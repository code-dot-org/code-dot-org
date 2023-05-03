// LabContainer
//
// This React component is used to contain a lab that doesn't need page reloads
// between levels.
//
// For now, it's only used for the "music" app, and facilitates instant switching
// between "music" levels in the same lesson.
//
// It plays a fade-in animation when levels are switched.

import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import moduleStyles from './LabContainer.module.scss';

const LabContainer = ({children}) => {
  const currentLevelId = useSelector(state => state.progress.currentLevelId);
  const isLabLoading = useSelector(state => state.lab.isLoading);

  const uniqueKey =
    currentLevelId + (isLabLoading ? '-loading' : '-notloading');
  const overlayStyle = isLabLoading
    ? moduleStyles.showingBlock
    : moduleStyles.fadeInBlock;

  return (
    <div id="lab-container" className={moduleStyles.labContainer}>
      {children}
      <div
        id="fade-overlay"
        key={uniqueKey}
        className={classNames(moduleStyles.solidBlock, overlayStyle)}
      />
    </div>
  );
};

LabContainer.propTypes = {
  currentLevelId: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default LabContainer;
