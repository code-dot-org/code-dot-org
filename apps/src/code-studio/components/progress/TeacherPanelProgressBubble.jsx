import React from 'react';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  DOT_SIZE,
  DIAMOND_DOT_SIZE,
  levelProgressStyle
} from '@cdo/apps/templates/progress/progressStyles';
import {
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';

/**
 * A TeacherPanelProgressBubble represents progress for a specific level in the TeacherPanel. It can be a circle
 * or a diamond. The fill and outline change depending on the level status.
 */

const styles = {
  main: {
    boxSizing: 'content-box',
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 16,
    letterSpacing: -0.11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition:
      'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
    marginTop: 3,
    marginBottom: 3
  },
  diamond: {
    width: DIAMOND_DOT_SIZE,
    height: DIAMOND_DOT_SIZE,
    borderRadius: 4,
    transform: 'rotate(45deg)',
    marginTop: 6,
    marginBottom: 6
  },
  contents: {
    whiteSpace: 'nowrap',
    lineHeight: '16px'
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  }
};

export class TeacherPanelProgressBubble extends React.Component {
  static propTypes = {
    level: levelType.isRequired,
    levelProgress: studentLevelProgressType.isRequired
  };

  render() {
    const {level, levelProgress} = this.props;

    const number = level.levelNumber;

    const hideNumber = levelProgress.paired || level.bonus;

    const style = {
      ...styles.main,
      ...(level.isConceptLevel && styles.diamond),
      ...levelProgressStyle(levelProgress.status, false)
    };

    // Outer div here is used to make sure our bubbles all take up equivalent
    // amounts of space, whether they're diamonds or circles
    return (
      <div
        style={{
          // Two pixels on each side for border, 2 pixels on each side for margin.
          minWidth: DOT_SIZE + 8,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div style={style}>
          <div
            style={{
              fontSize: levelProgress.paired || level.bonus ? 14 : 16,
              ...styles.contents,
              ...(level.isConceptLevel && styles.diamondContents)
            }}
          >
            {levelProgress.paired && <FontAwesome icon="users" />}
            {level.bonus && <FontAwesome icon="flag-checkered" />}
            {!hideNumber && <span>{number}</span>}
          </div>
        </div>
      </div>
    );
  }
}
