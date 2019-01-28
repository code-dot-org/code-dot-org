import React, {Component, PropTypes} from 'react';
import {progressStyles} from "./multiGridConstants";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class SectionProgressNameCell extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptId: PropTypes.number.isRequired,
  };

  render() {
    const {name, studentId, sectionId, scriptId} = this.props;
    const sectionScriptUrlForStudent = pegasus(`/teacher-dashboard#/sections/${sectionId}/student/${studentId}/script/${scriptId}`);

    return (
      <div style={progressStyles.nameCell}>
        <a
          href={sectionScriptUrlForStudent}
          style={progressStyles.link}
        >
          {name}
        </a>
      </div>
    );
  }
}
