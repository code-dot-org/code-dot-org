import React, {Component} from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';

class FreeResponsesByAssessmentsContainer extends Component {
  render() {
    return (
      <div>
        <h3>Free Responses Assessments Table</h3>
        <FreeResponsesAssessmentsTable
          freeResponses={[]}
        />
        </div>

    );
  }
}

export default FreeResponsesByAssessmentsContainer;
