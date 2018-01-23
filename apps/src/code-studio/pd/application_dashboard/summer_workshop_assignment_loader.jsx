import React, {PropTypes} from 'react';
import $ from 'jquery';
import Spinner from '../components/spinner';
import SummerWorkshopAssignment from './summer_workshop_assignment';

export default class SummerWorkshopAssignmentLoader extends React.Component {
  static propTypes = {
    courseName: PropTypes.string.isRequired,
    assignedWorkshopId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    regionalPartnerGroup: PropTypes.number,
    canYouAttendQuestion: PropTypes.string.isRequired,
    canYouAttendAnswer: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  };

  state = {
    loading: true
  };

  componentWillMount() {
    this.load();
  }

  load = () => {
    // Subject is different for some attendees
    const subject = '5-day Summer,Code.org TeacherCon';
    let url = `/api/v1/pd/workshops/filter?state=Not Started&course=${this.props.courseName}&subject=${subject}`;
    url += `&start=${new Date().getFullYear()}-1-1`;
    url += `&end=${new Date().getFullYear() + 1}-1-1`;

    this.loadRequest = $.ajax({
      method: 'GET',
      url: url
    }).done(data => {
      this.setState({
        loading: false,
        workshops: data.workshops.map(workshop => {
          return {
            value: workshop.id,
            label: workshop.date_and_location_name
          };
        })
      });
    });
  };


  render() {
    if (this.state.loading) {
      return (<Spinner/>);
    } else {
      return (
        <SummerWorkshopAssignment
          workshops={this.state.workshops}
          assignedWorkshopId={this.props.assignedWorkshopId}
          onChange={this.props.onChange}
          editing={this.props.editing}
          canYouAttendQuestion={this.props.canYouAttendQuestion}
          canYouAttendAnswer={this.props.canYouAttendAnswer}
        />
      );
    }
  }
}
