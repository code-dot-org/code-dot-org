import React, { PropTypes } from 'react';
import ProgressLevelSet from './ProgressLevelSet';
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
    return (
      <div>
        <div style={styles.summary}>
          {description}
        </div>
        {progressions.map((progression, index) => (
          <ProgressLevelSet
            key={index}
            name={progression.name}
            levels={progression.levels}
            disabled={disabled}
          />
        ))}
      </div>
    );
  }
});

export default ProgressLessonContent;
