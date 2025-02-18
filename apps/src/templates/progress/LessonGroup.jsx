import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import firehoseClient from '@cdo/apps/metrics/firehose';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';
import LessonGroupInfoDialog from '@cdo/apps/templates/progress/LessonGroupInfoDialog';
import {groupedLessonsType} from '@cdo/apps/templates/progress/progressTypes';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';
import color from '@cdo/apps/util/color';

import {lessonIsVisible} from './progressHelpers';

/**
 * A component that shows a group of lessons. That group has a name and is
 * collapsible. It can show the lessons in either a detail or a summary view.
 */
class LessonGroup extends React.Component {
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
    /*
        Because the info button is on the header which collapses when clicked we have to
        reverse the collapsing when you click the info button
        */
    this.setState({
      collapsed: !this.state.collapsed,
      lessonGroupInfoDialogOpen: true,
    });
    firehoseClient.putRecord(
      {
        study: 'unit_overview_page',
        study_group: 'lesson_group',
        event: 'view_lesson_group_info',
        data_json: JSON.stringify({
          script_id: this.props.scriptId,
          lesson_group_id: this.props.groupedLesson.lessonGroup.id,
        }),
      },
      {includeUserId: true}
    );
  };

  closeLessonGroupInfoDialog = () => {
    this.setState({lessonGroupInfoDialogOpen: false});
  };

  render() {
    const {isSummaryView, isPlc, viewAs, isRtl, hasVisibleLesson} = this.props;

    const {description, bigQuestions, displayName} =
      this.props.groupedLesson.lessonGroup;

    // Adjust styles if locale is RTL
    const headingTextStyle = isRtl ? styles.headingTextRTL : styles.headingText;

    const TableType = isSummaryView
      ? SummaryProgressTable
      : DetailProgressTable;

    if (!hasVisibleLesson && viewAs === ViewType.Participant) {
      return null;
    }

    const hasLessonGroupInfo = description || bigQuestions;

    return (
      <div style={styles.main} className="lesson-group">
        <div
          style={[
            styles.header,
            isPlc && styles.headerBlue,
            this.state.collapsed && styles.bottom,
          ]}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome
            icon={this.state.collapsed ? 'caret-right' : 'caret-down'}
          />
          <span style={headingTextStyle}>{displayName}</span>
          {hasLessonGroupInfo && (
            <span>
              <FontAwesome
                icon="info-circle"
                style={styles.lessonGroupInfo}
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
          <div
            style={[
              styles.contents,
              isPlc && styles.contentsBlue,
              styles.bottom,
            ]}
          >
            <TableType groupedLesson={this.props.groupedLesson} />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: color.purple,
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
    backgroundColor: color.lighter_purple,
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

export const UnconnectedLessonGroup = LessonGroup;

export default connect((state, ownProps) => ({
  scriptId: state.progress.scriptId,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
  hasVisibleLesson: ownProps.groupedLesson.lessons.some(lesson =>
    lessonIsVisible(lesson, state, state.viewAs)
  ),
}))(Radium(LessonGroup));
