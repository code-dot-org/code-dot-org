import React, {PropTypes} from 'react';
import _ from 'lodash';
import DetailViewResponse from './detail_view_response';
import {
  SectionHeaders as TeacherSectionHeaders,
  PageLabels as TeacherPageLabels,
  LabelOverrides as TeacherLabelOverrides,
  ValidScores as TeacherValidScores
} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {
  SectionHeaders as FacilitatorSectionHeaders,
  PageLabels as FacilitatorPageLabels,
  LabelOverrides as FacilitatorLabelOverrides,
  NumberedQuestions
} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';
import SummerWorkshopAssignmentLoader from "./summer_workshop_assignment_loader";

const TEACHER = 'Teacher';
const FACILITATOR = 'Facilitator';

const paneledQuestions = {
  [TEACHER]: Object.keys(TeacherValidScores),
  [FACILITATOR]: [
    'resumeLink', 'csRelatedJobRequirements', 'diversityTrainingDescription', 'describePriorPd', 'additionalInfo',
    ...Object.keys(FacilitatorPageLabels.section5YourApproachToLearningAndLeading)
  ]
};

export default class DetailViewApplicationSpecificQuestions extends React.Component {
  static propTypes = {
    formResponses: PropTypes.object.isRequired,
    applicationType: PropTypes.oneOf([TEACHER, FACILITATOR]).isRequired,
    editing: PropTypes.bool,
    scores: PropTypes.object,
    handleScoreChange: PropTypes.func,
    courseName: PropTypes.string
  }

   constructor(props) {
    super(props);

    this.state = {
      sectionHeaders: this.props.applicationType === TEACHER ? _.omit(TeacherSectionHeaders, ['section5Submission']) : FacilitatorSectionHeaders,
      pageLabels: this.props.applicationType === TEACHER ? TeacherPageLabels : FacilitatorPageLabels,
      labelOverrides: this.props.applicationType === TEACHER ? TeacherLabelOverrides : FacilitatorLabelOverrides,
      numberedQuestions: this.props.applicationType === TEACHER ? [] : NumberedQuestions,
      paneledQuestions: paneledQuestions[this.props.applicationType],
      validScores: this.props.applicationType === TEACHER ? TeacherValidScores : {}
    };
  }

  getQuestionText = (section, question) => {
    let questionText = this.state.labelOverrides[question] || this.state.pageLabels[section][question];

    let questionNumber = '';
    if (this.state.numberedQuestions.indexOf(question) >= 0) {
      questionNumber = this.state.numberedQuestions.indexOf(question) + 1 + ". ";
    }

    return questionNumber + questionText;
  };

  renderSummerWorkshopAssignmentSection() {
    let questionKey = !!(this.props.formResponses['ableToAttendSingle']) ?
      'ableToAttendSingle' : 'ableToAttendMultiple';

    let canYouAttendQuestion = this.getQuestionText('section4SummerWorkshop', questionKey);

    return (
      <SummerWorkshopAssignmentLoader
        courseName={this.props.courseName}
        onChange={() => {}}
        editing={this.props.editing}
        canYouAttendQuestion={canYouAttendQuestion}
        canYouAttendAnswer={this.props.formResponses[questionKey]}
      />
    );
  }

  renderResponsesForSection(section) {
    // Lame edge case but has to be done
    if (section === 'detailViewPrincipalApproval' && !this.props.formResponses['principalApproval']) {
      return (<h4>Not yet submitted</h4>);
    } else {
      return Object.keys(this.state.pageLabels[section]).map((question, j) => {
        return (
          <DetailViewResponse
            question={this.getQuestionText(section, question)}
            questionId={question}
            answer={this.props.formResponses[question]}
            key={j}
            layout={this.state.paneledQuestions.indexOf(question) >= 0 ? 'panel' : 'lineItem'}
            score={this.props.scores[question]}
            possibleScores={this.state.validScores[question]}
            editing={this.props.editing}
            handleScoreChange={this.props.handleScoreChange}
          />
        );
      });
    }
  }

  render() {
    return (
      <div>
        {
          Object.keys(this.state.sectionHeaders).map((section, i) => {
            return (
              <div key={i}>
                <h3>
                  {this.state.sectionHeaders[section]}
                </h3>
                {section === 'section4SummerWorkshop' && this.renderSummerWorkshopAssignmentSection()}
                {this.renderResponsesForSection(section)}
              </div>
            );
          })
        }
      </div>
    );
  }
}
