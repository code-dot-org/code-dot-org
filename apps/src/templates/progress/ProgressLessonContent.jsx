import PropTypes from 'prop-types';
import React from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import ProgressBubbleSet from './ProgressBubbleSet';
import {levelWithProgressType} from './progressTypes';
import {progressionsFromLevels} from '@cdo/apps/code-studio/progressRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

export default class ProgressLessonContent extends React.Component {
  static propTypes = {
    description: PropTypes.string,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string
  };

  render() {
    const {description, levels, disabled, selectedSectionId} = this.props;
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
