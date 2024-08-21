import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import {
  PublishedState,
  InstructionType,
  InstructorAudience,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import AnnouncementsEditor from '@cdo/apps/levelbuilder/announcementsEditor/AnnouncementsEditor';
import CollapsibleEditorSection from '@cdo/apps/levelbuilder/CollapsibleEditorSection';
import CourseTypeEditor from '@cdo/apps/levelbuilder/course-editor/CourseTypeEditor';
import CourseUnitsEditor from '@cdo/apps/levelbuilder/course-editor/CourseUnitsEditor';
import ResourcesEditor from '@cdo/apps/levelbuilder/course-editor/ResourcesEditor';
import CourseVersionPublishingEditor from '@cdo/apps/levelbuilder/CourseVersionPublishingEditor';
import SaveBar from '@cdo/apps/levelbuilder/SaveBar';
import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import color from '@cdo/apps/util/color';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';

class CourseEditor extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    initialTitle: PropTypes.string.isRequired,
    initialVersionTitle: PropTypes.string,
    initialFamilyName: PropTypes.string,
    initialVersionYear: PropTypes.string,
    initialPublishedState: PropTypes.oneOf(Object.values(PublishedState))
      .isRequired,
    initialInstructionType: PropTypes.oneOf(Object.values(InstructionType))
      .isRequired,
    initialInstructorAudience: PropTypes.oneOf(
      Object.values(InstructorAudience)
    ).isRequired,
    initialParticipantAudience: PropTypes.oneOf(
      Object.values(ParticipantAudience)
    ).isRequired,
    initialPilotExperiment: PropTypes.string,
    initialDescriptionShort: PropTypes.string,
    initialDescriptionStudent: PropTypes.string,
    initialDescriptionTeacher: PropTypes.string,
    initialUnitsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    unitNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    initialHasVerifiedResources: PropTypes.bool.isRequired,
    initialHasNumberedUnits: PropTypes.bool.isRequired,
    courseFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    initialAnnouncements: PropTypes.arrayOf(announcementShape).isRequired,
    courseVersionId: PropTypes.number,
    coursePath: PropTypes.string.isRequired,
    courseOfferingEditorLink: PropTypes.string,
    isMissingRequiredDeviceCompatibilities: PropTypes.bool,

    // Provided by redux
    teacherResources: PropTypes.arrayOf(resourceShape),
    studentResources: PropTypes.arrayOf(resourceShape),
  };

  constructor(props) {
    super(props);

    this.state = {
      isSaving: false,
      error: null,
      lastSaved: null,
      descriptionStudent: this.props.initialDescriptionStudent,
      descriptionTeacher: this.props.initialDescriptionTeacher,
      announcements: this.props.initialAnnouncements,
      pilotExperiment: this.props.initialPilotExperiment,
      title: this.props.initialTitle,
      versionTitle: this.props.initialVersionTitle,
      descriptionShort: this.props.initialDescriptionShort,
      hasVerifiedResources: this.props.initialHasVerifiedResources,
      hasNumberedUnits: this.props.initialHasNumberedUnits,
      familyName: this.props.initialFamilyName,
      versionYear: this.props.initialVersionYear,
      savedFamilyName: this.props.initialFamilyName,
      savedVersionYear: this.props.initialVersionYear,
      unitsInCourse: this.props.initialUnitsInCourse,
      publishedState: this.props.initialPublishedState,
      instructionType: this.props.initialInstructionType,
      instructorAudience: this.props.initialInstructorAudience,
      participantAudience: this.props.initialParticipantAudience,
    };
  }

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    this.setState({isSaving: true, lastSaved: null, error: null});

    let dataToSave = {
      title: this.state.title,
      version_title: this.state.versionTitle,
      announcements: JSON.stringify(this.state.announcements),
      description_short: this.state.descriptionShort,
      description_student: this.state.descriptionStudent,
      description_teacher: this.state.descriptionTeacher,
      has_verified_resources: this.state.hasVerifiedResources,
      has_numbered_units: this.state.hasNumberedUnits,
      family_name: this.state.familyName,
      version_year: this.state.versionYear,
      published_state: this.state.publishedState,
      instruction_type: this.state.instructionType,
      participant_audience: this.state.participantAudience,
      instructor_audience: this.state.instructorAudience,
      pilot_experiment: this.state.pilotExperiment,
      scripts: this.state.unitsInCourse,
    };

    if (this.props.teacherResources) {
      dataToSave.resourceIds = this.props.teacherResources.map(r => r.id);
    }

    if (this.props.studentResources) {
      dataToSave.studentResourceIds = this.props.studentResources.map(
        r => r.id
      );
    }

    if (
      this.state.publishedState === PublishedState.pilot &&
      this.state.pilotExperiment === ''
    ) {
      this.setState({
        isSaving: false,
        error:
          'Please provide a pilot experiment in order to save with published state as pilot.',
      });
      return;
    } else if (
      (this.state.versionYear !== '' && this.state.familyName === '') ||
      (this.state.versionYear === '' && this.state.familyName !== '')
    ) {
      this.setState({
        isSaving: false,
        error: 'Please set both version year and family name.',
      });
      return;
    } else if (
      [PublishedState.preview, PublishedState.stable].includes(
        this.state.publishedState
      ) &&
      this.props.isMissingRequiredDeviceCompatibilities
    ) {
      this.setState({
        isSaving: false,
        error:
          'Please set all device compatibilities in order to save with published state as preview or stable.',
      });
      return;
    }

    if (this.state.publishedState !== this.props.initialPublishedState) {
      const msg =
        'It looks like you are updating the published state. ' +
        'Are you sure you want to update the published state? ' +
        'Once you update the published state you can not go back to this published state. ' +
        'For example once you set the published state to beta you can not go back to in development. ' +
        'Also once a course as a published state of pilot it can not be fully launched (marked as preview or stable).';
      if (!window.confirm(msg)) {
        this.setState({
          isSaving: false,
          error: 'Saving cancelled.',
        });
        return;
      }
    }

    $.ajax({
      url: `/courses/${this.props.name}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToSave),
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          navigateToHref(linkWithQueryParams(this.props.coursePath));
        } else {
          this.setState({
            lastSaved: Date.now(),
            isSaving: false,
            savedVersionYear: data.version_year,
            savedFamilyName: data.family_name,
          });
        }
      })
      .fail(error => {
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  render() {
    const {
      name,
      unitNames,
      courseFamilies,
      versionYearOptions,
      initialPublishedState,
    } = this.props;
    const {
      announcements,
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
      unitsInCourse,
      publishedState,
      instructionType,
      instructorAudience,
      participantAudience,
    } = this.state;

    const allowMajorCurriculumChanges =
      initialPublishedState === PublishedState.in_development ||
      initialPublishedState === PublishedState.pilot;

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
                answer keys) for verified instructors, and we want to notify
                non-verified instructors that this is the case.
              </p>
            </HelpTip>
            <input
              type="checkbox"
              defaultChecked={hasVerifiedResources}
              style={styles.checkbox}
              onChange={() =>
                this.setState({hasVerifiedResources: !hasVerifiedResources})
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
              onChange={() =>
                this.setState({hasNumberedUnits: !hasNumberedUnits})
              }
            />
          </label>
        </CollapsibleEditorSection>

        <CourseTypeEditor
          instructorAudience={instructorAudience}
          participantAudience={participantAudience}
          instructionType={instructionType}
          handleInstructionTypeChange={e =>
            this.setState({instructionType: e.target.value})
          }
          handleInstructorAudienceChange={e =>
            this.setState({instructorAudience: e.target.value})
          }
          handleParticipantAudienceChange={e =>
            this.setState({participantAudience: e.target.value})
          }
          allowMajorCurriculumChanges={allowMajorCurriculumChanges}
        />

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
            initialPublishedState={this.props.initialPublishedState}
            publishedState={publishedState}
            updatePublishedState={publishedState =>
              this.setState({publishedState})
            }
            preventCourseVersionChange={
              this.props.initialVersionYear !== '' ||
              this.props.initialFamilyName !== ''
            }
            isCourse
            courseOfferingEditorLink={this.props.courseOfferingEditorLink}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Announcements">
          <AnnouncementsEditor
            announcements={announcements}
            inputStyle={styles.input}
            updateAnnouncements={this.handleUpdateAnnouncements}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Resources Dropdowns">
          Select the resources you'd like to have show up in the dropdown at the
          top of the course overview page:
          <div>
            <h4>Teacher Resources</h4>
            <ResourcesEditor
              inputStyle={styles.input}
              resources={this.props.teacherResources}
              courseVersionId={this.props.courseVersionId}
              getRollupsUrl={`/courses/${this.props.name}/get_rollup_resources`}
            />
          </div>
          <div>
            <h4>Student Resources</h4>
            <ResourcesEditor
              inputStyle={styles.input}
              resources={this.props.studentResources}
              courseVersionId={this.props.courseVersionId}
              studentFacing
            />
          </div>
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Units">
          <label>
            <div>
              The dropdown(s) below represent the ordered set of units in this
              course. To remove a unit, just set the dropdown to the default
              (first) value.
            </div>
            <CourseUnitsEditor
              inputStyle={styles.input}
              initialUnitsInCourse={this.props.initialUnitsInCourse}
              unitsInCourse={unitsInCourse}
              updateUnitsInCourse={unitsInCourse =>
                this.setState({unitsInCourse})
              }
              unitNames={unitNames}
              allowMajorCurriculumChanges={allowMajorCurriculumChanges}
            />
          </label>
        </CollapsibleEditorSection>
        <SaveBar
          handleSave={this.handleSave}
          error={this.state.error}
          isSaving={this.state.isSaving}
          lastSaved={this.state.lastSaved}
          pathForShowButton={this.props.coursePath}
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
    borderRadius: 4,
  },
  checkbox: {
    margin: '0 0 0 7px',
  },
  dropdown: {
    margin: '0 6px',
  },
  box: {
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid ' + color.light_gray,
    padding: 10,
  },
};

export const UnconnectedCourseEditor = CourseEditor;

export default connect(state => ({
  teacherResources: state.resources,
  studentResources: state.studentResources,
}))(CourseEditor);
