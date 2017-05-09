import React, { Component, PropTypes } from 'react';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

export default class CourseOverview extends Component {
  static propTypes = {
    friendlyName: PropTypes.string.isRequired,
    studentDescription: PropTypes.string,
    teacherDescription: PropTypes.string,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
  };

  render() {
    // TODO: h1 component
    const { friendlyName, studentDescription, teacherDescription, viewAs } = this.props;
    return (
      <div>
        <h1>{friendlyName}</h1>
        <div>
          {viewAs === ViewType.Student ? studentDescription : teacherDescription}
        </div>
      </div>
    );
  }
}
