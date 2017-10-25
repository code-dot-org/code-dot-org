import React, {PropTypes} from 'react';
import {renderItem} from './detail_view_contents';
import {sectionLabels, pageLabels, scoredQuestions, detailPageLabelOverrides} from '../application/facilitator1819/Facilitator1819Labels';

export default class Facilitator1819Questions extends React.Component {
  static propTypes = {
    formResponses: PropTypes.object.isRequired
  }

  render() {
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
                    return renderItem(
                      detailPageLabelOverrides[question] || pageLabels[section][question],
                      this.props.formResponses[question],
                      scoredQuestions.indexOf(question) >= 0 ? 'questionBox' : 'lineItem',
                      j
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
