import React, { Component, PropTypes } from 'react';
import CourseScriptsEditor from './CourseScriptsEditor';
import ResourcesEditor from './ResourcesEditor';
import { resourceShape } from './resourceType';

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4
  }
};

export default class CourseEditor extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    descriptionShort: PropTypes.string,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    scriptsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    scriptNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
  };

  render() {
    const {
      name,
      title,
      descriptionShort,
      descriptionStudent,
      descriptionTeacher,
      scriptsInCourse,
      scriptNames,
      teacherResources,
    } = this.props;
    return (
      <div>
        <h1>{name}</h1>
        <label>
          Title
          <input
            type="text"
            name="title"
            defaultValue={title}
            style={styles.input}
          />
        </label>
        <label>
          Short Description (used in course cards on homepage)
          <textarea
            name="description_short"
            defaultValue={descriptionShort}
            rows={5}
            style={styles.input}
          />
        </label>
        <label>
          Student Description
          <textarea
            name="description_student"
            defaultValue={descriptionStudent}
            rows={5}
            style={styles.input}
          />
        </label>
        <label>
          Teacher Description
          <textarea
            name="description_teacher"
            defaultValue={descriptionTeacher}
            rows={5}
            style={styles.input}
          />
        </label>
        <label>
          <h4>Scripts</h4>
          <div>
            The dropdown(s) below represent the orded set of scripts in this course.
            To remove a script, just set the dropdown to the default (first) value.
          </div>
          <CourseScriptsEditor
            inputStyle={styles.input}
            scriptsInCourse={scriptsInCourse}
            scriptNames={scriptNames}
          />
        </label>
        <label>
          <h4>Teacher Resources</h4>
          <div>
            Select up to three Teacher Resources buttons you'd like to have show up on
            the top of the course overview page
          </div>
          <ResourcesEditor inputStyle={styles.input} resources={teacherResources}/>
        </label>
      </div>
    );
  }
}
