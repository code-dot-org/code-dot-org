import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  DOT_SIZE,
  DIAMOND_DOT_SIZE,
  levelProgressStyle
} from '@cdo/apps/templates/progress/progressStyles';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {
  BubbleBadgeWrapper,
  KeepWorkingBadge
} from '@cdo/apps/templates/progress/BubbleBadge';
import {ReviewStates} from '@cdo/apps/templates/instructions/teacherFeedback/types';

/**
 * A TeacherPanelProgressBubble represents progress for a specific level in the TeacherPanel. It can be a circle
 * or a diamond. The fill and outline change depending on the level status.
 */
export class TeacherPanelProgressBubble extends React.Component {
  static propTypes = {
    // While this userLevel object does have the properties of a levelType object, can
    // either be more like a userLevel object or a level object depenting on whether the
    // user has made progress. For example, if the user has progress recorded, the id
    // property of this object is the user_level id. In this case, to get the level id,
    // use the level_id property.
    userLevel: PropTypes.object.isRequired
  };

  render() {
    const {userLevel} = this.props;

    if (userLevel.assessment && userLevel.passed) {
      userLevel.status = LevelStatus.completed_assessment;
    }

    const hideNumber = userLevel.paired || userLevel.bonus;

    const style = {
      ...styles.main,
      ...(userLevel.isConceptLevel && styles.diamond),
      ...levelProgressStyle(userLevel.status, userLevel.kind)
    };

    const shouldKeepWorking =
      userLevel.teacherFeedbackReivewState === ReviewStates.keepWorking;

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
              fontSize: userLevel.paired || userLevel.bonus ? 14 : 16,
              ...styles.contents,
              ...(userLevel.isConceptLevel && styles.diamondContents)
            }}
          >
            {userLevel.paired && <FontAwesome icon="users" />}
            {userLevel.bonus && <FontAwesome icon="flag-checkered" />}
            {!hideNumber && <span>{userLevel.levelNumber}</span>}
          </div>
          {shouldKeepWorking && (
            <BubbleBadgeWrapper isDiamond={userLevel.isConceptLevel}>
              <KeepWorkingBadge />
            </BubbleBadgeWrapper>
          )}
        </div>
      </div>
    );
  }
}

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
    marginBottom: 3,
    position: 'relative'
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
