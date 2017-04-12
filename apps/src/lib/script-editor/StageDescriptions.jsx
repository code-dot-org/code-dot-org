import React, { PropTypes } from 'react';
import _ from 'lodash';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

const NBSP = "\u00a0";

const styles = {
  main: {
    border: '1px solid lightgray',
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
  expander: {
    paddingLeft: 10
  },
  collapsed: {
    display: 'none'
  },
  warning: {
    backgroundColor: color.realyellow
  }
};

/**
 * Shows a list of stages that have descriptions, along with those descriptions.
 * If you click the import button, it grabs new descriptions from curriculum
 * builder and shows both sets.
 */
const StageDescriptions = React.createClass({
  propTypes: {
    currentByStage: PropTypes.objectOf(
      PropTypes.shape({
        studentDescription: PropTypes.string.isRequired,
        teacherDescription: PropTypes.string.isRequired,
      })
    ).isRequired
  },

  getInitialState() {
    return {
      // start collapsed
      collapsed: true,
      importText: null,
      importedByStage: {},
      ignoredStages: []
    };
  },

  expand() {
    this.setState({
      collapsed: false
    });
  },

  processImport(result) {
    let importedByStage = {};
    const { currentByStage } = this.props;

    const ignoredStages = [];

    result.lessons.forEach(lesson => {
      const current = currentByStage[lesson.title];
      if (!current) {
        ignoredStages.push(lesson.title);
        return;
      }
      importedByStage[lesson.title] = {
        studentDescription: lesson.student_desc,
        teacherDescription: lesson.teacher_desc
      };
    });

    this.setState({
      importText: 'Imported',
      importedByStage,
      ignoredStages
    });
  },

  importDescriptions() {
    this.setState({
      importText: 'Querying server...'
    });

    // TODO - path isnt hardcoded
    $.getJSON('https://curriculum.code.org/csp/unit2.json')
    .done(this.processImport)
    .fail(jqXHR => {
      this.setState({
        importText: jqXHR.statusText
      });
    });
  },

  render() {
    const { currentByStage } = this.props;
    const { importedByStage } = this.state;

    const stageNames = _.uniq(Object.keys(currentByStage).concat(Object.keys(importedByStage)));

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
              {stageNames.map((stageName, index) => {
                const currentStudent = (currentByStage[stageName] || {}).studentDescription;
                const currentTeacher = (currentByStage[stageName] || {}).teacherDescription;
                const updatedStudent = (importedByStage[stageName] || {}).studentDescription;
                const updatedTeacher = (importedByStage[stageName] || {}).teacherDescription;

                return (
                  <div style={styles.stage} key={index}>
                    <div style={styles.stageName}>{stageName}</div>
                    <label>
                      Student Description
                      <div style={styles.original}>{currentStudent || NBSP}</div>
                      {importedByStage[stageName] && updatedStudent !== currentStudent &&
                        <div style={styles.update}>{updatedStudent}</div>
                      }
                    </label>
                    <label>
                      Teacher Description
                      <div style={styles.original}>{currentTeacher || NBSP}</div>
                      {importedByStage[stageName] && updatedTeacher !== currentTeacher &&
                        <div style={styles.update}>{updatedTeacher}</div>
                      }
                    </label>
                  </div>
                );
              })}
              {this.state.ignoredStages.length > 0 &&
                <div style={styles.warning}>
                  Stages from Curriculum Builder that don't have matching stages in levelbuilder:
                  {this.state.ignoredStages.map((name, index) => (
                    <div key={index}>{name}</div>
                  ))}
                </div>
              }
              <button
                className="btn"
                disabled={!!this.state.importText}
                onClick={this.importDescriptions}
              >
                {this.state.importText || "Import from Curriculum Builder"}
              </button>
            </div>
          }
        </div>
      </div>
    );
  }
});

export default StageDescriptions;
