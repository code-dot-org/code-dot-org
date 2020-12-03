import React from 'react';
import PropTypes from 'prop-types';
import {levelType} from '@cdo/apps/templates/progress/progressTypes';
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

export default class ProgressTableLevelIcon extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelType)
  };

  render() {
    return (
      <span style={styles.container}>
        {this.props.levels.map(level => {
          return (
            <span key={`${level.id}_${level.levelNumber}`}>
              <span
                style={{
                  ...styles.icon,
                  width: progressStyles.BUBBLE_CONTAINER_WIDTH
                }}
              >
                <FontAwesome icon={getIconForLevel(level, true)} />
              </span>
              {level.sublevels && (
                <span
                  style={{
                    ...progressStyles.inlineBlock,
                    width:
                      level.sublevels.length *
                      progressStyles.LETTER_BUBBLE_CONTAINER_WIDTH
                  }}
                />
              )}
            </span>
          );
        })}
      </span>
    );
  }
}
