import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import DetailViewResponse from './detail_view_response';
import {
  SectionHeaders as TeacherSectionHeaders,
  PageLabels as TeacherPageLabels,
  LabelOverrides as TeacherLabelOverrides,
  ValidScores as TeacherValidScores
} from '@cdo/apps/generated/pd/teacher2021ApplicationConstants';
import {
  SectionHeaders as FacilitatorSectionHeaders,
  PageLabels as FacilitatorPageLabels,
  LabelOverrides as FacilitatorLabelOverrides,
  NumberedQuestions
} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';
import PrincipalApprovalButtons from './principal_approval_buttons';

const TEACHER = 'Teacher';
const FACILITATOR = 'Facilitator';

const paneledQuestions = {
  [TEACHER]: Object.keys(TeacherValidScores),
  [FACILITATOR]: [
    'resumeLink',
    'csRelatedJobRequirements',
    'diversityTrainingDescription',
    'describePriorPd',
    'additionalInfo',
    ...Object.keys(
      FacilitatorPageLabels.section5YourApproachToLearningAndLeading
    )
  ]
};

export default class DetailViewApplicationSpecificQuestions extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    formResponses: PropTypes.object.isRequired,
    applicationType: PropTypes.oneOf([TEACHER, FACILITATOR]).isRequired,
    editing: PropTypes.bool,
    scores: PropTypes.object,
    handleScoreChange: PropTypes.func,
    applicationGuid: PropTypes.string,
    schoolStats: PropTypes.object,
    initialPrincipalApproval: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      principalApproval: this.props.initialPrincipalApproval
    };

    this.sectionHeaders =
      props.applicationType === TEACHER
        ? _.omit(TeacherSectionHeaders, [
            'section5Submission',
            'section6Submission'
          ])
        : FacilitatorSectionHeaders;
    this.pageLabels =
      props.applicationType === TEACHER
        ? TeacherPageLabels
        : FacilitatorPageLabels;
    this.labelOverrides =
      props.applicationType === TEACHER
        ? TeacherLabelOverrides
        : FacilitatorLabelOverrides;
    this.numberedQuestions =
      props.applicationType === TEACHER ? [] : NumberedQuestions;
    this.paneledQuestions = paneledQuestions[props.applicationType];
    this.validScores =
      props.applicationType === TEACHER ? TeacherValidScores : {};
  }

  getQuestionText = (section, question) => {
    let questionText =
      this.labelOverrides[question] || this.pageLabels[section][question];

    let questionNumber = '';
    if (this.numberedQuestions.indexOf(question) >= 0) {
      questionNumber = this.numberedQuestions.indexOf(question) + 1 + '. ';
    }

    return questionNumber + questionText;
  };

  handlePrincipalApprovalChange = (_id, principalApproval) => {
    this.setState({principalApproval});
  };

  renderNoPrincipalApprovalButtons() {
    if (!this.state.principalApproval) {
      return (
        <div>
          <h4>Select option</h4>
          <PrincipalApprovalButtons
            applicationId={this.props.id}
            showSendEmailButton={true}
            showNotRequiredButton={true}
            onChange={this.handlePrincipalApprovalChange}
          />
        </div>
      );
    } else if (this.state.principalApproval === 'Not required') {
      return (
        <div>
          <h4>Not required</h4>
          <p>
            If you would like to require principal approval for this teacher,
            please click “Send email” to the principal asking for approval.
          </p>
          <PrincipalApprovalButtons
            applicationId={this.props.id}
            showSendEmailButton={true}
            onChange={this.handlePrincipalApprovalChange}
          />
        </div>
      );
    } else {
      // incomplete
      const principalApprovalUrl = `${
        window.location.origin
      }/pd/application/principal_approval/${this.props.applicationGuid}`;

      return (
        <div>
          <h4>{this.state.principalApproval}</h4>
          <p>
            Link to principal approval form:{' '}
            <a href={principalApprovalUrl} target="_blank">
              {principalApprovalUrl}
            </a>
          </p>
        </div>
      );
    }
  }

  renderResponsesForSection(section) {
    if (
      section === 'detailViewPrincipalApproval' &&
      !(
        this.state.principalApproval &&
        this.state.principalApproval.startsWith('Complete')
      )
    ) {
      // The principal approval section has special messaging when no principal approval has been received.
      return this.renderNoPrincipalApprovalButtons();
    } else {
      return Object.keys(this.pageLabels[section]).map((question, j) => {
        return (
          <DetailViewResponse
            question={this.getQuestionText(section, question)}
            questionId={question}
            answer={this.props.formResponses[question]}
            key={j}
            layout={
              this.paneledQuestions.indexOf(question) >= 0
                ? 'panel'
                : 'lineItem'
            }
            score={this.props.scores[question]}
            possibleScores={this.validScores[question]}
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
        {Object.keys(this.sectionHeaders).map((section, i) => {
          return (
            <div key={i}>
              <h3>{this.sectionHeaders[section]}</h3>
              {this.renderResponsesForSection(section)}
            </div>
          );
        })}
      </div>
    );
  }
}
