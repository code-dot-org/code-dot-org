import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import ReactTooltip from 'react-tooltip';
import ProgressBubbleSet from './ProgressBubbleSet';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import FocusAreaIndicator from './FocusAreaIndicator';

export const styles = {
  lightRow: {
    backgroundColor: color.table_light_row
  },
  darkRow: {
    backgroundColor: color.table_dark_row
  },
  hiddenRow: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: color.border_gray,
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
    paddingLeft: 20,
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
  },
  col2: {
    position: 'relative',
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20
  },
  // When we set our opacity on the row element instead of on individual tds,
  // there are weird interactions with our tooltips in Chrome, and borders end
  // up disappearing.
  fadedCol: {
    opacity: 0.6,
  },
  colText: {
    color: color.charcoal,
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
  },
  unlockedIcon: {
    color: color.orange
  },
  focusAreaMargin: {
    // Our focus area indicator is absolutely positioned. Add a margin when it's
    // there so that it wont overlap dots.
    marginRight: 130
  }
};

const SummaryProgressRow = React.createClass({
  propTypes: {
    dark: PropTypes.bool.isRequired,
    lesson: lessonType.isRequired,
    lessonNumber: PropTypes.number,
    levels: PropTypes.arrayOf(levelType).isRequired,
    lockedForSection: PropTypes.bool.isRequired,
    lessonIsVisible: PropTypes.func.isRequired
  },

  render() {
    const { dark, lesson, lessonNumber, levels, lockedForSection, lessonIsVisible } = this.props;

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
          ...(locked && styles.locked),

        }}
      >
        <td
          style={{
          ...styles.col1,
          ...((hiddenForStudents || locked)  && styles.fadedCol),
          }}
        >
          <div style={styles.colText}>
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
        <td
          style={{
          ...styles.col2,
          ...((hiddenForStudents || locked)  && styles.fadedCol),
          }}
        >
          <ProgressBubbleSet
            start={1}
            levels={levels}
            disabled={locked}
            style={lesson.isFocusArea ? styles.focusAreaMargin : undefined}
          />
          {lesson.isFocusArea && <FocusAreaIndicator/>}
        </td>
      </tr>
    );
  }
});

export default SummaryProgressRow;
