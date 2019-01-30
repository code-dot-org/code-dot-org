import React, {Component, PropTypes} from 'react';
import {progressStyles} from "./multiGridConstants";

export default class SectionProgressNameCell extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptId: PropTypes.number.isRequired,
  };

  render() {
    const {name, studentId, sectionId, scriptId} = this.props;
    return (
      <div style={progressStyles.nameCell}>
        <a
          href={`/teacher-dashboard#/sections/${sectionId}/student/${studentId}/script/${scriptId}`}
          style={progressStyles.link}
        >
          {name}
        </a>
      </div>
    );
  }
}
