import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import RubricField from './RubricField';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {CommentArea} from './CommentArea';

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
  timeTeacher: {
    paddingTop: 8,
    paddingLeft: 8,
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan
  },
  timeTeacherStudentSeen: {
    color: '#25c23c'
  },
  timeStudent: {
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan
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
  performanceArea: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 16px 8px 16px'
  },
  keyConceptArea: {
    marginRight: 28,
    flexBasis: '40%'
  },
  keyConcepts: {
    fontSize: 12,
    color: color.charcoal,
    margin: 0
  },
  rubricArea: {
    flexBasis: '60%'
  },
  commentAndFooter: {
    margin: '8px 16px 8px 16px'
  },
  checkboxIcon: {
    color: '#25c23c'
  },
  form: {
    margin: 0
  },
  timestamp: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save'
};

export class TeacherFeedback extends Component {
  static propTypes = {
    user: PropTypes.number,
    disabledMode: PropTypes.bool.isRequired,
    rubric: PropTypes.shape({
      keyConcept: PropTypes.string,
      performanceLevel1: PropTypes.string,
      performanceLevel2: PropTypes.string,
      performanceLevel3: PropTypes.string,
      performanceLevel4: PropTypes.string
    }),
    visible: PropTypes.bool.isRequired,
    //Provided by Redux
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired,
    serverScriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number,
    verifiedTeacher: PropTypes.bool,
    displayKeyConcept: PropTypes.bool,
    latestFeedback: PropTypes.array,
    token: PropTypes.string,
    selectedSectionId: PropTypes.string
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    this.onRubricChange = this.onRubricChange.bind(this);

    this.state = {
      comment:
        this.props.latestFeedback[0] && this.props.latestFeedback[0].comment
          ? this.props.latestFeedback[0].comment
          : '',
      performance:
        this.props.latestFeedback[0] && this.props.latestFeedback[0].performance
          ? this.props.latestFeedback[0].performance
          : null,
      studentId: studentId,
      latestFeedback: this.props.latestFeedback
        ? this.props.latestFeedback
        : [],
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
          latestFeedback: [data],
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

  latestFeedback = () => {
    const latestFeedback =
      this.state.latestFeedback.length > 0
        ? this.state.latestFeedback[0]
        : null;

    return latestFeedback;
  };

  feedbackIsUnchanged = () => {
    const latestFeedback = this.latestFeedback();
    const feedbackUnchanged =
      (latestFeedback &&
        (this.state.comment === latestFeedback.comment &&
          this.state.performance === latestFeedback.performance)) ||
      (!latestFeedback &&
        (this.state.comment.length === 0 && this.state.performance === null));

    return feedbackUnchanged;
  };

  getFriendlyDate(feedbackSeen) {
    const now = moment();
    const dateFeedbackSeen = moment(feedbackSeen);
    const daysApart = now.diff(dateFeedbackSeen, 'days');

    if (daysApart === 0) {
      return i18n.today();
    } else if (daysApart === 1) {
      return i18n.yesterday();
    } else {
      return dateFeedbackSeen.format('l');
    }
  }

  //sub-render method invoked by getFeedbackText()
  displayFeedbackMessage([style, message, studentSeen, time]) {
    return (
      <div style={style} id="ui-test-feedback-time">
        {studentSeen && (
          <FontAwesome
            icon="check"
            className="fa-check"
            style={styles.checkboxIcon}
          />
        )}
        {`${message} `}
        {time && <span style={styles.timestamp}>{time}</span>}
      </div>
    );
  }

  getFeedbackText = (latestFeedback, studentSawFeedback) => {
    let timeStyle;
    let time;
    let feedbackMessage;
    let currentTeacherStudentSeen = false;

    //Student view indicates when feedback was last updated
    if (this.props.viewAs === ViewType.Student) {
      timeStyle = styles.timeStudent;
      time = moment.min(moment(), moment(latestFeedback.created_at)).fromNow();
      feedbackMessage = i18n.lastUpdated();
    } else if (this.props.viewAs === ViewType.Teacher) {
      timeStyle = styles.timeTeacher;
      //Teacher view if current teacher left feedback & student viewed
      if (studentSawFeedback) {
        timeStyle = {
          ...timeStyle,
          ...styles.timeTeacherStudentSeen
        };
        feedbackMessage = i18n.seenByStudent();
        time = this.getFriendlyDate(latestFeedback.student_seen_feedback);
        currentTeacherStudentSeen = true;
      } else {
        //Teacher view if current teacher left feedback & student did not view
        feedbackMessage = i18n.lastUpdatedCurrentTeacher();
        time = this.getFriendlyDate(latestFeedback.created_at);
      }
    }
    return this.displayFeedbackMessage([
      timeStyle,
      feedbackMessage,
      currentTeacherStudentSeen,
      time
    ]);
  };

  render() {
    const latestFeedback = this.latestFeedback();
    const feedbackUnchanged = this.feedbackIsUnchanged();

    const buttonDisabled =
      feedbackUnchanged ||
      this.state.submitting ||
      this.state.errorState === ErrorType.Load ||
      !this.props.verifiedTeacher;
    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();

    const placeholderWarning = this.props.verifiedTeacher
      ? i18n.feedbackPlaceholder()
      : i18n.feedbackPlaceholderNonVerified();

    const placeholderText =
      latestFeedback && latestFeedback.comment
        ? latestFeedback.comment
        : placeholderWarning;
    const dontShowStudentComment =
      !this.state.comment && this.props.viewAs === ViewType.Student;

    const showFeedbackInputAreas =
      !this.props.displayKeyConcept &&
      !(!this.state.performance && this.props.viewAs === ViewType.Student);

    const rubricLevels = [
      'performanceLevel1',
      'performanceLevel2',
      'performanceLevel3',
      'performanceLevel4'
    ];

    const studentSawFeedback =
      this.state.latestFeedback.length > 0 &&
      !!latestFeedback.student_seen_feedback;

    // Instead of unmounting the component when switching tabs, hide and show it
    // so a teacher does not lose the feedback they are giving if they switch tabs
    const tabVisible = this.props.visible
      ? styles.tabAreaVisible
      : styles.tabAreaHidden;

    // If a student has rubric feedback we want to expand that field
    const expandPerformanceLevelForStudent =
      this.props.viewAs === ViewType.Student &&
      showFeedbackInputAreas &&
      this.state.performance !== null;

    return (
      <div style={tabVisible}>
        {this.state.errorState === ErrorType.Load && (
          <span>
            <i className="fa fa-warning" style={styles.errorIcon} />
            {i18n.feedbackLoadError()}
          </span>
        )}
        {this.props.rubric && (
          <div style={styles.performanceArea}>
            <div style={styles.keyConceptArea}>
              <h1 style={styles.h1}> {i18n.rubricKeyConceptHeader()} </h1>
              <p style={styles.keyConcepts}>{this.props.rubric.keyConcept}</p>
            </div>
            <div style={styles.rubricArea}>
              <h1 style={styles.h1}> {i18n.rubricHeader()} </h1>
              <form style={styles.form}>
                {rubricLevels.map(level => (
                  <RubricField
                    key={level}
                    showFeedbackInputAreas={showFeedbackInputAreas}
                    expandByDefault={
                      this.props.displayKeyConcept ||
                      (expandPerformanceLevelForStudent &&
                        this.state.performance === level)
                    }
                    rubricLevel={level}
                    rubricValue={this.props.rubric[level]}
                    disabledMode={this.props.disabledMode}
                    onChange={this.onRubricChange}
                    currentlyChecked={this.state.performance === level}
                  />
                ))}
              </form>
            </div>
          </div>
        )}
        {!this.props.displayKeyConcept && !dontShowStudentComment && (
          <div style={styles.commentAndFooter}>
            <CommentArea
              disabledMode={this.props.disabledMode}
              comment={this.state.comment}
              placeholderText={placeholderText}
              studentHasFeedback={
                this.props.viewAs === ViewType.Student &&
                this.state.latestFeedback.length > 0
              }
              onCommentChange={this.onCommentChange}
            />
            <div style={styles.footer}>
              {this.props.viewAs === ViewType.Teacher && (
                <div style={styles.button}>
                  <Button
                    __useDeprecatedTag
                    id="ui-test-submit-feedback"
                    text={buttonText}
                    onClick={this.onSubmitFeedback}
                    color={Button.ButtonColor.blue}
                    disabled={buttonDisabled}
                  />
                  {this.state.errorState === ErrorType.Save && (
                    <span>
                      <i className="fa fa-warning" style={styles.errorIcon} />
                      {i18n.feedbackSaveError()}
                    </span>
                  )}
                </div>
              )}
              {this.state.latestFeedback.length > 0 &&
                this.getFeedbackText(latestFeedback, studentSawFeedback)}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export const UnconnectedTeacherFeedback = TeacherFeedback;
export default connect(state => ({
  viewAs: state.viewAs,
  verifiedTeacher: state.pageConstants && state.pageConstants.verifiedTeacher,
  selectedSectionId:
    state.teacherSections && state.teacherSections.selectedSectionId
}))(TeacherFeedback);
