import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';
import LessonGroupInfoDialog from '@cdo/apps/templates/progress/LessonGroupInfoDialog';
import {groupedLessonsType} from '@cdo/apps/templates/progress/progressTypes';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';

import {lessonIsVisible} from './progressHelpers';
import styles from './lesson-group.module.scss';

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
  };

  closeLessonGroupInfoDialog = () => {
    this.setState({lessonGroupInfoDialogOpen: false});
  };

  render() {
    const {isSummaryView, isPlc, viewAs, isRtl, hasVisibleLesson} = this.props;

    const {description, bigQuestions, displayName} =
      this.props.groupedLesson.lessonGroup;

    // Adjust styles if locale is RTL
    const headingTextClass = isRtl ? styles.headingTextRTL : styles.headingText;

    const TableType = isSummaryView
      ? SummaryProgressTable
      : DetailProgressTable;

    if (!hasVisibleLesson && viewAs === ViewType.Participant) {
      return null;
    }

    const hasLessonGroupInfo = description || bigQuestions;

    return (
      <div className={styles.main} id="lesson-group">
        <div
          className={classnames(styles.header, {
            [styles.headerBlue]: isPlc,
            [styles.bottom]: this.state.collapsed,
          })}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome
            icon={this.state.collapsed ? 'caret-right' : 'caret-down'}
          />
          <span className={headingTextClass}>{displayName}</span>
          {hasLessonGroupInfo && (
            <span>
              <FontAwesome
                icon="info-circle"
                className={styles.lessonGroupInfo}
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
            className={classnames(styles.contents, styles.bottom, {
              [styles.contentsBlue]: isPlc,
            })}
          >
            <TableType groupedLesson={this.props.groupedLesson} />
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedLessonGroup = LessonGroup;

export default connect((state, ownProps) => ({
  scriptId: state.progress.scriptId,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
  hasVisibleLesson: ownProps.groupedLesson.lessons.some(lesson =>
    lessonIsVisible(lesson, state, state.viewAs)
  ),
}))(LessonGroup);
