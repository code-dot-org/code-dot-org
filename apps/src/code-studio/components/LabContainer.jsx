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
import moduleStyles from './LabContainer.module.scss';

const LabContainer = ({children}) => {
  const currentLevelId = useSelector(state => state.progress.currentLevelId);

  return (
    <div id="lab-container" className={moduleStyles.labContainer}>
      {children}
      <div
        id="fade-overlay"
        key={currentLevelId}
        className={moduleStyles.fadeInBlock}
      />
    </div>
  );
};

LabContainer.propTypes = {
  currentLevelId: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default LabContainer;
