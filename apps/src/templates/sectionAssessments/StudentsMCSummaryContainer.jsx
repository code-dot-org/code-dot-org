import React, {Component} from 'react';
import StudentsAssessmentsMCTable from './StudentsAssessmentsMCTable';

class StudentsMCSummaryContainer extends Component {

  render() {
    return (
      <div>
        <h1>Students MC Summary Container </h1>
        <StudentsAssessmentsMCTable
          studentOverviewData={[]}
        />
      </div>
    );
  }
}

export default StudentsMCSummaryContainer;
