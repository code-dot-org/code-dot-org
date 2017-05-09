import React, { Component, PropTypes } from 'react';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

export default class CourseOverview extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
  };

  render() {
    const { title, descriptionStudent, descriptionTeacher, viewAs } = this.props;
    // TODO: create an h1 component instead of depending on CSS styling for h1
    return (
      <div>
        <h1>{title}</h1>
        <div>
          {viewAs === ViewType.Student ? descriptionStudent : descriptionTeacher}
        </div>
      </div>
    );
  }
}
