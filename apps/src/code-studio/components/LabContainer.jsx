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
    const levelId = this.props.levels[levelIndex].id;
    this.props.onLevelChanged('' + levelId);
  }

  render() {
    //const idChanged = this.lastId !== this.props.currentLevelId;
    //this.lastId = this.props.currentLevelId;

    //console.log('rendering container again', idChanged);

    const currentLevelIndex = this.getCurrentLevelIndex(
      this.props.currentLevelId
    );

    return (
      <div id="lab-container" style={{width: '100%', height: '100%'}}>
        <MusicLabView
          currentLevel={currentLevelIndex}
          onChangeLevel={index => this.changeLevelIndex(index)}
        />

        <div
          key={this.props.currentLevelId}
          className={moduleStyles.fadeinblock}
          style={{
            backgroundColor: 'black',
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            opacity: 0
          }}
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
