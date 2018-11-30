import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import ReactTooltip from 'react-tooltip';
import ProgressBubbleSet from './ProgressBubbleSet';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import FocusAreaIndicator from './FocusAreaIndicator';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {stageLocked} from "./progressHelpers";

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
  },
  opaque: {
    opacity: 1
  }
};

export default class SummaryProgressRow extends React.Component {
  static propTypes = {
    dark: PropTypes.bool.isRequired,
    lesson: lessonType.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    lockedForSection: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    lessonIsVisible: PropTypes.func.isRequired
  };

  render() {
    const { dark, lesson, levels, lockedForSection, lessonIsVisible, viewAs } = this.props;

    // Is this lesson hidden for whomever we're currently viewing as
    if (!lessonIsVisible(lesson, viewAs)) {
      return null;
    }

    // Would this stage be hidden if we were a student?
    const hiddenForStudents = !lessonIsVisible(lesson, ViewType.Student);
    let lessonTitle = lesson.name;
    if (lesson.stageNumber) {
      lessonTitle = lesson.stageNumber + ". " + lessonTitle;
    }

    const locked = lockedForSection ||
      levels.every(level => level.status === LevelStatus.locked) ||
      (lesson.lockable && stageLocked(levels));

    const titleTooltipId = _.uniqueId();
    const lockedTooltipId = _.uniqueId();
    return (
      <tr
        style={{
          ...(!dark && styles.lightRow),
          ...(dark && styles.darkRow),
          ...(hiddenForStudents && styles.hiddenRow),
          ...(locked && styles.locked),
          ...(viewAs === ViewType.Teacher && styles.opaque)
        }}
      >
        <td
          style={{
          ...styles.col1,
          ...((hiddenForStudents || locked) && viewAs === ViewType.Student && styles.fadedCol),
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
              <span data-tip data-for={lockedTooltipId}>
                <FontAwesome
                  icon={locked ? 'lock' : 'unlock'}
                  style={{
                    ...styles.icon,
                    ...(!locked && styles.unlockedIcon)
                  }}
                />
                {!locked && viewAs === ViewType.Teacher &&
                  <ReactTooltip
                    id={lockedTooltipId}
                    role="tooltip"
                    wrapper="span"
                    effect="solid"
                  >
                    {i18n.lockAssessmentLong()}
                  </ReactTooltip>
                }
              </span>
            }
            <span data-tip data-for={titleTooltipId} aria-describedby={titleTooltipId}>
              {lessonTitle}
              <ReactTooltip
                id={titleTooltipId}
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
          ...((hiddenForStudents || locked) && viewAs === ViewType.Student && styles.fadedCol),
          }}
        >
          <ProgressBubbleSet
            levels={levels}
            disabled={locked && viewAs !== ViewType.Teacher}
            style={lesson.isFocusArea ? styles.focusAreaMargin : undefined}
          />
          {lesson.isFocusArea && <FocusAreaIndicator/>}
        </td>
      </tr>
    );
  }
}
