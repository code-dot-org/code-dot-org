import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import ReactTooltip from 'react-tooltip';
import ProgressBubbleSet from './ProgressBubbleSet';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

export const styles = {
  lightRow: {
    backgroundColor: color.table_light_row
  },
  darkRow: {
    backgroundColor: color.table_dark_row
  },
  hiddenRow: {
    borderStyle: 'dashed',
    borderColor: color.border_gray,
    opacity: 0.6,
    backgroundColor: color.table_light_row
  },
  col1: {
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    lineHeight: '52px',
    color: color.charcoal,
    letterSpacing: -0.11,
    whiteSpace: 'nowrap',
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
  },
  col2: {
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20
  },
  colText: {
    color: color.charcoal,
    // so that our current stage indicator is flush with the td border
    margin: -1,
    paddingLeft: 20,
    paddingRight: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  icon: {
    marginRight: 5,
    fontSize: 12,
    color: color.cyan
  },
  locked: {
    borderStyle: 'dashed',
    borderWidth: 2,
    opacity: 0.6
  },
  unlockedIcon: {
    color: color.orange
  },
  currentStageIndicator: {
    color: color.cyan,
    borderLeftColor: color.cyan,
    borderLeftStyle: 'solid',
    borderLeftWidth: 4,
    // colText padding minus borderLeftWidth
    paddingLeft: 16
  }
};

const SummaryProgressRow = React.createClass({
  propTypes: {
    dark: PropTypes.bool.isRequired,
    isCurrentStage: PropTypes.bool.isRequired,
    lesson: lessonType.isRequired,
    lessonNumber: PropTypes.number,
    levels: PropTypes.arrayOf(levelType).isRequired,
    lockedForSection: PropTypes.bool.isRequired,
    lessonIsVisible: PropTypes.func.isRequired
  },

  render() {
    const {
      dark,
      lesson,
      lessonNumber,
      levels,
      lockedForSection,
      lessonIsVisible,
      isCurrentStage
    } = this.props;

    // Is this lesson hidden for whomever we're currently viewing as
    if (!lessonIsVisible(lesson)) {
      return null;
    }

    // Would this stage be hidden if we were a student?
    const hiddenForStudents = !lessonIsVisible(lesson, ViewType.Student);
    let lessonTitle = lesson.name;
    if (lessonNumber) {
      lessonTitle = lessonNumber + ". " + lessonTitle;
    }

    const locked = lockedForSection ||
      levels.every(level => level.status === LevelStatus.locked);

    return (
      <tr
        style={{
          ...(!dark && styles.lightRow),
          ...(dark && styles.darkRow),
          ...(hiddenForStudents && styles.hiddenRow),
          ...(locked && styles.locked)
        }}
      >
        <td
          style={{
            ...styles.col1
          }}
        >
          <div
            style={{
              ...styles.colText,
              ...(isCurrentStage && styles.currentStageIndicator),
            }}
          >
            {hiddenForStudents &&
              <FontAwesome
                icon="eye-slash"
                style={styles.icon}
              />
            }
            {lesson.lockable &&
              <FontAwesome
                icon={locked ? 'lock' : 'unlock'}
                style={{
                  ...styles.icon,
                  ...(!locked && styles.unlockedIcon)
                }}
              />
            }
            <span data-tip data-for={lessonTitle} aria-describedby={lessonTitle}>
              {lessonTitle}
              <ReactTooltip
                id={lessonTitle}
                role="tooltip"
                wrapper="span"
                effect="solid"
              >
                {lesson.name}
              </ReactTooltip>
            </span>
          </div>
        </td>
        <td style={styles.col2}>
          <ProgressBubbleSet
            start={1}
            levels={levels}
            disabled={locked}
          />
        </td>
      </tr>
    );
  }
});

export default SummaryProgressRow;
