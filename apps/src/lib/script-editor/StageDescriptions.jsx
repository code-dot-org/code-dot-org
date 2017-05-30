import React, { PropTypes } from 'react';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

const NBSP = "\u00a0";

const styles = {
  main: {
    border: '1px solid ' + color.light_gray,
    padding: 10
  },
  stage: {
    paddingTop: 10,
    paddingBottom: 10
  },
  stageName: {
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
    backgroundColor: color.realyellow,
  }
};

/**
 * Shows a list of stages that have descriptions, along with those descriptions.
 * If you click the import button, it grabs new descriptions from curriculum
 * builder and shows both sets.
 */
const StageDescriptions = React.createClass({
  propTypes: {
    scriptName: PropTypes.string.isRequired,
    currentDescriptions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        descriptionStudent: PropTypes.string.isRequired,
        descriptionTeacher: PropTypes.string.isRequired,
      })
    ).isRequired
  },

  getInitialState() {
    return {
      // start collapsed
      collapsed: true,
      buttonText: null,
      importedDescriptions: [],
      mismatchedStages: [],
    };
  },

  expand() {
    this.setState({
      collapsed: false
    });
  },

  processImport(result) {
    let importedDescriptions = [];
    const { currentDescriptions } = this.props;

    const mismatchedStages = [];

    result.lessons.forEach((lesson, index) => {
      if (index >= currentDescriptions.length) {
        // CB gave us more lessons that we have on LB. throw the extras away
        mismatchedStages.push(lesson.title);
        return;
      }

      if (currentDescriptions[index].name !== lesson.title) {
        mismatchedStages.push(lesson.title);
      }

      importedDescriptions.push({
        name: lesson.title,
        descriptionStudent: lesson.student_desc,
        descriptionTeacher: lesson.teacher_desc
      });
    });

    this.setState({
      buttonText: 'Imported',
      importedDescriptions,
      mismatchedStages
    });
  },

  importDescriptions() {
    this.setState({
      buttonText: 'Querying server...'
    });

    $.getJSON(`https://curriculum.code.org/metadata/${this.props.scriptName}.json`)
    .done(this.processImport)
    .fail(jqXHR => {
      this.setState({
        buttonText: jqXHR.statusText
      });
    });
  },

  updatedStageDescriptions() {
    const { currentDescriptions } = this.props;
    const { importedDescriptions } = this.state;

    // we want to make sure that we use the existing names, with the imported descriptions
    return currentDescriptions.map((item, index) => ({
      name: item.name,
      descriptionStudent: importedDescriptions[index].descriptionStudent,
      descriptionTeacher: importedDescriptions[index].descriptionTeacher,
    }));
  },

  render() {
    const { currentDescriptions } = this.props;
    const { importedDescriptions } = this.state;

    const hasImported = importedDescriptions.length > 0;

    return (
      <div>
        <h4>
          Stage Descriptions
        </h4>
        <div style={styles.main}>
          {this.state.collapsed &&
            <button className="btn" onClick={this.expand}>Click to Expand</button>
          }
          {!this.state.collapsed &&
            <div>
              {currentDescriptions.map((stage, index) => {
                const currentStudent = stage.descriptionStudent;
                const currentTeacher = stage.descriptionTeacher;

                const importedStage = importedDescriptions[index];
                const updatedStudent = hasImported && importedStage.descriptionStudent;
                const updatedTeacher = hasImported && importedStage.descriptionTeacher;

                return (
                  <div style={styles.stage} key={index}>
                    <div style={styles.stageName}>
                      {stage.name}
                    </div>
                    {hasImported && importedStage.name !== stage.name &&
                      <div>
                        Lesson name on Curriculum Builder:{" "}
                        <span style={styles.diff}>{importedStage.name}</span>
                      </div>
                    }
                    <label>
                      Student Description
                      <div style={styles.original}>{currentStudent || NBSP}</div>
                      {hasImported && updatedStudent !== currentStudent &&
                        <div style={styles.update}>{updatedStudent}</div>
                      }
                    </label>
                    <label>
                      Teacher Description
                      <div style={styles.original}>{currentTeacher || NBSP}</div>
                      {hasImported && updatedTeacher !== currentTeacher &&
                        <div style={styles.update}>{updatedTeacher}</div>
                      }
                    </label>
                  </div>
                );
              })}
              {this.state.mismatchedStages.length > 0 &&
                <div style={styles.mismatch}>
                  <div style={{fontWeight: 'bold'}}>
                    Curriculum Builder stages with different names than their levelbuilder
                    counterparts. If there are a lot of these, it may indicate them being
                    ordered differently in the two environments.
                  </div>
                  {this.state.mismatchedStages.map((name, index) => (
                    <div key={index}>- {name}</div>
                  ))}
                </div>
              }
              {hasImported &&
                <input
                  name="stage_descriptions"
                  type="hidden"
                  defaultValue={JSON.stringify(this.updatedStageDescriptions())}
                />
              }
              <button
                className="btn"
                disabled={!!this.state.buttonText}
                onClick={this.importDescriptions}
              >
                {this.state.buttonText || "Import from Curriculum Builder"}
              </button>
            </div>
          }
        </div>
      </div>
    );
  }
});

export default StageDescriptions;
