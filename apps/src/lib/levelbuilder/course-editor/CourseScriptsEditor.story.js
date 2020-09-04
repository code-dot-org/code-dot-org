import CourseScriptsEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseScriptsEditor';
import React from 'react';

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

const scriptNames = ['Hour of Code', 'course1', 'course2', 'csp1', 'csp2'];

export default storybook => {
  storybook.storiesOf('CourseScriptsEditor', module).addStoryTable([
    {
      name: 'no selected scripts',
      story: () => (
        <CourseScriptsEditor
          inputStyle={styles.input}
          scriptsInCourse={[]}
          scriptNames={scriptNames}
        />
      )
    },
    {
      name: 'one selected script',
      story: () => (
        <CourseScriptsEditor
          inputStyle={styles.input}
          scriptsInCourse={[scriptNames[1]]}
          scriptNames={scriptNames}
        />
      )
    }
  ]);
};
