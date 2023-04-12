// LabContainer
//
// This React component is used to contain a lab that doesn't need page reloads
// between levels.  It is hosted by the header React component, and encompasses
// everything below the header on the page.
//
// For now, it's only used for the "music" app, and facilitates instant switching
// between "music" levels in the same lesson.
//
// It plays a fade-in animation when levels are switched.

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  levelsForLessonId,
  setCurrentLevelId
} from '@cdo/apps/code-studio/progressRedux';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import {levelWithProgressType} from '@cdo/apps/templates/progress/progressTypes';
import moduleStyles from './LabContainer.module.scss';

class UnconnectedLabContainer extends Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    currentLevelId: PropTypes.string,
    onLevelChanged: PropTypes.func,
    setWindowTitle: PropTypes.func
  };

  getCurrentLevelIndex() {
    // Go through the active lesson's levels and find the index of the
    // current level.  This is equivalent to which bubble we are in.
    return this.props.levels.findIndex(level => level.isCurrentLevel);
  }

  // A handler when the lab tells us that the level has changed.
  onChangeLevelIndex(levelIndex) {
    const level = this.props.levels[levelIndex];

    // Update the redux store.
    this.props.onLevelChanged('' + level.id);

    // Update the browser.
    window.history.pushState({}, '', level.url + window.location.search);
    this.props.setWindowTitle();
  }

  render() {
    const currentLevelIndex = this.getCurrentLevelIndex(
      this.props.currentLevelId
    );

    // Some Music Lab-specific configuration.
    const appConfig = {
      'load-progression': 'true',
      'local-progression': 'true'
    };

    return (
      <div id="lab-container" className={moduleStyles.labContainer}>
        <MusicLabView
          appConfig={appConfig}
          currentLevel={currentLevelIndex}
          onChangeLevel={index => this.onChangeLevelIndex(index)}
        />

        <div
          id="fade-overlay"
          key={this.props.currentLevelId}
          className={moduleStyles.fadeInBlock}
        />
      </div>
    );
  }
}

const LabContainer = connect(
  state => ({
    levels: levelsForLessonId(state.progress, state.progress.currentLessonId),
    currentLevelId: state.progress.currentLevelId
  }),
  dispatch => ({
    onLevelChanged(levelId) {
      dispatch(setCurrentLevelId(levelId));
    }
  })
)(UnconnectedLabContainer);

export default LabContainer;
