import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ProgressLevelSet from './ProgressLevelSet';
import ProgressBubbleSet from './ProgressBubbleSet';
import {levelType, studentLevelProgressType} from './progressTypes';
import {progressionsFromLevels} from '@cdo/apps/templates/progress/progressHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

const styles = {
  summary: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  noLevelsWarning: {
    fontSize: 13
  }
};

class ProgressLessonContent extends React.Component {
  static propTypes = {
    description: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.number,

    // redux provided
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired
  };

  render() {
    const {
      description,
      levels,
      disabled,
      selectedSectionId,
      studentProgress
    } = this.props;
    const progressions = progressionsFromLevels(levels);

    let bubbles;
    if (progressions.length === 0) {
      bubbles = (
        <span style={styles.noLevelsWarning}>
          {i18n.lessonContainsNoLevels()}
        </span>
      );
    } else if (progressions.length === 1 && !progressions[0].name) {
      bubbles = (
        <ProgressBubbleSet
          levels={progressions[0].levels}
          studentProgress={studentProgress}
          disabled={disabled}
          selectedSectionId={selectedSectionId}
        />
      );
    } else {
      bubbles = progressions.map((progression, index) => (
        <ProgressLevelSet
          key={index}
          name={progression.displayName}
          levels={progression.levels}
          studentProgress={studentProgress}
          disabled={disabled}
          selectedSectionId={selectedSectionId}
        />
      ));
    }

    return (
      <div>
        <div style={styles.summary}>
          <SafeMarkdown markdown={description || ''} />
        </div>
        {bubbles}
      </div>
    );
  }
}

export const UnconnectedProgressLessonContent = ProgressLessonContent;
export default connect(state => ({
  studentProgress: state.progress.progressByLevel
}))(ProgressLessonContent);
