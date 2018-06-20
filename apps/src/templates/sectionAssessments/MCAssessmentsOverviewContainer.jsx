import React, {Component} from 'react';
import MultipleChoiceAssessmentsOverviewTable from './MultipleChoiceAssessmentsOverviewTable';

class MCAssessmentsOverviewContainer extends Component {

  render() {
    return (
      <div>
        <h2>Multiple choice overview table</h2>
          <MultipleChoiceAssessmentsOverviewTable
            questionAnswerData={[]}
          />
      </div>
    );
  }
}

export default MCAssessmentsOverviewContainer;
