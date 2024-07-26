import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import {
  InstructionType,
  PublishedState,
  InstructorAudience,
  ParticipantAudience,
  CurriculumUmbrella,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import CourseTypeEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseTypeEditor';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import CourseVersionPublishingEditor from '@cdo/apps/lib/levelbuilder/CourseVersionPublishingEditor';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import LessonExtrasEditor from '@cdo/apps/lib/levelbuilder/unit-editor/LessonExtrasEditor';
import UnitCard from '@cdo/apps/lib/levelbuilder/unit-editor/UnitCard';
import {
  init,
  mapLessonGroupDataForEditor,
} from '@cdo/apps/lib/levelbuilder/unit-editor/unitEditorRedux';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import Dialog from '@cdo/apps/templates/Dialog';
import MultiCheckboxSelector from '@cdo/apps/templates/MultiCheckboxSelector';
import color from '@cdo/apps/util/color';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';

import {lessonGroupShape} from './shapes';

/**
 * Component for editing units in unit_groups or stand alone courses
 */
class UnitEditor extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    i18nData: PropTypes.object.isRequired,
    initialPublishedState: PropTypes.oneOf(Object.values(PublishedState))
      .isRequired,
    //Published state of units in a course can be set to be different than the course overall.
    //We only use this field for units in a course
    initialUnitPublishedState: PropTypes.oneOf(Object.values(PublishedState)),
    initialInstructionType: PropTypes.oneOf(Object.values(InstructionType))
      .isRequired,
    initialInstructorAudience: PropTypes.oneOf(
      Object.values(InstructorAudience)
    ).isRequired,
    initialParticipantAudience: PropTypes.oneOf(
      Object.values(ParticipantAudience)
    ).isRequired,
    initialDeprecated: PropTypes.bool,
    initialLoginRequired: PropTypes.bool,
    initialHideableLessons: PropTypes.bool,
    initialStudentDetailProgressView: PropTypes.bool,
    initialProfessionalLearningCourse: PropTypes.string,
    initialPeerReviewsRequired: PropTypes.number,
    initialOnlyInstructorReviewRequired: PropTypes.bool,
    initialWrapupVideo: PropTypes.string,
    initialProjectWidgetVisible: PropTypes.bool,
    initialProjectWidgetTypes: PropTypes.arrayOf(PropTypes.string),
    initialLastUpdatedAt: PropTypes.string,
    initialLessonExtrasAvailable: PropTypes.bool,
    initialHasVerifiedResources: PropTypes.bool,
    initialCurriculumPath: PropTypes.string,
    initialPilotExperiment: PropTypes.string,
    initialEditorExperiment: PropTypes.string,
    initialAnnouncements: PropTypes.arrayOf(announcementShape).isRequired,
    initialSupportedLocales: PropTypes.arrayOf(PropTypes.string),
    initialLocales: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
    initialProjectSharing: PropTypes.bool,
    initialCurriculumUmbrella: PropTypes.oneOf(
      Object.values(CurriculumUmbrella).push('')
    ),
    initialFamilyName: PropTypes.string,
    initialVersionYear: PropTypes.string,
    unitFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isLevelbuilder: PropTypes.bool,
    initialTts: PropTypes.bool,
    hasCourse: PropTypes.bool,
    initialIsCourse: PropTypes.bool,
    initialShowCalendar: PropTypes.bool,
    initialWeeklyInstructionalMinutes: PropTypes.number,
    isMigrated: PropTypes.bool,
    initialIncludeStudentLessonPlans: PropTypes.bool,
    initialCourseVersionId: PropTypes.number,
    initialUseLegacyLessonPlans: PropTypes.bool,
    scriptPath: PropTypes.string.isRequired,
    courseOfferingEditorLink: PropTypes.string,
    isCSDCourseOffering: PropTypes.bool,
    isMissingRequiredDeviceCompatibilities: PropTypes.bool,

    // from redux
    lessonGroups: PropTypes.arrayOf(lessonGroupShape).isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    studentResources: PropTypes.arrayOf(resourceShape).isRequired,
    init: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      isSaving: false,
      error: null,
      lastSaved: null,
      ttsDialogOpen: false,
      familyName: this.props.initialFamilyName,
      savedFamilyName: this.props.initialFamilyName,
      isCourse: this.props.initialIsCourse,
      showCalendar: this.props.initialShowCalendar,
      weeklyInstructionalMinutes:
        this.props.initialWeeklyInstructionalMinutes || '',
      description: this.props.i18nData.description,
      studentDescription: this.props.i18nData.studentDescription,
      announcements: this.props.initialAnnouncements,
      loginRequired: this.props.initialLoginRequired,
      hideableLessons: this.props.initialHideableLessons,
      studentDetailProgressView: this.props.initialStudentDetailProgressView,
      deeperLearningCourse: this.props.initialProfessionalLearningCourse,
      onlyInstructorReviewRequired:
        this.props.initialOnlyInstructorReviewRequired,
      peerReviewsRequired: this.props.initialPeerReviewsRequired,
      wrapupVideo: this.props.initialWrapupVideo,
      projectWidgetVisible: this.props.initialProjectWidgetVisible,
      projectWidgetTypes: this.props.initialProjectWidgetTypes,
      lastUpdatedAt: this.props.initialLastUpdatedAt,
      lessonExtrasAvailable: this.props.initialLessonExtrasAvailable,
      hasVerifiedResources: this.props.initialHasVerifiedResources,
      curriculumPath: this.props.initialCurriculumPath,
      pilotExperiment: this.props.initialPilotExperiment,
      editorExperiment: this.props.initialEditorExperiment,
      supportedLocales: this.props.initialSupportedLocales,
      locales: this.props.initialLocales,
      projectSharing: this.props.initialProjectSharing,
      curriculumUmbrella: this.props.initialCurriculumUmbrella,
      versionYear: this.props.initialVersionYear,
      savedVersionYear: this.props.initialVersionYear,
      tts: this.props.initialTts,
      title: this.props.i18nData.title || '',
      descriptionAudience: this.props.i18nData.descriptionAudience || '',
      descriptionShort: this.props.i18nData.descriptionShort || '',
      includeStudentLessonPlans: this.props.initialIncludeStudentLessonPlans,
      useLegacyLessonPlans: this.props.initialUseLegacyLessonPlans,
      publishedState: this.props.initialPublishedState,
      unitPublishedState: this.props.initialUnitPublishedState,
      instructionType: this.props.initialInstructionType,
      instructorAudience: this.props.initialInstructorAudience,
      participantAudience: this.props.initialParticipantAudience,
    };
  }

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleClearSupportedLocalesSelectClick = () => {
    this.setState({supportedLocales: []});
  };

  handleChangeSupportedLocales = selectedOptions => {
    this.setState({supportedLocales: selectedOptions});
  };

  handleFamilyNameChange = event => {
    this.setState({familyName: event.target.value});
  };

  handleStandaloneUnitChange = () => {
    this.setState({
      isCourse: !this.state.isCourse,
      familyName: null,
      versionYear: null,
    });
  };

  handleShowCalendarChange = () => {
    if (!this.state.showCalendar && !this.state.weeklyInstructionalMinutes) {
      this.setState({
        showCalendar: !this.state.showCalendar,
        weeklyInstructionalMinutes: '225',
      });
    } else {
      this.setState({showCalendar: !this.state.showCalendar});
    }
  };

  handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    this.setState({isSaving: true, lastSaved: null, error: null});

    if (this.state.showCalendar && !this.state.weeklyInstructionalMinutes) {
      this.setState({
        isSaving: false,
        error:
          'Please provide instructional minutes per week in Unit Calendar Settings.',
      });
      return;
    } else if (
      this.state.showCalendar &&
      (parseInt(this.state.weeklyInstructionalMinutes) <= 0 ||
        isNaN(parseInt(this.state.weeklyInstructionalMinutes)))
    ) {
      this.setState({
        isSaving: false,
        error:
          'Please provide a positive number of instructional minutes per week in Unit Calendar Settings.',
      });
      return;
    } else if (
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
      !this.props.hasCourse &&
      this.state.deeperLearningCourse === '' &&
      this.state.publishedState !== PublishedState.in_development &&
      (!this.state.isCourse ||
        this.state.versionYear === '' ||
        this.state.familyName === '')
    ) {
      this.setState({
        isSaving: false,
        error:
          'Standalone units that are not in development must be a standalone unit with family name and version year.',
      });
      return;
    } else if (
      this.state.isCourse &&
      ((this.state.versionYear !== '' && this.state.familyName === '') ||
        (this.state.versionYear === '' && this.state.familyName !== ''))
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

    if (
      this.state.unitPublishedState !== this.props.initialUnitPublishedState
    ) {
      const msg =
        'It looks like you are hiding this unit. ' +
        'Are you sure you want to hide this unit? ';
      if (!window.confirm(msg)) {
        this.setState({
          isSaving: false,
          error: 'Saving cancelled.',
        });
        return;
      }
    }

    if (
      this.state.unitPublishedState === PublishedState.in_development &&
      this.state.unitPublishedState === this.props.initialUnitPublishedState
    ) {
      const msg =
        'This unit is hidden within the course, meaning it is not ' +
        'visible on the Course Overview page, Section Dialog, or Teacher ' +
        'Dashboard. It is still visible to Levelbuilders. Would you ' +
        'like to continue with saving?';
      if (!window.confirm(msg)) {
        this.setState({
          isSaving: false,
          error: 'Saving cancelled.',
        });
        return;
      }
    }

    let dataToSave = {
      name: this.props.name,
      family_name: this.state.familyName,
      is_course: this.state.isCourse,
      show_calendar: this.state.showCalendar,
      weekly_instructional_minutes: parseInt(
        this.state.weeklyInstructionalMinutes
      ),
      description: this.state.description,
      student_description: this.state.studentDescription,
      announcements: JSON.stringify(this.state.announcements),
      published_state: this.props.hasCourse
        ? this.state.unitPublishedState
        : this.state.publishedState,
      instruction_type: this.state.instructionType,
      instructor_audience: this.state.instructorAudience,
      participant_audience: this.state.participantAudience,
      login_required: this.state.loginRequired,
      hideable_lessons: this.state.hideableLessons,
      student_detail_progress_view: this.state.studentDetailProgressView,
      professional_learning_course: this.state.deeperLearningCourse,
      only_instructor_review_required: this.state.onlyInstructorReviewRequired,
      peer_reviews_to_complete: this.state.peerReviewsRequired,
      wrapup_video: this.state.wrapupVideo,
      project_widget_visible: this.state.projectWidgetVisible,
      project_widget_types: this.state.projectWidgetTypes,
      lesson_extras_available: this.state.lessonExtrasAvailable,
      lesson_groups:
        this.props.isMigrated && JSON.stringify(this.props.lessonGroups),
      last_updated_at: this.state.lastUpdatedAt,
      has_verified_resources: this.state.hasVerifiedResources,
      curriculum_path: this.state.curriculumPath,
      pilot_experiment: this.state.pilotExperiment,
      editor_experiment: this.state.editorExperiment,
      supported_locales: this.state.supportedLocales,
      locales: this.state.locales,
      project_sharing: this.state.projectSharing,
      curriculum_umbrella: this.state.curriculumUmbrella,
      version_year: this.state.versionYear,
      tts: this.state.tts,
      title: this.state.title,
      description_audience: this.state.descriptionAudience,
      description_short: this.state.descriptionShort,
      resourceIds: this.props.teacherResources.map(resource => resource.id),
      studentResourceIds: this.props.studentResources.map(
        resource => resource.id
      ),
      is_migrated: this.props.isMigrated,
      include_student_lesson_plans: this.state.includeStudentLessonPlans,
      use_legacy_lesson_plans: this.state.useLegacyLessonPlans,
    };

    $.ajax({
      url: `/s/${this.props.id}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToSave),
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          navigateToHref(linkWithQueryParams(data.scriptPath));
        } else {
          const lessonGroups = mapLessonGroupDataForEditor(data.lesson_groups);

          this.props.init(lessonGroups);
          this.setState({
            lastSaved: Date.now(),
            isSaving: false,
            lastUpdatedAt: data.updated_at,
            savedFamilyName: data.family_name,
            savedVersionYear: data.version_year,
          });
        }
      })
      .fail(error => {
        if (error.status === 504) {
          this.setState({
            isSaving: false,
            error:
              'The save request timed out. Please refresh the page and verify your changes have been saved correctly.',
          });
          return;
        }
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  toggleHiddenCourseUnit = () => {
    const unitPublishedState =
      this.state.unitPublishedState === PublishedState.in_development
        ? null
        : PublishedState.in_development;
    this.setState({unitPublishedState});
  };

  render() {
    const allowMajorCurriculumChanges =
      this.props.initialUnitPublishedState === PublishedState.in_development ||
      this.props.initialPublishedState === PublishedState.in_development ||
      this.props.initialPublishedState === PublishedState.pilot;

    return (
      <div>
        <label>
          Title
          <input
            value={this.state.title}
            style={styles.input}
            onChange={e => this.setState({title: e.target.value})}
          />
        </label>
        <label>
          Unit URL (Slug)
          <input
            type="text"
            value={this.props.name}
            style={styles.input}
            disabled={true}
          />
        </label>
        <label>
          Audience
          <input
            value={this.state.descriptionAudience}
            style={styles.input}
            onChange={e => this.setState({descriptionAudience: e.target.value})}
          />
        </label>

        <CollapsibleEditorSection title="Overviews">
          <label>
            Short Overview
            <HelpTip>
              <p>
                This description is used when space is limited such as on the
                Teacher and Student homepage for the course cards.
              </p>
            </HelpTip>
            <input
              value={this.state.descriptionShort}
              style={styles.input}
              onChange={e => this.setState({descriptionShort: e.target.value})}
            />
          </label>
          <TextareaWithMarkdownPreview
            markdown={this.state.description}
            label={'Teacher Overview'}
            name={'description'}
            inputRows={5}
            handleMarkdownChange={e =>
              this.setState({description: e.target.value})
            }
            features={{
              imageUpload: true,
              resourceLink: true,
            }}
          />
          <TextareaWithMarkdownPreview
            markdown={this.state.studentDescription}
            label={'Student Overview'}
            name={'student_description'}
            inputRows={5}
            handleMarkdownChange={e =>
              this.setState({studentDescription: e.target.value})
            }
            features={{
              imageUpload: true,
              resourceLink: true,
            }}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Basic Settings">
          <label>
            Require Login To Use
            <input
              type="checkbox"
              checked={this.state.loginRequired}
              style={styles.checkbox}
              onChange={() =>
                this.setState({loginRequired: !this.state.loginRequired})
              }
            />
            <HelpTip>
              <p>Require users to log in before viewing this unit.</p>
            </HelpTip>
          </label>
          <label>
            Default Progress to Detail View
            <input
              type="checkbox"
              checked={this.state.studentDetailProgressView}
              style={styles.checkbox}
              onChange={() =>
                this.setState({
                  studentDetailProgressView:
                    !this.state.studentDetailProgressView,
                })
              }
            />
            <HelpTip>
              <p>
                By default students start in the summary view (only shows the
                levels). When this box is checked, we instead stick everyone
                into detail view (shows the levels broken into progression) to
                start for this unit.
              </p>
            </HelpTip>
          </label>
          <label>
            Display project sharing column in Teacher Dashboard
            <input
              type="checkbox"
              checked={this.state.projectSharing}
              style={styles.checkbox}
              onChange={() =>
                this.setState({projectSharing: !this.state.projectSharing})
              }
            />
            <HelpTip>
              <p>
                If checked, the "Sharing" column in the "Manage Students" tab of
                Teacher Dashboard will be displayed by default for sections
                assigned to this unit.
              </p>
            </HelpTip>
          </label>
          <label>
            Enable Text-to-Speech
            <input
              type="checkbox"
              checked={this.state.tts}
              style={styles.checkbox}
              onChange={e => {
                this.setState({ttsDialogOpen: true});
              }}
            />
            <HelpTip>
              <p>Check to enable text-to-speech for this unit.</p>
            </HelpTip>
          </label>
          {this.state.ttsDialogOpen && (
            <Dialog
              hideBackdrop={false}
              isOpen={this.state.ttsDialogOpen}
              title={this.state.tts ? 'Turn off TTS' : 'Turn on TTS'}
              cancelText="Cancel"
              confirmText={this.state.tts ? 'Disable TTS' : 'Generate TTS'}
              body={
                this.state.tts
                  ? 'Are you sure? All of the TTS files for this ' +
                    'course have already been generated. Any new edits will not be reflected ' +
                    'in the TTS files for this course.'
                  : 'Are you sure? This will generate text to speech files for all ' +
                    'levels in this script. It will also update the TTS files each time edits are ' +
                    'made to a level. We have to pay for each file generated. Please ' +
                    'confirm that levels are in a stable state before checking.'
              }
              handleClose={e => {
                this.setState({ttsDialogOpen: false});
              }}
              onCancel={e => {
                this.setState({ttsDialogOpen: false});
              }}
              onConfirm={e => {
                this.setState({ttsDialogOpen: false, tts: !this.state.tts});
              }}
            />
          )}
          {this.props.isLevelbuilder && (
            <label>
              Editor Experiment
              <HelpTip>
                <p>
                  If specified, users with this experiment on the levelbuilder
                  machine will be able to edit this unit.
                </p>
              </HelpTip>
              <input
                value={this.state.editorExperiment}
                style={styles.input}
                onChange={e =>
                  this.setState({editorExperiment: e.target.value})
                }
              />
            </label>
          )}
          <label>
            Wrap-up Video
            <HelpTip>
              <p>
                Deprecated setting only used for older courses. Please add
                videos in levels instead.
              </p>
            </HelpTip>
            <input
              value={this.state.wrapupVideo}
              style={styles.input}
              onChange={e => this.setState({wrapupVideo: e.target.value})}
            />
          </label>
        </CollapsibleEditorSection>
        <CollapsibleEditorSection title="Supported locales" collapsed={true}>
          <p>
            <span>
              {'Select additional locales supported by this unit. Click '}
            </span>
            <a
              style={{cursor: 'pointer'}}
              onClick={this.handleClearSupportedLocalesSelectClick}
            >
              none
            </a>
            <span>{' to clear the selection.'}</span>
          </p>
          <p>A list of other locales supported by this unit besides en-US.</p>
          <MultiCheckboxSelector
            noHeader={true}
            items={this.state.locales
              .filter(locale => !locale[1].startsWith('en'))
              .map(locale => locale[1])}
            selected={this.state.supportedLocales}
            onChange={this.handleChangeSupportedLocales}
          >
            <LocaleItemComponent />
          </MultiCheckboxSelector>
        </CollapsibleEditorSection>

        {this.props.hasCourse && (
          <CollapsibleEditorSection title="Course Type Settings">
            <p>
              Settings in this section change depending on whether this unit is
              grouped with other units in a course. If this does not look as
              expected, please add or remove this unit from a course.
            </p>
          </CollapsibleEditorSection>
        )}
        {!this.props.hasCourse && (
          <CourseTypeEditor
            instructorAudience={this.state.instructorAudience}
            participantAudience={this.state.participantAudience}
            instructionType={this.state.instructionType}
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
        )}

        <CollapsibleEditorSection title="Publishing Settings">
          {this.props.isLevelbuilder && (
            <div>
              <label>
                Code.org Initiative
                <select
                  style={styles.dropdown}
                  value={this.state.curriculumUmbrella}
                  onChange={e =>
                    this.setState({curriculumUmbrella: e.target.value})
                  }
                >
                  <option value="">(None)</option>
                  {Object.values(CurriculumUmbrella).map(curriculumUmbrella => (
                    <option key={curriculumUmbrella} value={curriculumUmbrella}>
                      {curriculumUmbrella}
                    </option>
                  ))}
                </select>
                <HelpTip>
                  <p>
                    Our RED(research, evaluation, and data) team uses the
                    setting of this field to determine which initiative to
                    connect this unit to in order to track progress of students
                    in our various work streams.
                  </p>
                  <p>
                    Until we finalizing moving onto using Course Type for
                    determining UI features of a course, if you select CSF,
                    CSF-specific elements will show in the progress tab of the
                    teacher dashboard. For example, the progress legend will
                    include a separate column for levels completed with too many
                    blocks and there will be information about CSTA Standards.
                  </p>
                </HelpTip>
              </label>
              {this.props.hasCourse &&
                this.state.publishedState !== PublishedState.in_development && (
                  <div>
                    <p>
                      Settings in this section change depending on whether this
                      unit is grouped with other units in a course. If this does
                      not look as expected, please add or remove this unit from
                      a course.
                    </p>
                    {/*
                   Just use a checkbox instead of a dropdown to set the
                   published state for now, because (1) units in unit groups
                   really only need 2 of the 6 possible states at the moment,
                   but (2) we haven't nailed down how many of these states we
                   will need in the long term, and (3) we need these 2 states
                   working now in order to launch the AP CSA pilot. The work to
                   clean this up is tracked in:
                   https://codedotorg.atlassian.net/browse/PLAT-1170
                   */}
                    <label>
                      Hide this unit within this course
                      <input
                        className="unit-test-hide-unit-in-course"
                        type="checkbox"
                        checked={
                          this.state.unitPublishedState ===
                          PublishedState.in_development
                        }
                        style={styles.checkbox}
                        onChange={this.toggleHiddenCourseUnit}
                      />
                      <HelpTip>
                        <p>
                          Whether to hide this unit from the list of units in
                          its course, as viewed on the course overview page, the
                          edit section dialog, and the teacher dashboard, as
                          well as when navigating directly to the unit by its
                          url. Hidden units will still be visible to
                          levelbuilders.
                        </p>
                      </HelpTip>
                    </label>
                  </div>
                )}
              {!this.props.hasCourse && (
                <div data-testid="course-version-publishing-editor">
                  <CourseVersionPublishingEditor
                    pilotExperiment={this.state.pilotExperiment}
                    versionYear={this.state.versionYear}
                    familyName={this.state.familyName}
                    updatePilotExperiment={pilotExperiment =>
                      this.setState({pilotExperiment})
                    }
                    updateFamilyName={familyName => this.setState({familyName})}
                    updateVersionYear={versionYear =>
                      this.setState({versionYear})
                    }
                    families={this.props.unitFamilies}
                    versionYearOptions={this.props.versionYearOptions}
                    isCourse={this.state.isCourse}
                    updateIsCourse={this.handleStandaloneUnitChange}
                    showIsCourseSelector
                    initialPublishedState={this.props.initialPublishedState}
                    publishedState={this.state.publishedState}
                    updatePublishedState={publishedState =>
                      this.setState({publishedState})
                    }
                    preventCourseVersionChange={
                      this.state.savedVersionYear !== '' ||
                      this.state.savedFamilyName !== ''
                    }
                    courseOfferingEditorLink={
                      this.props.courseOfferingEditorLink
                    }
                  />
                </div>
              )}
            </div>
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Announcements">
          <AnnouncementsEditor
            announcements={this.state.announcements}
            inputStyle={styles.input}
            updateAnnouncements={this.handleUpdateAnnouncements}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Lesson Settings">
          {this.props.isMigrated && this.props.initialUseLegacyLessonPlans && (
            <label>
              <Button
                text={'Use Code Studio Lesson Plans'}
                size={Button.ButtonSize.narrow}
                color={Button.ButtonColor.white}
                style={{margin: 0, height: 30, lineHeight: '8px'}}
                onClick={e => {
                  e.preventDefault();
                  const msg =
                    'Are you sure? This action cannot be undone. Please ' +
                    'confirm that translations are complete before proceeding.';
                  if (window.confirm(msg)) {
                    this.setState({useLegacyLessonPlans: false});
                  }
                }}
                disabled={!this.state.useLegacyLessonPlans}
              />
              <HelpTip>
                <p>
                  This unit contains lesson plans which have been imported from
                  curriculum.code.org to studio.code.org, however we are still
                  pointing our users to lesson plans on curriculum.code.org.
                  Once you have reviewed the new content, click this button to
                  start using the lesson plans on studio.code.org, for all
                  lessons in this unit.
                </p>
              </HelpTip>
            </label>
          )}
          {(!this.props.isMigrated || this.state.useLegacyLessonPlans) && (
            <label>
              Legacy Lesson Plan Path
              <HelpTip>
                <p>
                  This field determines the location of the legacy lesson plan.
                  If left blank, it will look for special file under
                  code.org/curriculum/[unit]/[lesson] which redirects to
                  curriculum.code.org or google docs. If you want to disable
                  lesson plans entirely, you must go to each lesson edit page
                  and uncheck "Has Lesson Plan".
                </p>
              </HelpTip>
              <input
                value={this.state.curriculumPath}
                style={styles.input}
                onChange={e => this.setState({curriculumPath: e.target.value})}
              />
            </label>
          )}
          <label>
            Allow Teachers to Hide Lessons
            <input
              type="checkbox"
              checked={this.state.hideableLessons}
              style={styles.checkbox}
              onChange={() =>
                this.setState({hideableLessons: !this.state.hideableLessons})
              }
            />
            <HelpTip>
              <p>
                Allow teachers to toggle whether or not specific lessons in this
                unit are visible to students in their section.
              </p>
            </HelpTip>
          </label>
          <LessonExtrasEditor
            lessonExtrasAvailable={this.state.lessonExtrasAvailable}
            projectWidgetTypes={this.state.projectWidgetTypes}
            projectWidgetVisible={this.state.projectWidgetVisible}
            updateLessonExtrasAvailable={() =>
              this.setState({
                lessonExtrasAvailable: !this.state.lessonExtrasAvailable,
              })
            }
            updateProjectWidgetVisible={() =>
              this.setState({
                projectWidgetVisible: !this.state.projectWidgetVisible,
              })
            }
            updateProjectWidgetTypes={projectWidgetTypes =>
              this.setState({projectWidgetTypes})
            }
          />
          {this.props.isMigrated && !this.state.useLegacyLessonPlans && (
            <label>
              Include student-facing lesson plans
              <input
                className="student-facing-lesson-plan-checkbox"
                type="checkbox"
                checked={this.state.includeStudentLessonPlans}
                style={styles.checkbox}
                onChange={() =>
                  this.setState({
                    includeStudentLessonPlans:
                      !this.state.includeStudentLessonPlans,
                  })
                }
                disabled={!allowMajorCurriculumChanges}
              />
              <HelpTip>
                <p>
                  Checking this will automatically generate student-facing
                  lesson plans for any lesson that is marked as “Has Lesson
                  Plan”
                </p>
              </HelpTip>
            </label>
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Resources Dropdowns">
          <label>
            Has Resources for Verified Instructors
            <input
              type="checkbox"
              checked={this.state.hasVerifiedResources}
              style={styles.checkbox}
              onChange={() =>
                this.setState({
                  hasVerifiedResources: !this.state.hasVerifiedResources,
                })
              }
            />
            <HelpTip>
              <p>
                Check if this unit has resources for verified instructors, and
                we want to notify non-verified instructors that this is the
                case.
              </p>
            </HelpTip>
          </label>
          Select the resources you'd like to have show up in the dropdown at the
          top of the unit overview page:
          <div>
            <h4>Teacher Resources</h4>
            <div>
              <div />
              <ResourcesEditor
                inputStyle={styles.input}
                courseVersionId={this.props.initialCourseVersionId}
                resources={this.props.teacherResources}
                getRollupsUrl={`/s/${this.props.name}/get_rollup_resources`}
              />
            </div>
            {this.props.isMigrated && (
              <div>
                <h4>Student Resources</h4>
                <div>
                  Select the Student Resources buttons you'd like to have show
                  up on the top of the unit overview page
                </div>
                <ResourcesEditor
                  inputStyle={styles.input}
                  courseVersionId={this.props.initialCourseVersionId}
                  resources={this.props.studentResources}
                  studentFacing
                />
              </div>
            )}
          </div>
        </CollapsibleEditorSection>
        {this.props.isMigrated && !this.state.useLegacyLessonPlans && (
          <CollapsibleEditorSection title="Unit Calendar Settings">
            <label>
              Show Calendar
              <input
                type="checkbox"
                checked={this.state.showCalendar}
                style={styles.checkbox}
                onChange={this.handleShowCalendarChange}
              />
              <HelpTip>
                <p>
                  Check to enable the calendar view on the Unit Overview Page.
                  The calendar displays each lesson and generally how long it
                  will take as well how many weeks the unit is expected to take
                  in general. (Actual calendar UI coming soon!)
                </p>
              </HelpTip>
            </label>
            <label>
              Instructional Minutes Per Week
              <HelpTip>
                <p>
                  Number of instructional minutes to allocate to each week in
                  the calendar. Lessons will be divided across the days/weeks in
                  the calendar based on their length of time.
                </p>
              </HelpTip>
              <input
                value={this.state.weeklyInstructionalMinutes}
                style={styles.input}
                disabled={!this.state.showCalendar}
                onChange={e =>
                  this.setState({
                    weeklyInstructionalMinutes: e.target.value,
                  })
                }
              />
            </label>
          </CollapsibleEditorSection>
        )}

        {this.props.isLevelbuilder && (
          <CollapsibleEditorSection
            title="Deeper Learning Settings"
            collapsed={true}
          >
            <b>
              <i>
                These settings are only used for deeper learning courses which
                use the peer review system which is not part of the normal
                course model. All other courses should be built in the normal
                course model.
              </i>
            </b>
            <label>
              Deeper Learning Course Name
              <HelpTip>
                <p>
                  When filled out, the course unit associated with this unit
                  will be associated with the course named in this box. If the
                  course unit does not exist, and if the course does not exist
                  it will be created.
                </p>
              </HelpTip>
              <input
                value={this.state.deeperLearningCourse}
                style={styles.input}
                onChange={e =>
                  this.setState({deeperLearningCourse: e.target.value})
                }
              />
            </label>
            <h4>Peer Reviews</h4>
            <label>
              Only Require Review from Instructor (no Peer Reviews)
              <input
                id="only_instructor_review_checkbox"
                type="checkbox"
                checked={this.state.onlyInstructorReviewRequired}
                style={styles.checkbox}
                onChange={() =>
                  this.setState({
                    onlyInstructorReviewRequired:
                      !this.state.onlyInstructorReviewRequired,
                    peerReviewsRequired: 0,
                  })
                }
              />
              <HelpTip>
                <p>
                  Our Professional Learning Courses solicit self-reflections
                  from participants, which are then typically shown to other
                  participants enrolled in the course for feedback. This is
                  known as "peer review". The instructor of the course also sees
                  these self-reflections and can provide feedback as well.
                  <br />
                  <br />
                  This setting allows you to collect those same reflections from
                  from workshop participants and have the workshop instructor
                  review them <strong>without</strong> soliciting peer reviews
                  of those reflections by other participants in the workshop.
                </p>
              </HelpTip>
            </label>
            <label>
              Number of Peer Reviews to Complete
              <HelpTip>
                <p>
                  Currently only supported for professional learning courses
                </p>
              </HelpTip>
              <input
                id={'number_peer_reviews_input'}
                value={this.state.peerReviewsRequired}
                style={styles.input}
                onChange={e =>
                  this.setState({peerReviewsRequired: e.target.value})
                }
                disabled={this.state.onlyInstructorReviewRequired}
              />
            </label>
          </CollapsibleEditorSection>
        )}

        <CollapsibleEditorSection title="Lesson Groups and Lessons">
          <UnitCard allowMajorCurriculumChanges={allowMajorCurriculumChanges} />
        </CollapsibleEditorSection>
        <SaveBar
          handleSave={this.handleSave}
          error={this.state.error}
          isSaving={this.state.isSaving}
          lastSaved={this.state.lastSaved}
          pathForShowButton={this.props.scriptPath}
        />
      </div>
    );
  }
}

const LocaleItemComponent = function ({item}) {
  return <strong>{item}</strong>;
};

LocaleItemComponent.propTypes = {item: PropTypes.string};

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

export const UnconnectedUnitEditor = UnitEditor;

export default connect(
  state => ({
    lessonGroups: state.lessonGroups,
    teacherResources: state.resources,
    studentResources: state.studentResources,
  }),
  {
    init,
  }
)(UnitEditor);
