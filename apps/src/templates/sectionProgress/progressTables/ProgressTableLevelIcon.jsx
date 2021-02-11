import React from 'react';
import PropTypes from 'prop-types';
import {levelTypeWithoutStatus} from '@cdo/apps/templates/progress/progressTypes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';

const styles = {
  container: {
    ...progressStyles.flex,
    ...progressStyles.cellContent
  },
  icon: {
    ...progressStyles.inlineBlock,
    textAlign: 'center',
    color: color.charcoal,
    fontSize: 20
  }
};

function LevelIcon({icon}) {
  return (
    <span
      style={{
        ...styles.icon,
        width: progressStyles.BUBBLE_CONTAINER_WIDTH
      }}
    >
      <FontAwesome icon={icon} />
    </span>
  );
}
LevelIcon.propTypes = {
  icon: PropTypes.string.isRequired
};

export default class ProgressTableLevelIcon extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelTypeWithoutStatus)
  };

  // extra space is rendered in the columns with sublevels
  // so that the header will align properly with the student progress
  renderSublevelSpace(sublevelCount) {
    return (
      <span
        style={{
          width: sublevelCount * progressStyles.LETTER_BUBBLE_CONTAINER_WIDTH
        }}
      />
    );
  }

  render() {
    return (
      <span style={styles.container}>
        {this.props.levels.map(level => (
          <span
            key={`${level.id}_${level.levelNumber}`}
            style={progressStyles.flexBetween}
          >
            <LevelIcon icon={getIconForLevel(level, true)} />
            {level.sublevels &&
              this.renderSublevelSpace(level.sublevels.length)}
          </span>
        ))}
      </span>
    );
  }
}
