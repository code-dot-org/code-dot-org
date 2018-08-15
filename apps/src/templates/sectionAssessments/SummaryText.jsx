import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";

class SummaryText extends Component {
  static propTypes = {
    numStudentSubmissions: PropTypes.number.isRequired,
    totalNumStudents: PropTypes.number.isRequired,
  };

  render() {
    const {numStudentSubmissions, totalNumStudents} = this.props;
    return (
      <div>
        <div>
         {`${i18n.summaryAssessmentsOverview()} ${numStudentSubmissions} / ${totalNumStudents}`}
        </div>
      </div>
    );
  }
}

export default SummaryText;


