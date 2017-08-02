import React, { Component, PropTypes } from 'react';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import CourseScript from './CourseScript';
import AssignToSection from './AssignToSection';

const styles = {
  description: {
    marginBottom: 20
  }
};

export default class CourseOverview extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    isTeacher: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    scripts: PropTypes.array.isRequired
  };

  render() {
    const {
      title,
      id,
      descriptionStudent,
      descriptionTeacher,
      sectionsInfo,
      isTeacher,
      viewAs,
      scripts
    } = this.props;
    return (
      <div>
        <h1>{title}</h1>
        <div style={styles.description}>
          {viewAs === ViewType.Student ? descriptionStudent : descriptionTeacher}
        </div>
        {isTeacher && (
          <AssignToSection
            sectionsInfo={sectionsInfo}
            courseId={id}
            assignmentName={title}
          />
        )}
        {scripts.map((script, index) => (
          <CourseScript
            key={index}
            title={script.title}
            name={script.name}
            description={script.description}
          />
        ))}
      </div>
    );
  }
}
