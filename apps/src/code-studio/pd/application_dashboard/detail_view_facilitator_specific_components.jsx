import React, {PropTypes} from 'react';
import DetailViewResponse from './detail_view_response';
import {SectionHeaders, PageLabels, LabelOverrides} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';

const scoredQuestions = [
  'resumeLink', 'csRelatedJobRequirements', 'diversityTrainingDescription', 'describePriorPd', 'additionalInfo',
  ...Object.keys(PageLabels.section5YourApproachToLearningAndLeading)
];

export default class Facilitator1819Questions extends React.Component {
  static propTypes = {
    formResponses: PropTypes.object.isRequired
  };

  render() {
    // Render all the answers to the facilitator application grouped by the seven sections
    return (
      <div>
        {
          Object.keys(SectionHeaders).map((section, i) => {
            return (
              <div key={i}>
                <h3>
                  {SectionHeaders[section]}
                </h3>
                {
                  Object.keys(PageLabels[section]).map((question, j) => {
                    return (
                      <DetailViewResponse
                        question={LabelOverrides[question] || PageLabels[section][question]}
                        answer={this.props.formResponses[question]}
                        key={j}
                        layout={scoredQuestions.indexOf(question) >= 0 ? 'panel' : 'lineItem'}
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
