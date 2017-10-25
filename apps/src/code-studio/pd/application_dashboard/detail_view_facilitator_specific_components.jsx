import React, {PropTypes} from 'react';
import DetailViewResponse from './detail_view_response';
import {sectionLabels, pageLabels, scoredQuestions, detailPageLabelOverrides} from '../application/facilitator1819/Facilitator1819Labels';

export default class Facilitator1819Questions extends React.Component {
  static propTypes = {
    formResponses: PropTypes.object.isRequired
  }

  render() {
    // Render all the answers to the facilitator application grouped by the seven sections
    return (
      <div>
        {
          Object.keys(sectionLabels).map((section, i) => {
            return (
              <div key={i}>
                <h3>
                  {sectionLabels[section]}
                </h3>
                {
                  Object.keys(pageLabels[section]).map((question, j) => {
                    return (
                      <DetailViewResponse
                        question={detailPageLabelOverrides[question] || pageLabels[section][question]}
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
