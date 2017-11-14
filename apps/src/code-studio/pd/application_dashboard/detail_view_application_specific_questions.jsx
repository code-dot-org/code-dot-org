import React, {PropTypes} from 'react';
import DetailViewResponse from './detail_view_response';
import {
  SectionHeaders as TeacherSectionHeaders,
  PageLabels as TeacherPageLabels
} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {
  SectionHeaders as FacilitatorSectionHeaders,
  PageLabels as FacilitatorPageLabels,
  LabelOverrides as FacilitatorLabelOverrides,
  NumberedQuestions
} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';

const paneledQuestions = {
  'Teacher1819Application': [],
  'Facilitator1819Application': [
    'resumeLink', 'csRelatedJobRequirements', 'diversityTrainingDescription', 'describePriorPd', 'additionalInfo',
    ...Object.keys(FacilitatorPageLabels.section5YourApproachToLearningAndLeading)
  ]
};

export default class DetailViewApplicationSpecificQuestions extends React.Component {
  static propTypes = {
    formResponses: PropTypes.object.isRequired,
    applicationType: PropTypes.oneOf(Object.keys(paneledQuestions))
  }

   constructor(props) {
    super(props);

    this.state = {
      sectionHeaders: this.props.applicationType === 'Teacher1819Application' ? TeacherSectionHeaders : FacilitatorSectionHeaders,
      pageLabels: this.props.applicationType === 'Teacher1819Application' ? TeacherPageLabels : FacilitatorPageLabels,
      labelOverrides: this.props.applicationType === 'Teacher1819Application' ? {} : FacilitatorLabelOverrides,
      numberedQuestions: this.props.applicationType === 'Teacher1819Application' ? [] : NumberedQuestions,
      paneledQuestions: paneledQuestions[this.props.applicationType]
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
                {
                  Object.keys(this.state.pageLabels[section]).map((question, j) => {
                    return (
                      <DetailViewResponse
                        question={this.getQuestionText(section, question)}
                        answer={this.props.formResponses[question]}
                        key={j}
                        layout={this.state.paneledQuestions.indexOf(question) >= 0 ? 'panel' : 'lineItem'}
                      />
                    );
                  })
                }
              </div>
            );
          })
        }
      </div>
    );
  }
}
