import React, { PropTypes } from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import ProgressBubbleSet from './ProgressBubbleSet';
import { levelType } from './progressTypes';
import { progressionsFromLevels } from '@cdo/apps/code-studio/progressRedux';

const styles = {
  summary: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
  }
};

const ProgressLessonContent = React.createClass({
  propTypes: {
    description: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const { description, levels, disabled } = this.props;
    const progressions = progressionsFromLevels(levels);

    let bubbles;
    if (progressions.length === 1 && !progressions[0].name) {
      bubbles = (
        <ProgressBubbleSet
          levels={progressions[0].levels}
          disabled={disabled}
        />
      );
    } else {
      bubbles = (
        progressions.map((progression, index) => (
          <ProgressLevelSet
            key={index}
            name={progression.name}
            levels={progression.levels}
            disabled={disabled}
          />
        ))
      );
    }

    return (
      <div>
        <div style={styles.summary}>
          {description}
        </div>
        {bubbles}
      </div>
    );
  }
});

export default ProgressLessonContent;
