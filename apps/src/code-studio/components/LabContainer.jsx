import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  levelsForLessonId,
  lessonExtrasUrl,
  setCurrentLevelId
} from '@cdo/apps/code-studio/progressRedux';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import {levelWithProgressType} from '@cdo/apps/templates/progress/progressTypes';
import moduleStyles from './LabContainer.module.scss';

class UnconnectedLabContainer extends Component {
  static propTypes = {
    labType: PropTypes.string,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    lessonName: PropTypes.string,
    lessonExtrasUrl: PropTypes.string,
    isLessonExtras: PropTypes.bool,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    currentPageNumber: PropTypes.number,
    currentLevelId: PropTypes.string,
    onLevelChanged: PropTypes.func
  };

  getCurrentLevelIndex() {
    // Go through the active lesson's levels and find the index of the
    // current level.  This is equivalent to which bubble we are in.
    return this.props.levels.findIndex(level => level.isCurrentLevel);
  }

  onSaveProgress() {}

  changeLevelIndex(levelIndex) {
    const level = this.props.levels[levelIndex];
    window.history.pushState({}, 'title', level.url + window.location.search);
    this.props.onLevelChanged('' + level.id);
  }

  render() {
    const currentLevelIndex = this.getCurrentLevelIndex(
      this.props.currentLevelId
    );

    const appConfig = {
      'load-progression': 'true',
      'local-progression': 'true'
    };

    return (
      <div id="lab-container" className={moduleStyles.labContainer}>
        <MusicLabView
          appConfig={appConfig}
          currentLevel={currentLevelIndex}
          onChangeLevel={index => this.changeLevelIndex(index)}
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
    lessonExtrasUrl: lessonExtrasUrl(
      state.progress,
      state.progress.currentLessonId
    ),
    isLessonExtras: state.progress.isLessonExtras,
    currentPageNumber: state.progress.currentPageNumber,
    currentLevelId: state.progress.currentLevelId
  }),
  dispatch => ({
    onLevelChanged(levelId) {
      dispatch(setCurrentLevelId(levelId));
    }
  })
)(UnconnectedLabContainer);

export default LabContainer;
