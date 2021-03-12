import PropTypes from 'prop-types';
import React from 'react';
import WorkshopAssignmentLoader, {
  SUBJECT_TYPES
} from './workshop_assignment_loader';

export default class DetailViewWorkshopAssignmentResponse extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    courseName: PropTypes.string.isRequired,
    subjectType: PropTypes.oneOf(SUBJECT_TYPES).isRequired,
    assignedWorkshop: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      url: PropTypes.string
    }).isRequired,
    year: PropTypes.number,
    editing: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  };

  render() {
    let answer;
    if (this.props.editing) {
      answer = (
        <WorkshopAssignmentLoader
          courseName={this.props.courseName}
          subjectType={this.props.subjectType}
          assignedWorkshopId={this.props.assignedWorkshop.id}
          year={this.props.year}
          onChange={this.props.onChange}
        />
      );
    } else if (this.props.assignedWorkshop.id) {
      answer = (
        <span>
          {this.props.assignedWorkshop.name} (
          <a
            href={this.props.assignedWorkshop.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            see workshop
          </a>
          )
        </span>
      );
    } else {
      answer = 'Unassigned';
    }

    return <div>{answer}</div>;
  }
}
