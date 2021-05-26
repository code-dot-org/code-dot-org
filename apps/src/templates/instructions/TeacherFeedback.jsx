import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import {CommentArea} from './CommentArea';
import TeacherFeedbackRubric from '@cdo/apps/templates/instructions/TeacherFeedbackRubric';
import TeacherFeedbackStatus from '@cdo/apps/templates/instructions/TeacherFeedbackStatus';
import {teacherFeedbackShape, rubricShape} from '@cdo/apps/templates/types';

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save'
};

export class TeacherFeedback extends Component {
  static propTypes = {
    user: PropTypes.number,
    disabledMode: PropTypes.bool.isRequired,
    rubric: rubricShape,
    visible: PropTypes.bool.isRequired,
    //Provided by Redux
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired,
    serverScriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number,
    verifiedTeacher: PropTypes.bool,
    displayReadonlyRubric: PropTypes.bool,
    latestFeedback: teacherFeedbackShape,
    token: PropTypes.string,
    selectedSectionId: PropTypes.string
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    this.onRubricChange = this.onRubricChange.bind(this);

    const {latestFeedback} = this.props;

    this.state = {
      comment: latestFeedback?.comment || '',
      performance: latestFeedback?.performance,
      studentId: studentId,
      latestFeedback: latestFeedback,
      submitting: false,
      errorState: ErrorType.NoError
    };
  }

  componentDidMount = () => {
    window.addEventListener('beforeunload', this.onUnload);
  };

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onUnload);
  }

  onUnload = event => {
    if (!this.feedbackIsUnchanged()) {
      event.preventDefault();
      event.returnValue = i18n.feedbackNotSavedWarning();
    }
  };

  onCommentChange = value => {
    this.setState({comment: value});
  };

  onRubricChange = value => {
    //If you click on the currently selected performance level clear the performance level
    if (value === this.state.performance) {
      this.setState({performance: null});
    } else {
      this.setState({performance: value});
    }
  };

  onSubmitFeedback = () => {
    this.setState({submitting: true});
    const payload = {
      comment: this.state.comment,
      student_id: this.state.studentId,
      script_id: this.props.serverScriptId,
      level_id: this.props.serverLevelId,
      teacher_id: this.props.teacher,
      performance: this.state.performance,
      analytics_section_id: this.props.selectedSectionId
    };

    $.ajax({
      url: '/api/v1/teacher_feedbacks',
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify({teacher_feedback: payload}),
      headers: {'X-CSRF-Token': this.props.token}
    })
      .done(data => {
        this.setState({
          latestFeedback: data,
          submitting: false,
          errorState: ErrorType.NoError
        });
      })
      .fail((jqXhr, status) => {
        this.setState({
          errorState: ErrorType.Save,
          submitting: false
        });
      });
  };

  feedbackIsUnchanged = () => {
    const {latestFeedback} = this.state;
    const feedbackUnchanged =
      (latestFeedback &&
        (this.state.comment === latestFeedback.comment &&
          this.state.performance === latestFeedback.performance)) ||
      (!latestFeedback &&
        (this.state.comment.length === 0 && !this.state.performance));

    return feedbackUnchanged;
  };

  renderError(errorText) {
    return (
      <span>
        <i className="fa fa-warning" style={styles.errorIcon} />
        {errorText}
      </span>
    );
  }

  render() {
    const {
      verifiedTeacher,
      viewAs,
      rubric,
      visible,
      displayReadonlyRubric,
      disabledMode
    } = this.props;

    const {
      comment,
      performance,
      latestFeedback,
      submitting,
      errorState
    } = this.state;

    const feedbackUnchanged = this.feedbackIsUnchanged();

    const buttonDisabled =
      feedbackUnchanged ||
      submitting ||
      errorState === ErrorType.Load ||
      !verifiedTeacher;

    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();

    const placeholderWarning = verifiedTeacher
      ? i18n.feedbackPlaceholder()
      : i18n.feedbackPlaceholderNonVerified();

    const placeholderText = latestFeedback?.comment
      ? latestFeedback.comment
      : placeholderWarning;

    const displayComment =
      !displayReadonlyRubric && (!!comment || viewAs === ViewType.Teacher);

    // Instead of unmounting the component when switching tabs, hide and show it
    // so a teacher does not lose the feedback they are giving if they switch tabs
    const tabVisible = visible ? styles.tabAreaVisible : styles.tabAreaHidden;

    return (
      <div style={tabVisible}>
        {errorState === ErrorType.Load &&
          this.renderError(i18n.feedbackLoadError())}
        {rubric && (
          <TeacherFeedbackRubric
            rubric={rubric}
            performance={performance}
            isReadonly={displayReadonlyRubric}
            disabledMode={disabledMode}
            onRubricChange={this.onRubricChange}
            viewAs={viewAs}
          />
        )}
        {displayComment && (
          <div style={styles.commentAndFooter}>
            <CommentArea
              disabledMode={disabledMode}
              comment={comment}
              placeholderText={placeholderText}
              studentHasFeedback={
                viewAs === ViewType.Student && !!latestFeedback
              }
              onCommentChange={this.onCommentChange}
            />
            <div style={styles.footer}>
              {viewAs === ViewType.Teacher && (
                <div style={styles.button}>
                  <Button
                    id="ui-test-submit-feedback"
                    text={buttonText}
                    onClick={this.onSubmitFeedback}
                    color={Button.ButtonColor.blue}
                    disabled={buttonDisabled}
                  />
                  {errorState === ErrorType.Save &&
                    this.renderError(i18n.feedbackSaveError())}
                </div>
              )}
              {!!latestFeedback && (
                <TeacherFeedbackStatus
                  viewAs={viewAs}
                  latestFeedback={latestFeedback}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  tabAreaHidden: {
    display: 'none'
  },
  tabAreaVisible: {
    display: 'block'
  },
  button: {
    fontWeight: 'bold'
  },
  errorIcon: {
    color: 'red',
    margin: 10
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  h1: {
    color: color.charcoal,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  commentAndFooter: {
    margin: '8px 16px 8px 16px'
  }
};

export const UnconnectedTeacherFeedback = TeacherFeedback;
export default connect(state => ({
  viewAs: state.viewAs,
  verifiedTeacher: state.pageConstants && state.pageConstants.verifiedTeacher,
  selectedSectionId:
    state.teacherSections && state.teacherSections.selectedSectionId
}))(TeacherFeedback);
