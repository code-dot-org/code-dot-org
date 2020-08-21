import PropTypes from 'prop-types';
import React, {Component} from 'react';
import CourseScriptsEditor from './CourseScriptsEditor';
import ResourcesEditor from './ResourcesEditor';
import ResourceType, {
  resourceShape,
  stringForType
} from '@cdo/apps/templates/courseOverview/resourceType';
import VisibleAndPilotExperiment from '../../lib/script-editor/VisibleAndPilotExperiment';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';
import MarkdownPreview from '@cdo/apps/lib/script-editor/MarkdownPreview';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';

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
  },
  dropdown: {
    margin: '0 6px'
  },
  box: {
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid ' + color.light_gray,
    padding: 10
  }
};

export default class CourseEditor extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    versionTitle: PropTypes.string,
    familyName: PropTypes.string,
    versionYear: PropTypes.string,
    visible: PropTypes.bool.isRequired,
    isStable: PropTypes.bool.isRequired,
    pilotExperiment: PropTypes.string,
    descriptionShort: PropTypes.string,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    scriptsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    scriptNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    courseFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      descriptionStudent: this.props.descriptionStudent,
      descriptionTeacher: this.props.descriptionTeacher
    };
  }

  handleTeacherDescriptionChange = event => {
    this.setState({descriptionTeacher: event.target.value});
  };

  handleStudentDescriptionChange = event => {
    this.setState({descriptionStudent: event.target.value});
  };

  render() {
    const {
      name,
      title,
      versionTitle,
      familyName,
      versionYear,
      descriptionShort,
      scriptsInCourse,
      scriptNames,
      teacherResources,
      courseFamilies,
      versionYearOptions
    } = this.props;
    return (
      <div>
        <h1>{name}</h1>
        <label>
          Display Name
          <input
            type="text"
            name="title"
            defaultValue={title}
            style={styles.input}
          />
        </label>
        <label>
          URL slug
          <input
            type="text"
            value={name}
            style={styles.input}
            disabled={true}
          />
        </label>
        <label>
          Short Description
          <HelpTip>
            <p>used in course cards on homepage</p>
          </HelpTip>
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
            defaultValue={this.state.descriptionStudent}
            rows={5}
            style={styles.input}
            onChange={this.handleStudentDescriptionChange}
          />
          <MarkdownPreview markdown={this.state.descriptionStudent} />
        </label>
        <label>
          Teacher Description
          <textarea
            name="description_teacher"
            defaultValue={this.state.descriptionTeacher}
            rows={5}
            style={styles.input}
            onChange={this.handleTeacherDescriptionChange}
          />
          <MarkdownPreview markdown={this.state.descriptionTeacher} />
        </label>
        <label>
          Version Year Display Name
          <HelpTip>
            <p>
              Controls the text which represents this course in the "version
              year dropdown" in the top right of the course overview page. This
              will only be visible if a version year is selected below.
            </p>
          </HelpTip>
          <input
            type="text"
            defaultValue={versionTitle}
            placeholder="e.g. '19-'20"
            name="version_title"
            style={styles.input}
          />
        </label>
        <h2>Basic settings</h2>
        <label>
          Verified Resources
          <HelpTip>
            <p>
              Check if this course has resources (such as lockable lessons and
              answer keys) for verified teachers, and we want to notify
              non-verified teachers that this is the case.
            </p>
          </HelpTip>
          <input
            name="has_verified_resources"
            type="checkbox"
            defaultChecked={this.props.hasVerifiedResources}
            style={styles.checkbox}
          />
        </label>
        <h2>Publishing settings</h2>
        <label>
          Family Name
          <select
            name="family_name"
            defaultValue={familyName}
            style={styles.dropdown}
          >
            <option value="">(None)</option>
            {courseFamilies.map(familyOption => (
              <option key={familyOption} value={familyOption}>
                {familyOption}
              </option>
            ))}
          </select>
        </label>
        <label>
          Version Year
          <select
            name="version_year"
            defaultValue={versionYear}
            style={styles.dropdown}
          >
            <option value="">(None)</option>
            {versionYearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <VisibleAndPilotExperiment
          visible={this.props.visible}
          pilotExperiment={this.props.pilotExperiment}
          paramName="visible"
        />
        <label>
          Can be recommended (aka stable)
          <input
            name="is_stable"
            type="checkbox"
            defaultChecked={this.props.isStable}
            style={styles.checkbox}
          />
          <p>
            If checked, this course will be eligible to be the recommended
            version of the course. The most recent eligible version will be the
            recommended version.
          </p>
        </label>
        <h2>Units</h2>
        <label>
          <div>
            The dropdown(s) below represent the ordered set of scripts in this
            course. To remove a script, just set the dropdown to the default
            (first) value.
          </div>
          <CourseScriptsEditor
            inputStyle={styles.input}
            scriptsInCourse={scriptsInCourse}
            scriptNames={scriptNames}
          />
        </label>
        <div>
          <h2>Teacher Resources</h2>
          <div>
            Select the Teacher Resources buttons you'd like to have show up on
            the top of the course overview page
          </div>
          <ResourcesEditor
            inputStyle={styles.input}
            resources={teacherResources}
            maxResources={Object.keys(ResourceType).length}
            renderPreview={resources => (
              <DropdownButton
                text="Teacher resources"
                color={Button.ButtonColor.blue}
              >
                {resources.map(({type, link}, index) => (
                  <a key={index} href={link}>
                    {stringForType[type]}
                  </a>
                ))}
              </DropdownButton>
            )}
          />
        </div>
      </div>
    );
  }
}
