import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {lessonGroupType} from '@cdo/apps/templates/progress/progressTypes';
import color from '@cdo/apps/util/color';
import LessonGroupInfoDialog from '@cdo/apps/templates/progress/LessonGroupInfoDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';

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

/**
 * A component that shows a group of lessons. That group has a name and is
 * collapsible. It can show the lessons in either a detail or a summary view.
 */
class LessonGroup extends React.Component {
  static propTypes = {
    scriptId: PropTypes.number,
    lessonGroup: lessonGroupType,
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.toggleCollapsed = this.toggleCollapsed.bind(this);
    this.openLessonGroupInfoDialog = this.openLessonGroupInfoDialog.bind(this);
    this.closeLessonGroupInfoDialog = this.closeLessonGroupInfoDialog.bind(
      this
    );
  }

  state = {
    collapsed: false,
    lessonGroupInfoDialogOpen: false
  };

  toggleCollapsed() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  openLessonGroupInfoDialog() {
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
          lesson_group_id: this.props.lessonGroup.id
        })
      },
      {includeUserId: true}
    );
  }

  closeLessonGroupInfoDialog() {
    this.setState({lessonGroupInfoDialogOpen: false});
  }

  render() {
    const {lessonGroup, isSummaryView, isPlc} = this.props;

    const TableType = isSummaryView
      ? SummaryProgressTable
      : DetailProgressTable;
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';

    return (
      <div style={styles.main}>
        <div
          style={[
            styles.header,
            isPlc && styles.headerBlue,
            this.state.collapsed && styles.bottom
          ]}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome icon={icon} />
          <span style={styles.headingText}>{lessonGroup.displayName}</span>
          {(lessonGroup.description || lessonGroup.bigQuestions) && (
            <FontAwesome
              icon="info-circle"
              style={styles.lessonGroupInfo}
              onClick={this.openLessonGroupInfoDialog}
            />
          )}
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
            <TableType lessons={lessonGroup.lessons} />
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedLessonGroup = LessonGroup;

export default connect(state => ({
  scriptId: state.progress.scriptId
}))(Radium(LessonGroup));
