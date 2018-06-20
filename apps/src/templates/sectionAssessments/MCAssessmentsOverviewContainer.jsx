import React, {Component, PropTypes} from 'react';
import MultipleChoiceAssessmentsOverviewTable from './MultipleChoiceAssessmentsOverviewTable';

class MCAssessmentsOverviewContainer extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.array,
  };

  render() {
    return (
      <div>
        {this.props.questionAnswerData.length > 0 &&
          <div>
            <h2>Multiple choice overview table</h2>
            <MultipleChoiceAssessmentsOverviewTable
              questionAnswerData={[]}
            />
          </div>
        }
      </div>
    );
  }
}

export default MCAssessmentsOverviewContainer;
