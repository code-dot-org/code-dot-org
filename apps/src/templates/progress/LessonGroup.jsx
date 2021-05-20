import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {groupedLessonsType} from '@cdo/apps/templates/progress/progressTypes';
import color from '@cdo/apps/util/color';
import LessonGroupInfoDialog from '@cdo/apps/templates/progress/LessonGroupInfoDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {lessonIsVisible} from './progressHelpers';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';

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
    lessonIsVisible: PropTypes.func.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool
  };

  state = {
    collapsed: false,
    lessonGroupInfoDialogOpen: false
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  openLessonGroupInfoDialog = () => {
    /*
    Because the info button is on the header which collapses when clicked we have to
    reverse the collapsing when you click the info button
    */
    this.setState({
      collapsed: !this.state.collapsed,
      lessonGroupInfoDialogOpen: true
    });
    firehoseClient.putRecord(
      {
        study: 'unit_overview_page',
        study_group: 'lesson_group',
        event: 'view_lesson_group_info',
        data_json: JSON.stringify({
          script_id: this.props.scriptId,
          lesson_group_id: this.props.groupedLesson.lessonGroup.id
        })
      },
      {includeUserId: true}
    );
  };

  closeLessonGroupInfoDialog = () => {
    this.setState({lessonGroupInfoDialogOpen: false});
  };

  render() {
    const {isSummaryView, isPlc, lessonIsVisible, viewAs, isRtl} = this.props;
    const {lessonGroup, lessons} = this.props.groupedLesson;

    // Adjust styles if locale is RTL
    const headingTextStyle = isRtl ? styles.headingTextRTL : styles.headingText;

    const TableType = isSummaryView
      ? SummaryProgressTable
      : DetailProgressTable;

    const hasVisibleLesson = lessons.some(lesson => lessonIsVisible(lesson));

    if (!hasVisibleLesson && viewAs === ViewType.Student) {
      return null;
    }

    return (
      <div style={styles.main} className="lesson-group">
        <div
          style={[
            styles.header,
            isPlc && styles.headerBlue,
            this.state.collapsed && styles.bottom
          ]}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome
            icon={this.state.collapsed ? 'caret-right' : 'caret-down'}
          />
          <span style={headingTextStyle}>{lessonGroup.displayName}</span>
          {(lessonGroup.description || lessonGroup.bigQuestions) && (
            <FontAwesome
              icon="info-circle"
              style={styles.lessonGroupInfo}
              onClick={this.openLessonGroupInfoDialog}
            />
          )}
          <div className="print-only">
            <LessonGroupInfo
              description={lessonGroup.description}
              bigQuestions={lessonGroup.bigQuestions}
            />
          </div>
          <LessonGroupInfoDialog
            isOpen={this.state.lessonGroupInfoDialogOpen}
            displayName={lessonGroup.displayName}
            bigQuestions={lessonGroup.bigQuestions}
            description={lessonGroup.description}
            closeDialog={this.closeLessonGroupInfoDialog}
          />
        </div>
        {!this.state.collapsed && (
          <div
            style={[
              styles.contents,
              isPlc && styles.contentsBlue,
              styles.bottom
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
    marginBottom: 20
  },
  header: {
    padding: 20,
    backgroundColor: color.purple,
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
    color: 'white',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    cursor: 'pointer'
  },
  headerBlue: {
    backgroundColor: color.cyan
  },
  headingText: {
    marginLeft: 10
  },
  headingTextRTL: {
    marginRight: 10
  },
  contents: {
    backgroundColor: color.lighter_purple,
    padding: 20
  },
  contentsBlue: {
    backgroundColor: color.lightest_cyan
  },
  bottom: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  lessonGroupInfo: {
    padding: 10
  }
};

export const UnconnectedLessonGroup = LessonGroup;

export default connect(state => ({
  scriptId: state.progress.scriptId,
  lessonIsVisible: lesson => lessonIsVisible(lesson, state, state.viewAs),
  viewAs: state.viewAs,
  isRtl: state.isRtl
}))(Radium(LessonGroup));
