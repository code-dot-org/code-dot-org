import React from 'react';
import PropTypes from 'prop-types';
import {levelTypeWithoutStatus} from '@cdo/apps/templates/progress/progressTypes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

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
  },
  unpluggedPlaceholderContainer: {
    height: 0,
    opacity: 0
  }
};

const placeholderUnpluggedBubble = (
  <div style={styles.unpluggedPlaceholderContainer}>
    <div>
      <ProgressTableLevelBubble
        levelStatus={LevelStatus.not_tried}
        unplugged={true}
        disabled={true}
        url=""
      />
    </div>
  </div>
);

function LevelIcon({icon, unplugged}) {
  // The width of our unplugged bubble depends on the localization of the text,
  // so to allow that to be determined at render time, we don't set an explicit
  // width for unplugged bubbles and instead render an invisible one behind the
  // icon to determine its width.
  const width = unplugged ? undefined : progressStyles.BUBBLE_CONTAINER_WIDTH;
  return (
    <span
      style={{
        ...styles.icon,
        width: width
      }}
    >
      {unplugged && placeholderUnpluggedBubble}
      <FontAwesome icon={icon} />
    </span>
  );
}
LevelIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  unplugged: PropTypes.bool
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
            <LevelIcon
              icon={getIconForLevel(level, true)}
              unplugged={level.isUnplugged}
            />
            {level.sublevels &&
              this.renderSublevelSpace(level.sublevels.length)}
          </span>
        ))}
      </span>
    );
  }
}
