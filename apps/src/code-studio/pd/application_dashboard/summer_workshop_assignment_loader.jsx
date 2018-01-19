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

  getMyWorkshops() {
    let url = `/api/v1/pd/workshops/filter?state=Not Started&course=${this.props.courseName}&subject=5-day Summer`;
    url += `&start=${new Date().getFullYear()}-1-1`;
    url += `&end=${new Date().getFullYear() + 1}-1-1`;

    return $.ajax({
      method: 'GET',
      dataType: "json",
      url: url
    });
  }

  getTeacherconWorkshops() {
    let url = `/api/v1/pd/workshops/upcoming_teachercon?course=${this.props.courseName}`;

    return $.ajax({
      method: 'GET',
      dataType: "json",
      url: url
    });
  }

  load() {
    $.when(
      this.getMyWorkshops(),
      this.getTeacherconWorkshops()
    ).done((mine, teachercon) => {
      const workshops = mine[0].workshops.concat(teachercon[0]);
      this.setState({
        loading: false,
        workshops: workshops.map(workshop => {
          return {
            value: workshop.id,
            label: workshop.date_and_location_name
          };
        })
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (<Spinner />);
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
