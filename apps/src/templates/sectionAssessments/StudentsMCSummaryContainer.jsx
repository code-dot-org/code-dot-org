import React, {Component} from 'react';
import StudentAssessmentsMCTable from './StudentAssessmentsMCTable';

class StudentsMCSummaryContainer extends Component {

  render() {
    return (
      <div>
        <h1>Students MC Summary Container </h1>
        <StudentAssessmentsMCTable
          studentOverviewData={[]}
        />
      </div>
    );
  }
}

export default StudentsMCSummaryContainer;
