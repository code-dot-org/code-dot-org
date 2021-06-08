import PropTypes from 'prop-types';
import React, {Component} from 'react';
import CourseScriptsEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseScriptsEditor';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import ResourceType, {
  resourceShape
} from '@cdo/apps/templates/courseOverview/resourceType';
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import {connect} from 'react-redux';
import CourseVersionPublishingEditor from '@cdo/apps/lib/levelbuilder/CourseVersionPublishingEditor';
import $ from 'jquery';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';

const PUBLISHED_STATES = ['pilot', 'beta', 'preview', 'recommended'];

class CourseEditor extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    initialTitle: PropTypes.string.isRequired,
    initialVersionTitle: PropTypes.string,
    initialFamilyName: PropTypes.string,
    initialVersionYear: PropTypes.string,
    initialPublishedState: PropTypes.oneOf(PUBLISHED_STATES).isRequired,
    initialPilotExperiment: PropTypes.string,
    initialDescriptionShort: PropTypes.string,
    initialDescriptionStudent: PropTypes.string,
    initialDescriptionTeacher: PropTypes.string,
    initialScriptsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    scriptNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    initialTeacherResources: PropTypes.arrayOf(resourceShape),
    initialHasVerifiedResources: PropTypes.bool.isRequired,
    initialHasNumberedUnits: PropTypes.bool.isRequired,
    courseFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    initialAnnouncements: PropTypes.arrayOf(announcementShape).isRequired,
    useMigratedResources: PropTypes.bool.isRequired,
    courseVersionId: PropTypes.number,
    coursePath: PropTypes.string.isRequired,

    // Provided by redux
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape),
    studentResources: PropTypes.arrayOf(migratedResourceShape)
  };

  constructor(props) {
    super(props);

    const teacherResources = [...props.initialTeacherResources];

    if (!props.useMigratedResources) {
      // add empty entries to get to max
      while (teacherResources.length < Object.keys(ResourceType).length) {
        teacherResources.push({type: '', link: ''});
      }
    }

    this.state = {
      isSaving: false,
      error: null,
      lastSaved: null,
      descriptionStudent: this.props.initialDescriptionStudent,
      descriptionTeacher: this.props.initialDescriptionTeacher,
      announcements: this.props.initialAnnouncements,
      pilotExperiment: this.props.initialPilotExperiment,
      teacherResources: teacherResources,
      title: this.props.initialTitle,
      versionTitle: this.props.initialVersionTitle,
      descriptionShort: this.props.initialDescriptionShort,
      hasVerifiedResources: this.props.initialHasVerifiedResources,
      hasNumberedUnits: this.props.initialHasNumberedUnits,
      familyName: this.props.initialFamilyName,
      versionYear: this.props.initialVersionYear,
      scriptsInCourse: this.props.initialScriptsInCourse,
      publishedState: this.props.initialPublishedState
    };
  }

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleView = () => {
    navigateToHref(linkWithQueryParams(this.props.coursePath));
  };

  handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    this.setState({isSaving: true, lastSaved: null, error: null});

    let dataToSave = {
      title: this.state.title,
      version_title: this.state.versionTitle,
      description_short: this.state.descriptionShort,
      description_student: this.state.descriptionStudent,
      description_teacher: this.state.descriptionTeacher,
      has_verified_resources: this.state.hasVerifiedResources,
      has_numbered_units: this.state.hasNumberedUnits,
      family_name: this.state.familyName,
      version_year: this.state.versionYear,
      published_state: this.state.publishedState,
      pilot_experiment: this.state.pilotExperiment,
      scripts: this.state.scriptsInCourse
    };

    if (this.props.migratedTeacherResources) {
      dataToSave.resourceIds = this.props.migratedTeacherResources.map(
        r => r.id
      );
    }

    if (this.props.studentResources) {
      dataToSave.studentResourceIds = this.props.studentResources.map(
        r => r.id
      );
    }

    if (
      this.state.publishedState === 'pilot' &&
      this.state.pilotExperiment === ''
    ) {
      this.setState({
        isSaving: false,
        error:
          'Please provide a pilot experiment in order to save with published state as pilot.'
      });
      return;
    }

    $.ajax({
      url: `/courses/${this.props.name}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToSave)
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          navigateToHref(linkWithQueryParams(this.props.coursePath));
        } else {
          this.setState({
            lastSaved: Date.now(),
            isSaving: false
          });
        }
      })
      .fail(error => {
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  render() {
    const {name, scriptNames, courseFamilies, versionYearOptions} = this.props;
    const {
      announcements,
      teacherResources,
      title,
      versionTitle,
      descriptionShort,
      descriptionStudent,
      descriptionTeacher,
      hasVerifiedResources,
      hasNumberedUnits,
      familyName,
      versionYear,
      pilotExperiment,
      scriptsInCourse,
      publishedState
    } = this.state;
    return (
      <div>
        <h1>{name}</h1>
        <label>
          Display Name
          <input
            type="text"
            defaultValue={title}
            style={styles.input}
            onChange={e => this.setState({title: e.target.value})}
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
            style={styles.input}
            onChange={e => this.setState({versionTitle: e.target.value})}
          />
        </label>
        <label>
          Short Description
          <HelpTip>
            <p>used in course cards on homepage</p>
          </HelpTip>
          <textarea
            defaultValue={descriptionShort}
            rows={5}
            style={styles.input}
            onChange={e => this.setState({descriptionShort: e.target.value})}
          />
        </label>
        <TextareaWithMarkdownPreview
          markdown={descriptionStudent}
          label={'Student Description'}
          inputRows={5}
          handleMarkdownChange={e =>
            this.setState({descriptionStudent: e.target.value})
          }
          features={{imageUpload: true, resourceLink: true}}
        />
        <TextareaWithMarkdownPreview
          markdown={descriptionTeacher}
          label={'Teacher Description'}
          inputRows={5}
          handleMarkdownChange={e =>
            this.setState({descriptionTeacher: e.target.value})
          }
          features={{imageUpload: true, resourceLink: true}}
        />

        <CollapsibleEditorSection title="Basic Settings">
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
              type="checkbox"
              defaultChecked={hasVerifiedResources}
              style={styles.checkbox}
              onChange={e =>
                this.setState({hasVerifiedResources: e.target.value})
              }
            />
          </label>
          <label>
            Unit Numbering
            <HelpTip>
              <p>
                Automatically provide numbers in unit names in the order listed
                below.
              </p>
            </HelpTip>
            <input
              type="checkbox"
              defaultChecked={hasNumberedUnits}
              style={styles.checkbox}
              onChange={e => this.setState({hasNumberedUnits: e.target.value})}
            />
          </label>
          <AnnouncementsEditor
            announcements={announcements}
            inputStyle={styles.input}
            updateAnnouncements={this.handleUpdateAnnouncements}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Publishing Settings">
          <CourseVersionPublishingEditor
            pilotExperiment={pilotExperiment}
            versionYear={versionYear}
            familyName={familyName}
            updatePilotExperiment={pilotExperiment =>
              this.setState({pilotExperiment})
            }
            updateFamilyName={familyName => this.setState({familyName})}
            updateVersionYear={versionYear => this.setState({versionYear})}
            families={courseFamilies}
            versionYearOptions={versionYearOptions}
            publishedState={publishedState}
            updatePublishedState={publishedState =>
              this.setState({publishedState})
            }
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Resources Dropdowns">
          Select the resources you'd like to have show up in the dropdown at the
          top of the course overview page:
          <div>
            <h4>Teacher Resources</h4>
            <ResourcesEditor
              inputStyle={styles.input}
              resources={teacherResources}
              migratedResources={this.props.migratedTeacherResources}
              updateResources={teacherResources =>
                this.setState({teacherResources})
              }
              courseVersionId={this.props.courseVersionId}
              useMigratedResources={this.props.useMigratedResources}
              getRollupsUrl={`/courses/${this.props.name}/get_rollup_resources`}
            />
          </div>
          {this.props.useMigratedResources && (
            <div>
              <h4>Student Resources</h4>
              <ResourcesEditor
                inputStyle={styles.input}
                migratedResources={this.props.studentResources}
                courseVersionId={this.props.courseVersionId}
                useMigratedResources
                studentFacing
              />
            </div>
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Units">
          <label>
            <div>
              The dropdown(s) below represent the ordered set of scripts in this
              course. To remove a script, just set the dropdown to the default
              (first) value.
            </div>
            <CourseScriptsEditor
              inputStyle={styles.input}
              scriptsInCourse={scriptsInCourse}
              updateScriptsInCourse={scriptsInCourse =>
                this.setState({scriptsInCourse})
              }
              scriptNames={scriptNames}
            />
          </label>
        </CollapsibleEditorSection>
        <SaveBar
          handleSave={this.handleSave}
          handleView={this.handleView}
          error={this.state.error}
          isSaving={this.state.isSaving}
          lastSaved={this.state.lastSaved}
        />
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

export const UnconnectedCourseEditor = CourseEditor;

export default connect(state => ({
  migratedTeacherResources: state.resources,
  studentResources: state.studentResources
}))(CourseEditor);
