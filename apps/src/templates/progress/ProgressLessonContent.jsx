import React, { PropTypes } from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import { levelType } from './progressTypes';

const styles = {
  summary: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
  }
};
// TODO - where should this live?
// TODO - better name than groups?
// TODO - unit test
const groupLevels = levels => {
  const groups = [];
  let currentGroup = {
    start: 1,
    name: levels[0].name,
    levels: [levels[0]]
  };
  levels.slice(1).forEach((level, index) => {
    if (level.name === currentGroup.name) {
      currentGroup.levels.push(level);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        // + 1 for 0-indexing, + 1 because we sliced off the first element
        start: index + 2,
        name: level.name,
        levels: [level]
      };
    }
  });
  groups.push(currentGroup);
  return groups;
};

const ProgressLessonContent = React.createClass({
  propTypes: {
    description: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired
  },

  render() {
    const { description, levels } = this.props;
    const groups = groupLevels(levels);
    return (
      <div>
        <div style={styles.summary}>
          {description}
        </div>
        {groups.map((group, index) => (
          <ProgressLevelSet
            key={index}
            start={group.start}
            name={group.name}
            levels={group.levels}
          />
        ))}
      </div>
    );
  }
});

export default ProgressLessonContent;
