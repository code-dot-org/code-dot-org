import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Link from '@cdo/apps/componentLibrary/link/Link';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import HelpTip from '@cdo/apps/legacySharedComponents/HelpTip';
import color from '@cdo/apps/util/color';

export default class CourseVersionPublishingEditor extends Component {
  static propTypes = {
    pilotExperiment: PropTypes.string,
    versionYear: PropTypes.string,
    familyName: PropTypes.string,
    updatePilotExperiment: PropTypes.func.isRequired,
    updateFamilyName: PropTypes.func.isRequired,
    updateVersionYear: PropTypes.func.isRequired,
    families: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isCourse: PropTypes.bool,
    updateIsCourse: PropTypes.func,
    showIsCourseSelector: PropTypes.bool,
    initialPublishedState: PropTypes.string.isRequired,
    publishedState: PropTypes.oneOf(Object.values(PublishedState)).isRequired,
    updatePublishedState: PropTypes.func.isRequired,
    preventCourseVersionChange: PropTypes.bool,
    courseOfferingEditorLink: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      addingFamilyName: false,
      selectedFamilyName: props.familyName,
      newFamilyName: '',
    };
  }

  handlePublishedStateChange = event => {
    const newPublishedState = event.target.value;

    this.props.updatePublishedState(newPublishedState);
    if (newPublishedState !== PublishedState.pilot) {
      this.props.updatePilotExperiment('');
    }
  };

  handleNewFamilyNameChange = e => {
    if (e.target.value === '') {
      this.props.updateFamilyName(this.state.selectedFamilyName);
      this.setState({newFamilyName: '', addingFamilyName: false});
    } else {
      this.props.updateFamilyName(e.target.value);
      this.setState({newFamilyName: e.target.value, addingFamilyName: true});
    }
  };

  onFamilyNameSelect = e => {
    this.setState({selectedFamilyName: e.target.value});
    this.props.updateFamilyName(e.target.value);
  };

  /*
   * We only want a course to be able to progress
   * forward in published states. So as the editor updates the
   * published start of the course the options to update in the
   * future should get smaller.
   */
  getAvailablePublishedStates = currentState => {
    const availablePublishedStates = {
      in_development: [
        PublishedState.in_development,
        PublishedState.pilot,
        PublishedState.beta,
        PublishedState.preview,
        PublishedState.stable,
        PublishedState.sunsetting,
        PublishedState.deprecated,
      ],
      pilot: [
        PublishedState.pilot,
        PublishedState.sunsetting,
        PublishedState.deprecated,
      ],
      beta: [
        PublishedState.beta,
        PublishedState.preview,
        PublishedState.stable,
        PublishedState.sunsetting,
        PublishedState.deprecated,
      ],
      preview: [
        PublishedState.preview,
        PublishedState.stable,
        PublishedState.sunsetting,
        PublishedState.deprecated,
      ],
      stable: [
        PublishedState.stable,
        PublishedState.sunsetting,
        PublishedState.deprecated,
      ],
      sunsetting: [PublishedState.sunsetting, PublishedState.deprecated],
      deprecated: [PublishedState.deprecated],
    };

    return availablePublishedStates[currentState];
  };

  render() {
    return (
      <div>
        {this.props.showIsCourseSelector && (
          <label>
            Is a Standalone Unit
            <input
              className="isCourseCheckbox"
              type="checkbox"
              checked={this.props.isCourse}
              disabled={this.props.preventCourseVersionChange}
              style={styles.checkbox}
              onChange={this.props.updateIsCourse}
            />
            {this.props.familyName && (
              <HelpTip>
                <p>
                  If checked, indicates that this Unit represents a standalone
                  unit. Examples of such Units include CourseA-F, Express, and
                  Pre-Express.
                </p>
              </HelpTip>
            )}
            {!this.props.familyName && (
              <HelpTip>
                <p>
                  You must select a family name in order to mark something as a
                  standalone unit.
                </p>
              </HelpTip>
            )}
          </label>
        )}

        {this.props.isCourse && (
          <div>
            <label>
              Family Name
              <select
                value={this.state.selectedFamilyName}
                style={styles.dropdown}
                className="familyNameSelector"
                disabled={
                  this.props.preventCourseVersionChange ||
                  !!this.state.newFamilyName
                }
                onChange={this.onFamilyNameSelect}
              >
                <option value="">(None)</option>
                {this.props.families.map(familyOption => (
                  <option key={familyOption} value={familyOption}>
                    {familyOption}
                  </option>
                ))}
              </select>
              {!this.props.preventCourseVersionChange && (
                <span>
                  or{' '}
                  <input
                    type="text"
                    value={this.state.newFamilyName}
                    style={styles.smallInput}
                    onChange={this.handleNewFamilyNameChange}
                  />
                </span>
              )}
              <HelpTip>
                <p>
                  The family name is used to group together courses that are
                  different version years of the same course so that users can
                  be redirected between different version years. Family names
                  should only contain letters, numbers, and dashes.
                </p>
              </HelpTip>
            </label>
            <label>
              Version Year
              <select
                value={this.props.versionYear}
                style={styles.dropdown}
                className="versionYearSelector"
                onChange={event =>
                  this.props.updateVersionYear(event.target.value)
                }
                disabled={this.props.preventCourseVersionChange}
              >
                <option value="">(None)</option>
                {this.props.versionYearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <label>
          Published State
          <select
            className="publishedStateSelector"
            value={this.props.publishedState}
            style={styles.dropdown}
            onChange={this.handlePublishedStateChange}
          >
            {this.getAvailablePublishedStates(
              this.props.initialPublishedState
            ).map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <HelpTip>
            Making a change to this setting updates who can see and assign this
            curriculum. It also impacts what kinds of edits can be made, some of
            which can not be reversed without engineering assistance.
            <br />
            <br />
            Click "More info" for more information.
          </HelpTip>
          <Link
            href="https://github.com/code-dot-org/code-dot-org/wiki/Updating-Publish-State-of-Scripts-or-Courses"
            openInNewTab={true}
          >
            More info
          </Link>
        </label>
        {this.props.publishedState === PublishedState.pilot && (
          <label>
            Pilot Experiment
            <HelpTip>
              <p>
                If specified, this course will only be accessible to
                levelbuilders, or to classrooms whose teacher is enrolled in
                this pilot experiment
              </p>
            </HelpTip>
            <input
              value={this.props.pilotExperiment}
              style={styles.input}
              className="pilotExperimentInput"
              onChange={event =>
                this.props.updatePilotExperiment(event.target.value)
              }
            />
          </label>
        )}
        {this.props.courseOfferingEditorLink && (
          <div style={styles.buttonAndHelpTip}>
            <Button
              __useDeprecatedTag
              color={Button.ButtonColor.gray}
              href={this.props.courseOfferingEditorLink}
              target="_blank"
              text={'Edit Course Offering'}
            />
            <HelpTip>
              <p>
                The course offering is the thing that groups all the different
                course versions of a course together. For example for csd all
                versions of csd (csd-2020, csd-2021, etc.) are all part of the
                csd course offering. On the course offering edit page you can
                change the display name for the course offering as well as its
                location in the assignment dropdown.
              </p>
            </HelpTip>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0,
  },
  smallInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0,
    height: '100%',
  },
  dropdown: {
    margin: '0 6px',
  },
  checkbox: {
    margin: '0 0 0 7px',
  },
  tableBorder: {
    border: '1px solid ' + color.white,
    padding: 5,
  },
  buttonAndHelpTip: {
    display: 'flex',
    alignItems: 'center',
  },
};
