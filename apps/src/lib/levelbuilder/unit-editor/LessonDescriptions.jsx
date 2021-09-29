import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

const NBSP = '\u00a0';

/**
 * Shows a list of lessons that have descriptions, along with those descriptions.
 * If you click the import button, it grabs new descriptions from curriculum
 * builder and shows both sets.
 */
export default class LessonDescriptions extends React.Component {
  static propTypes = {
    scriptName: PropTypes.string.isRequired,
    currentDescriptions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        descriptionStudent: PropTypes.string.isRequired,
        descriptionTeacher: PropTypes.string.isRequired
      })
    ).isRequired,
    updateLessonDescriptions: PropTypes.func.isRequired
  };

  state = {
    // start collapsed
    collapsed: true,
    buttonText: null,
    importedDescriptions: [],
    mismatchedLessons: []
  };

  toggleExpanded = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  processImport = result => {
    let importedDescriptions = [];
    const {currentDescriptions} = this.props;

    const mismatchedLessons = [];

    result.lessons.forEach((lesson, index) => {
      if (index >= currentDescriptions.length) {
        // CB gave us more lessons that we have on LB. throw the extras away
        mismatchedLessons.push(lesson.title);
        return;
      }

      if (currentDescriptions[index].name !== lesson.title) {
        mismatchedLessons.push(lesson.title);
      }

      importedDescriptions.push({
        name: lesson.title,
        descriptionStudent: lesson.student_desc,
        descriptionTeacher: lesson.teacher_desc
      });
    });

    this.setState(
      {
        buttonText: 'Imported',
        importedDescriptions,
        mismatchedLessons
      },
      this.props.updateLessonDescriptions(
        this.updatedLessonDescriptions(),
        importedDescriptions.length > 0
      )
    );
  };

  importDescriptions = () => {
    this.setState({
      buttonText: 'Querying server...'
    });

    $.getJSON(
      `https://curriculum.code.org/metadata/${this.props.scriptName}.json`
    )
      .done(this.processImport)
      .fail(jqXHR => {
        this.setState({
          buttonText: jqXHR.statusText
        });
      });
  };

  updatedLessonDescriptions = () => {
    const {currentDescriptions} = this.props;
    const {importedDescriptions} = this.state;

    // we want to make sure that we use the existing names, with the imported descriptions
    return currentDescriptions.map((item, index) => {
      const descriptions = importedDescriptions[index] || {};
      return {
        name: item.name,
        descriptionStudent: descriptions.descriptionStudent,
        descriptionTeacher: descriptions.descriptionTeacher
      };
    });
  };

  render() {
    const {currentDescriptions} = this.props;
    const {importedDescriptions} = this.state;

    const hasImported = importedDescriptions.length > 0;

    return (
      <div>
        <h4>Lesson Descriptions</h4>
        <div style={styles.main}>
          <button type="button" className="btn" onClick={this.toggleExpanded}>
            {this.state.collapsed ? 'Click to Expand' : 'Click to Collapse'}
          </button>
          {!this.state.collapsed && (
            <div>
              {currentDescriptions.map((lesson, index) => {
                const currentStudent = lesson.descriptionStudent;
                const currentTeacher = lesson.descriptionTeacher;

                const importedLesson = importedDescriptions[index] || {};
                const updatedStudent =
                  hasImported && importedLesson.descriptionStudent;
                const updatedTeacher =
                  hasImported && importedLesson.descriptionTeacher;

                return (
                  <div style={styles.lesson} key={index}>
                    <div style={styles.lessonName}>{lesson.name}</div>
                    {hasImported && importedLesson.name !== lesson.name && (
                      <div>
                        Lesson name on Curriculum Builder:{' '}
                        <span style={styles.diff}>{importedLesson.name}</span>
                      </div>
                    )}
                    <label>
                      Student Description
                      <div style={styles.original}>
                        {currentStudent || NBSP}
                      </div>
                      {hasImported && updatedStudent !== currentStudent && (
                        <div style={styles.update}>{updatedStudent}</div>
                      )}
                    </label>
                    <label>
                      Teacher Description
                      <div style={styles.original}>
                        {currentTeacher || NBSP}
                      </div>
                      {hasImported && updatedTeacher !== currentTeacher && (
                        <div style={styles.update}>{updatedTeacher}</div>
                      )}
                    </label>
                  </div>
                );
              })}
              {this.state.mismatchedLessons.length > 0 && (
                <div style={styles.mismatch}>
                  <div style={{fontWeight: 'bold'}}>
                    Curriculum Builder lessons with different names than their
                    levelbuilder counterparts. If there are a lot of these, it
                    may indicate them being ordered differently in the two
                    environments.
                  </div>
                  {this.state.mismatchedLessons.map((name, index) => (
                    <div key={index}>- {name}</div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn"
                disabled={!!this.state.buttonText}
                onClick={this.importDescriptions}
              >
                {this.state.buttonText || 'Import from Curriculum Builder'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    border: '1px solid ' + color.light_gray,
    padding: 10
  },
  lesson: {
    paddingTop: 10,
    paddingBottom: 10
  },
  lessonName: {
    fontSize: 16,
    textDecoration: 'underline'
  },
  original: {
    backgroundColor: color.lightest_gray
  },
  update: {
    backgroundColor: 'lightgreen'
  },
  diff: {
    backgroundColor: color.realyellow
  },
  expander: {
    paddingLeft: 10
  },
  collapsed: {
    display: 'none'
  },
  mismatch: {
    backgroundColor: color.realyellow
  }
};
