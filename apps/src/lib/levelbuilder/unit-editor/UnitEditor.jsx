import PropTypes from 'prop-types';
import React from 'react';
import UnitCard from '@cdo/apps/lib/levelbuilder/unit-editor/UnitCard';
import LessonDescriptions from '@cdo/apps/lib/levelbuilder/unit-editor/LessonDescriptions';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import LessonExtrasEditor from '@cdo/apps/lib/levelbuilder/unit-editor/LessonExtrasEditor';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import ResourceType, {
  resourceShape
} from '@cdo/apps/templates/courseOverview/resourceType';
import $ from 'jquery';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';
import {connect} from 'react-redux';
import {
  getSerializedLessonGroups,
  init,
  mapLessonGroupDataForEditor
} from '@cdo/apps/lib/levelbuilder/unit-editor/unitEditorRedux';
import {
  lessonGroupShape,
  resourceShape as migratedResourceShape
} from '@cdo/apps/lib/levelbuilder/shapes';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import CourseVersionPublishingEditor from '@cdo/apps/lib/levelbuilder/CourseVersionPublishingEditor';
import {PublishedState} from '@cdo/apps/util/sharedConstants';

const VIDEO_KEY_REGEX = /video_key_for_next_level/g;

const CURRICULUM_UMBRELLAS = ['CSF', 'CSD', 'CSP', 'CSA', ''];

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
    initialTeacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    initialLessonExtrasAvailable: PropTypes.bool,
    initialLessonLevelData: PropTypes.string,
    initialHasVerifiedResources: PropTypes.bool,
    initialCurriculumPath: PropTypes.string,
    initialPilotExperiment: PropTypes.string,
    initialEditorExperiment: PropTypes.string,
    initialAnnouncements: PropTypes.arrayOf(announcementShape).isRequired,
    initialSupportedLocales: PropTypes.arrayOf(PropTypes.string),
    initialLocales: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
    initialProjectSharing: PropTypes.bool,
    initialCurriculumUmbrella: PropTypes.oneOf(CURRICULUM_UMBRELLAS),
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
    scriptPath: PropTypes.string.isRequired,

    // from redux
    lessonGroups: PropTypes.arrayOf(lessonGroupShape).isRequired,
    levelKeyList: PropTypes.object.isRequired,
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape)
      .isRequired,
    studentResources: PropTypes.arrayOf(migratedResourceShape).isRequired,
    init: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    const teacherResources = [...props.initialTeacherResources];

    if (!props.isMigrated) {
      // add empty entries to get to max
      while (teacherResources.length < Object.keys(ResourceType).length) {
        teacherResources.push({type: '', link: ''});
      }
    }

    this.state = {
      isSaving: false,
      error: null,
      lastSaved: null,
      familyName: this.props.initialFamilyName,
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
      professionalLearningCourse: this.props.initialProfessionalLearningCourse,
      onlyInstructorReviewRequired: this.props
        .initialOnlyInstructorReviewRequired,
      peerReviewsRequired: this.props.initialPeerReviewsRequired,
      wrapupVideo: this.props.initialWrapupVideo,
      projectWidgetVisible: this.props.initialProjectWidgetVisible,
      projectWidgetTypes: this.props.initialProjectWidgetTypes,
      lessonExtrasAvailable: this.props.initialLessonExtrasAvailable,
      lessonLevelData:
        this.props.initialLessonLevelData ||
        "lesson_group 'lesson group', display_name: 'lesson group display name'\nlesson 'new lesson', display_name: 'lesson display name', has_lesson_plan: true\n",
      hasVerifiedResources: this.props.initialHasVerifiedResources,
      curriculumPath: this.props.initialCurriculumPath,
      pilotExperiment: this.props.initialPilotExperiment,
      editorExperiment: this.props.initialEditorExperiment,
      supportedLocales: this.props.initialSupportedLocales,
      locales: this.props.initialLocales,
      projectSharing: this.props.initialProjectSharing,
      curriculumUmbrella: this.props.initialCurriculumUmbrella,
      versionYear: this.props.initialVersionYear,
      tts: this.props.initialTts,
      title: this.props.i18nData.title || '',
      descriptionAudience: this.props.i18nData.descriptionAudience || '',
      descriptionShort: this.props.i18nData.descriptionShort || '',
      lessonDescriptions: this.props.i18nData.lessonDescriptions,
      teacherResources: teacherResources,
      hasImportedLessonDescriptions: false,
      oldScriptText: this.props.initialLessonLevelData,
      includeStudentLessonPlans: this.props.initialIncludeStudentLessonPlans,
      deprecated: this.props.initialDeprecated,
      publishedState: this.props.initialPublishedState
    };
  }

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleClearSupportedLocalesSelectClick = () => {
    this.setState({supportedLocales: []});
  };

  handleChangeSupportedLocales = e => {
    var options = e.target.options;
    var supportedLocales = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        supportedLocales.push(options[i].value);
      }
    }
    this.setState({supportedLocales});
  };

  handleFamilyNameChange = event => {
    this.setState({familyName: event.target.value});
  };

  handleStandaloneUnitChange = () => {
    this.setState({isCourse: !this.state.isCourse});
  };

  handleShowCalendarChange = () => {
    if (!this.state.showCalendar && !this.state.weeklyInstructionalMinutes) {
      this.setState({
        showCalendar: !this.state.showCalendar,
        weeklyInstructionalMinutes: '225'
      });
    } else {
      this.setState({showCalendar: !this.state.showCalendar});
    }
  };

  handleView = () => {
    navigateToHref(linkWithQueryParams(this.props.scriptPath));
  };

  handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    this.setState({isSaving: true, lastSaved: null, error: null});

    const videoKeysBefore = (
      this.props.initialLessonLevelData.match(VIDEO_KEY_REGEX) || []
    ).length;
    const unitText = this.props.isMigrated ? '' : this.state.lessonLevelData;
    const videoKeysAfter = (unitText.match(VIDEO_KEY_REGEX) || []).length;
    if (videoKeysBefore !== videoKeysAfter) {
      if (
        !confirm(
          'WARNING: adding or removing video keys will also affect ' +
            'uses of this level in other units. Are you sure you want to ' +
            'continue?'
        )
      ) {
        shouldCloseAfterSave = false;
      }
    }
    // HACK: until the unit edit page no longer overwrites changes to the
    // arrangement of levels within lessons, give the user a warning
    if (
      window.lessonEditorOpened &&
      !confirm(
        'WARNING: It looks like you opened a lesson edit page from this unit edit page. ' +
          'If you made any changes on the lesson edit page which you do not ' +
          'wish to lose, please click cancel now and reload this page before ' +
          'saving any changes to this unit edit page.'
      )
    ) {
      shouldCloseAfterSave = false;
    }

    if (this.state.showCalendar && !this.state.weeklyInstructionalMinutes) {
      this.setState({
        isSaving: false,
        error:
          'Please provide instructional minutes per week in Unit Calendar Settings.'
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
          'Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
      });
      return;
    } else if (
      this.state.publishedState === PublishedState.pilot &&
      this.state.pilotExperiment === ''
    ) {
      this.setState({
        isSaving: false,
        error:
          'Please provide a pilot experiment in order to save with published state as pilot.'
      });
      return;
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
      published_state: this.state.publishedState,
      deprecated: this.state.deprecated,
      login_required: this.state.loginRequired,
      hideable_lessons: this.state.hideableLessons,
      student_detail_progress_view: this.state.studentDetailProgressView,
      professional_learning_course: this.state.professionalLearningCourse,
      only_instructor_review_required: this.state.onlyInstructorReviewRequired,
      peer_reviews_to_complete: this.state.peerReviewsRequired,
      wrapup_video: this.state.wrapupVideo,
      project_widget_visible: this.state.projectWidgetVisible,
      project_widget_types: this.state.projectWidgetTypes,
      lesson_extras_available: this.state.lessonExtrasAvailable,
      script_text: this.props.isMigrated
        ? getSerializedLessonGroups(
            this.props.lessonGroups,
            this.props.levelKeyList
          )
        : this.state.lessonLevelData,
      old_script_text: this.state.oldScriptText,
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
      resourceLinks: this.state.teacherResources.map(resource => resource.link),
      resourceTypes: this.state.teacherResources.map(resource => resource.type),
      resourceIds: this.props.migratedTeacherResources.map(
        resource => resource.id
      ),
      studentResourceIds: this.props.studentResources.map(
        resource => resource.id
      ),
      is_migrated: this.props.isMigrated,
      include_student_lesson_plans: this.state.includeStudentLessonPlans
    };

    if (this.state.hasImportedLessonDescriptions) {
      dataToSave.stage_descriptions = this.state.lessonDescriptions;
    }

    $.ajax({
      url: `/s/${this.props.id}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToSave)
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          navigateToHref(linkWithQueryParams(data.scriptPath));
        } else {
          const lessonGroups = mapLessonGroupDataForEditor(data.lesson_groups);

          this.props.init(lessonGroups, this.props.levelKeyList);
          this.setState({
            lastSaved: Date.now(),
            isSaving: false,
            oldScriptText: data.lessonLevelData
          });
        }
      })
      .fail(error => {
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  render() {
    const textAreaRows = this.state.lessonLevelData
      ? this.state.lessonLevelData.split('\n').length + 5
      : 10;
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
              resourceLink: true
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
              resourceLink: true
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
                  studentDetailProgressView: !this.state
                    .studentDetailProgressView
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
              onChange={() => this.setState({tts: !this.state.tts})}
            />
            <HelpTip>
              <p>Check to enable text-to-speech for this unit.</p>
            </HelpTip>
          </label>
          <label>
            Supported locales
            <HelpTip>
              <p>
                A list of other locales supported by this unit besides en-US.
              </p>
            </HelpTip>
            <p>
              <span>
                {'Select additional locales supported by this unit. Select '}
              </span>
              <a onClick={this.handleClearSupportedLocalesSelectClick}>none</a>
              <span>{' or shift-click or cmd-click to select multiple.'}</span>
            </p>
            <select
              multiple
              value={this.state.supportedLocales}
              onChange={this.handleChangeSupportedLocales}
            >
              {this.state.locales
                .filter(locale => !locale[1].startsWith('en'))
                .map(locale => (
                  <option key={locale[1]} value={locale[1]}>
                    {locale[1]}
                  </option>
                ))}
            </select>
          </label>
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

        <CollapsibleEditorSection title="Announcements">
          <AnnouncementsEditor
            announcements={this.state.announcements}
            inputStyle={styles.input}
            updateAnnouncements={this.handleUpdateAnnouncements}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Publishing Settings">
          {this.props.isLevelbuilder && (
            <div>
              <label>
                Core Course
                <select
                  style={styles.dropdown}
                  value={this.state.curriculumUmbrella}
                  onChange={e =>
                    this.setState({curriculumUmbrella: e.target.value})
                  }
                >
                  <option value="">(None)</option>
                  {CURRICULUM_UMBRELLAS.map(curriculumUmbrella => (
                    <option key={curriculumUmbrella} value={curriculumUmbrella}>
                      {curriculumUmbrella}
                    </option>
                  ))}
                </select>
                <HelpTip>
                  <p>
                    By selecting, this unit will have a property,
                    curriculum_umbrella, specific to that course regardless of
                    version.
                  </p>
                  <p>
                    If you select CSF, CSF-specific elements will show in the
                    progress tab of the teacher dashboard. For example, the
                    progress legend will include a separate column for levels
                    completed with too many blocks and there will be information
                    about CSTA Standards.
                  </p>
                </HelpTip>
              </label>
              {this.props.hasCourse && (
                <p>
                  This unit is part of a course. Go to the course edit page to
                  publish the course and its units.
                </p>
              )}
              {!this.props.hasCourse && (
                <div>
                  <label>
                    Is a Standalone Unit
                    <input
                      className="isCourseCheckbox"
                      type="checkbox"
                      checked={this.state.isCourse}
                      disabled={!this.state.familyName}
                      style={styles.checkbox}
                      onChange={this.handleStandaloneUnitChange}
                    />
                    {this.state.familyName && (
                      <HelpTip>
                        <p>
                          If checked, indicates that this Unit represents a
                          standalone unit. Examples of such Units include
                          CourseA-F, Express, and Pre-Express.
                        </p>
                      </HelpTip>
                    )}
                    {!this.state.familyName && (
                      <HelpTip>
                        <p>
                          You must select a family name in order to mark
                          something as a standalone unit.
                        </p>
                      </HelpTip>
                    )}
                  </label>
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
                    publishedState={this.state.publishedState}
                    updatePublishedState={publishedState =>
                      this.setState({publishedState})
                    }
                  />
                </div>
              )}
            </div>
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Lesson Settings">
          {!this.props.isMigrated && (
            <label>
              Curriculum Path
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
                lessonExtrasAvailable: !this.state.lessonExtrasAvailable
              })
            }
            updateProjectWidgetVisible={() =>
              this.setState({
                projectWidgetVisible: !this.state.projectWidgetVisible
              })
            }
            updateProjectWidgetTypes={projectWidgetTypes =>
              this.setState({projectWidgetTypes})
            }
          />
          {!this.props.isMigrated && (
            <LessonDescriptions
              scriptName={this.props.name}
              currentDescriptions={this.props.i18nData.lessonDescriptions}
              updateLessonDescriptions={(
                lessonDescriptions,
                hasImportedLessonDescriptions
              ) =>
                this.setState({
                  lessonDescriptions,
                  hasImportedLessonDescriptions
                })
              }
            />
          )}
          {this.props.isMigrated && (
            <label>
              Include student-facing lesson plans
              <input
                type="checkbox"
                checked={this.state.includeStudentLessonPlans}
                style={styles.checkbox}
                onChange={() =>
                  this.setState({
                    includeStudentLessonPlans: !this.state
                      .includeStudentLessonPlans
                  })
                }
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
            Has Resources for Verified Teachers
            <input
              type="checkbox"
              checked={this.state.hasVerifiedResources}
              style={styles.checkbox}
              onChange={() =>
                this.setState({
                  hasVerifiedResources: !this.state.hasVerifiedResources
                })
              }
            />
            <HelpTip>
              <p>
                Check if this unit has resources for verified teachers, and we
                want to notify non-verified teachers that this is the case.
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
                resources={this.state.teacherResources}
                updateResources={teacherResources =>
                  this.setState({teacherResources})
                }
                useMigratedResources={this.props.isMigrated}
                courseVersionId={this.props.initialCourseVersionId}
                migratedResources={this.props.migratedTeacherResources}
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
                  useMigratedResources
                  courseVersionId={this.props.initialCourseVersionId}
                  migratedResources={this.props.studentResources}
                  studentFacing
                />
              </div>
            )}
          </div>
        </CollapsibleEditorSection>
        {this.props.isMigrated && (
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
                    weeklyInstructionalMinutes: e.target.value
                  })
                }
              />
            </label>
          </CollapsibleEditorSection>
        )}

        {this.props.isLevelbuilder && (
          <CollapsibleEditorSection title="Professional Learning Settings">
            <label>
              Deprecated
              <input
                type="checkbox"
                checked={this.state.deprecated}
                style={styles.checkbox}
                onChange={() =>
                  this.setState({deprecated: !this.state.deprecated})
                }
              />
              <HelpTip>
                <p>
                  Used only for Professional Learning Courses. Deprecation
                  prevents Peer Reviews conducted as part of this unit from
                  being displayed in the admin-only Peer Review Dashboard.
                </p>
              </HelpTip>
            </label>
            <label>
              Professional Learning Course
              <HelpTip>
                <p>
                  When filled out, the course unit associated with this unit
                  will be associated with the course named in this box. If the
                  course unit does not exist, and if the course does not exist
                  it will be created.
                </p>
              </HelpTip>
              <input
                value={this.state.professionalLearningCourse}
                style={styles.input}
                onChange={e =>
                  this.setState({professionalLearningCourse: e.target.value})
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
                    onlyInstructorReviewRequired: !this.state
                      .onlyInstructorReviewRequired,
                    peerReviewsRequired: 0
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
          {this.props.isMigrated ? (
            <UnitCard />
          ) : (
            <div>
              <textarea
                id="script_text"
                rows={textAreaRows}
                style={styles.input}
                value={this.state.lessonLevelData}
                onChange={e => this.setState({lessonLevelData: e.target.value})}
              />
            </div>
          )}
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
    borderRadius: 4,
    margin: 0
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

export const UnconnectedUnitEditor = UnitEditor;

export default connect(
  state => ({
    lessonGroups: state.lessonGroups,
    levelKeyList: state.levelKeyList,
    migratedTeacherResources: state.resources,
    studentResources: state.studentResources
  }),
  {
    init
  }
)(UnitEditor);
