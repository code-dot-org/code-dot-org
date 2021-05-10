import React from 'react';
import PropTypes from 'prop-types';
import {levelType} from '@cdo/apps/templates/progress/progressTypes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import ProgressTableLevelSpacer from './ProgressTableLevelSpacer';

const styles = {
  icon: {
    color: color.charcoal,
    fontSize: 20
  },
  unpluggedPlaceholderContainer: {
    height: 0,
    opacity: 0
  }
};

/**
 * The width of our unplugged bubble depends on the localization of the text,
 * so to allow that to be determined at render time, we don't set an explicit
 * width for unplugged bubbles and instead render an invisible one behind the
 * icon to determine its width.
 */
const placeholderUnpluggedBubble = (
  <div style={styles.unpluggedPlaceholderContainer}>
    <div>
      <ProgressTableLevelBubble
        levelStatus={LevelStatus.not_tried}
        isUnplugged={true}
        isDisabled={true}
        url=""
      />
    </div>
  </div>
);

/**
 * A simple wrapper around the FontAwesome icon for a level, which handles the
 * requiring the icon for an unplugged level to have an intrinsic content width
 * based on the length of a localized string.
 */
function LevelIcon({icon, isUnplugged}) {
  if (!isUnplugged) {
    return <FontAwesome icon={icon} />;
  }
  return (
    <span>
      {isUnplugged && placeholderUnpluggedBubble}
      <FontAwesome icon={icon} />
    </span>
  );
}
LevelIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  isUnplugged: PropTypes.bool
};

/**
 * A component for rendering the icons for a set of levels.
 * Uses `ProgressTableLevelSpacer` to ensure alignment with the bubbles in a
 * `ProgressTableDetailCell` for the same levels.
 */
export default function ProgressTableLevelIconSet({levels}) {
  const items = levels.map(level => {
    const icon = (
      <LevelIcon
        icon={getIconForLevel(level, true)}
        isUnplugged={level.isUnplugged}
      />
    );
    return {
      node: icon,
      nodeStyle: styles.icon,
      sublevelCount: level.sublevels?.length
    };
  });
  return <ProgressTableLevelSpacer items={items} />;
}
ProgressTableLevelIconSet.propTypes = {
  levels: PropTypes.arrayOf(levelType)
};
