import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {groupedLessons} from '@cdo/apps/code-studio/progressReduxSelectors';
import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import color from '@cdo/apps/util/color';

import {lessonIsVisible} from './progressHelpers';
import {groupedLessonsType} from './progressTypes';
import DetailProgressTable from './DetailProgressTable';
import LessonGroupInfo from './LessonGroupInfo';
import LessonGroupInfoDialog from './LessonGroupInfoDialog';
import SummaryProgressTable from './SummaryProgressTable';

export const styles = {
  hidden: {
    display: 'none',
  },
};

const lessonGroupStyles = {
  main: {
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: color.dark_charcoal,
    fontSize: 18,
    ...fontConstants['main-font-semi-bold'],
    color: 'white',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    cursor: 'pointer',
  },
  headerBlue: {
    backgroundColor: color.cyan,
  },
  headingText: {
    marginLeft: 10,
  },
  headingTextRTL: {
    marginRight: 10,
  },
  contents: {
    backgroundColor: color.lighter_gray,
    padding: 20,
  },
  contentsBlue: {
    backgroundColor: color.lightest_cyan,
  },
  bottom: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  lessonGroupInfo: {
    padding: 10,
  },
};

class LessonGroupSection extends React.Component {
  static propTypes = {
    groupedLesson: groupedLessonsType.isRequired,
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,

    // redux provided
    scriptId: PropTypes.number,
    hasVisibleLesson: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool,
  };

  state = {
    collapsed: false,
    lessonGroupInfoDialogOpen: false,
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed,
    });

  openLessonGroupInfoDialog = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      lessonGroupInfoDialogOpen: true,
    });
  };

  closeLessonGroupInfoDialog = () => {
    this.setState({lessonGroupInfoDialogOpen: false});
  };

  render() {
    const {isSummaryView, isPlc, viewAs, isRtl, hasVisibleLesson} = this.props;

    const {description, bigQuestions, displayName} =
      this.props.groupedLesson.lessonGroup;

    const headingTextStyle = isRtl
      ? lessonGroupStyles.headingTextRTL
      : lessonGroupStyles.headingText;

    const TableType = isSummaryView ? SummaryProgressTable : DetailProgressTable;

    if (!hasVisibleLesson && viewAs === ViewType.Participant) {
      return null;
    }

    const hasLessonGroupInfo = description || bigQuestions;

    const headerStyle = {
      ...lessonGroupStyles.header,
      ...(isPlc ? lessonGroupStyles.headerBlue : {}),
      ...(this.state.collapsed ? lessonGroupStyles.bottom : {}),
    };

    const contentsStyle = {
      ...lessonGroupStyles.contents,
      ...(isPlc ? lessonGroupStyles.contentsBlue : {}),
      ...lessonGroupStyles.bottom,
    };

    return (
      <div style={lessonGroupStyles.main} className="lesson-group">
        <div style={headerStyle} onClick={this.toggleCollapsed}>
          <FontAwesome
            icon={this.state.collapsed ? 'caret-right' : 'caret-down'}
          />
          <span style={headingTextStyle}>{displayName}</span>
          {hasLessonGroupInfo && (
            <span>
              <FontAwesome
                icon="info-circle"
                style={lessonGroupStyles.lessonGroupInfo}
                onClick={this.openLessonGroupInfoDialog}
              />
              <div className="print-only">
                <LessonGroupInfo
                  description={description}
                  bigQuestions={bigQuestions}
                />
              </div>
              <LessonGroupInfoDialog
                isOpen={this.state.lessonGroupInfoDialogOpen}
                displayName={displayName}
                bigQuestions={bigQuestions}
                description={description}
                closeDialog={this.closeLessonGroupInfoDialog}
              />
            </span>
          )}
        </div>
        {!this.state.collapsed && (
          <div style={contentsStyle}>
            <TableType groupedLesson={this.props.groupedLesson} />
          </div>
        )}
      </div>
    );
  }
}

const ConnectedLessonGroupSection = connect((state, ownProps) => ({
  scriptId: state.progress.scriptId,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
  hasVisibleLesson: ownProps.groupedLesson.lessons.some(lesson =>
    lessonIsVisible(lesson, state, state.viewAs)
  ),
}))(LessonGroupSection);

class ProgressTable extends React.Component {
  static propTypes = {
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    groupedLessons: PropTypes.arrayOf(groupedLessonsType).isRequired,
    minimal: PropTypes.bool,
  };

  componentDidMount() {
    // TODO - This modifies things outside of our scope. This is done right now
    // because we only want to modify this (dashboard-owned) markup in the case
    // where an experiment is enabled (leading to this component being rendered).
    // Now that we're not behind an experiment for progressRedesign, we should make
    // these changes elsewhere.
    const padding = 80;
    $('.container.main').css({
      width: 'initial',
      maxWidth: 940 + 2 * padding,
      paddingLeft: padding,
      paddingRight: padding,
    });
  }

  render() {
    const {isSummaryView, isPlc, groupedLessons, minimal} = this.props;

    if (
      groupedLessons.length === 1 &&
      !groupedLessons[0].lessonGroup.userFacing
    ) {
      // Render both tables, and toggle hidden state via CSS as this has better
      // perf implications than rendering just one at a time when toggling.
      return (
        <div>
          <div style={isSummaryView ? {} : styles.hidden}>
            <SummaryProgressTable
              groupedLesson={groupedLessons[0]}
              minimal={minimal}
            />
          </div>
          <div style={isSummaryView ? styles.hidden : {}}>
            <DetailProgressTable groupedLesson={groupedLessons[0]} />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {groupedLessons.map(group => (
            <ConnectedLessonGroupSection
              key={group.lessonGroup.displayName}
              isPlc={isPlc}
              groupedLesson={group}
              isSummaryView={isSummaryView}
            />
          ))}
        </div>
      );
    }
  }
}

export const UnconnectedProgressTable = ProgressTable;
export default connect(state => ({
  isPlc: state.progress.deeperLearningCourse,
  isSummaryView: state.progress.isSummaryView,
  groupedLessons: groupedLessons(state.progress),
}))(ProgressTable);
