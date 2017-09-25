import React, { Component, PropTypes } from 'react';
import CourseScriptsEditor from './CourseScriptsEditor';
import ResourcesEditor from './ResourcesEditor';
import CourseOverviewTopRow from './CourseOverviewTopRow';
import { resourceShape } from './resourceType';
import { Provider } from 'react-redux';
import { getStore } from '@cdo/apps/code-studio/redux';

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4
  },
  checkbox: {
    margin: '0 0 0 7px'
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
    hasVerifiedResources: PropTypes.bool.isRequired,
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
          Verified Resources
          <input
            name="has_verified_resources"
            type="checkbox"
            defaultChecked={this.props.hasVerifiedResources}
            style={styles.checkbox}
          />
          <p>
            Check if this course has resources (such as lockable lessons and answer
            keys) for verified teachers, and we want to notify non-verified teachers
            that this is the case.
          </p>
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
        <div>
          <h4>Teacher Resources</h4>
          <div>
            Select up to three Teacher Resources buttons you'd like to have show up on
            the top of the course overview page
          </div>
          <ResourcesEditor
            inputStyle={styles.input}
            resources={teacherResources}
            maxResources={3}
            renderPreview={resources => (
              <Provider store={getStore()}>
                <CourseOverviewTopRow
                  sectionsInfo={[]}
                  id={-1}
                  title="Unused title"
                  resources={resources}
                />
              </Provider>
            )}
          />
        </div>
      </div>
    );
  }
}
