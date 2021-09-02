import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import _ from 'lodash';
import Spinner from '../components/spinner';
import WorkshopAssignmentSelect from './workshop_assignment_select';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const SUBJECT_NAME_MAP = {
  summer: SubjectNames.SUBJECT_SUMMER_WORKSHOP,
  fit: SubjectNames.SUBJECT_FIT
};
const SUBJECT_TYPES = Object.keys(SUBJECT_NAME_MAP);
export {SUBJECT_TYPES};

export default class WorkshopAssignmentLoader extends React.Component {
  static propTypes = {
    courseName: PropTypes.string.isRequired,
    subjectType: PropTypes.oneOf(SUBJECT_TYPES).isRequired,
    assignedWorkshopId: PropTypes.number,
    year: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };

  state = {
    loading: true
  };

  componentWillMount() {
    this.load();
  }

  componentWillUnmount() {
    if (this.pendingRequests) {
      this.pendingRequests.forEach(request => request.abort());
    }
  }

  storePendingRequest = request => this.pendingRequests.push(request);

  getMyWorkshops() {
    const params = {
      state: 'Not Started',
      course: this.props.courseName,
      subject: SUBJECT_NAME_MAP[this.props.subjectType],
      start: `${this.props.year || new Date().getFullYear()}-1-1`,
      end: `${this.props.year || new Date().getFullYear()}-12-31`
    };
    const url = `/api/v1/pd/workshops/filter?${$.param(params)}`;
    return _.tap(
      $.ajax({
        method: 'GET',
        dataType: 'json',
        url
      }),
      this.storePendingRequest
    ).then(response => {
      return response.workshops;
    });
  }

  getTeacherconWorkshops() {
    const params = {
      course: this.props.courseName
    };
    let url = `/api/v1/pd/workshops/upcoming_teachercons?${$.param(params)}`;

    return _.tap(
      $.ajax({
        method: 'GET',
        dataType: 'json',
        url: url
      }),
      this.storePendingRequest
    );
  }

  load() {
    this.pendingRequests = [];

    let queries = [this.getMyWorkshops()];
    if (this.props.subjectType === 'summer') {
      queries.push(this.getTeacherconWorkshops());
    }

    Promise.all(queries)
      .then(responses => {
        this.pendingRequests = [];

        const workshops = responses.reduce(
          (flattened, subset) => flattened.concat(subset),
          []
        );
        this.setState({
          loading: false,
          workshops: workshops.map(workshop => {
            return {
              value: workshop.id,
              label: workshop.date_and_location_name
            };
          })
        });
      })
      .catch(error => {
        if (error.statusText !== 'abort') {
          this.setState({
            loading: false,
            error: true
          });
        }
      });
  }

  render() {
    if (this.state.loading) {
      return <Spinner />;
    } else if (this.state.error) {
      return (
        <div className="workshop-load-error" style={styles.error}>
          Oops. Something went wrong and we are unable to load workshops.
        </div>
      );
    } else {
      return (
        <WorkshopAssignmentSelect
          workshops={this.state.workshops}
          assignedWorkshopId={this.props.assignedWorkshopId}
          onChange={this.props.onChange}
        />
      );
    }
  }
}

const styles = {
  error: {
    color: color.red,
    display: 'inline-block'
  }
};
