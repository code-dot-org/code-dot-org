import React, {Component} from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';

class MultipleChoiceByStudentSection extends Component {

  render() {
    return (
      <div>
        <h1>Student Multiple Choice Overview Section</h1>
        <StudentAssessmentOverviewTable
          questionAnswerData={[]}
          studentAnswerData={[]}
        />
      </div>
    );
  }
}

export default MultipleChoiceByStudentSection;
