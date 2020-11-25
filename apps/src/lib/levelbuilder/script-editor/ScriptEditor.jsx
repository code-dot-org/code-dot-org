import PropTypes from 'prop-types';
import React from 'react';
import UnitCard from '@cdo/apps/lib/levelbuilder/script-editor/UnitCard';
import LessonDescriptions from '@cdo/apps/lib/levelbuilder/script-editor/LessonDescriptions';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import VisibleAndPilotExperiment from '@cdo/apps/lib/levelbuilder/script-editor/VisibleAndPilotExperiment';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import LessonExtrasEditor from '@cdo/apps/lib/levelbuilder/script-editor/LessonExtrasEditor';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import ResourceType, {
  resourceShape
} from '@cdo/apps/templates/courseOverview/resourceType';
import $ from 'jquery';
import {navigateToHref} from '@cdo/apps/utils';
import {connect} from 'react-redux';
import {
  getSerializedLessonGroups,
  init,
  mapLessonGroupDataForEditor
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import {lessonGroupShape} from '@cdo/apps/lib/levelbuilder/shapes';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';

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

const VIDEO_KEY_REGEX = /video_key_for_next_level/g;

const CURRICULUM_UMBRELLAS = ['CSF', 'CSD', 'CSP', ''];

/**
 * Component for editing course scripts.
 */
class ScriptEditor extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    beta: PropTypes.bool,
    betaWarning: PropTypes.string,
    name: PropTypes.string.isRequired,
    i18nData: PropTypes.object.isRequired,
    initialHidden: PropTypes.bool,
    initialIsStable: PropTypes.bool,
    initialLoginRequired: PropTypes.bool,
    initialHideableLessons: PropTypes.bool,
    initialStudentDetailProgressView: PropTypes.bool,
    initialProfessionalLearningCourse: PropTypes.string,
    initialPeerReviewsRequired: PropTypes.number,
    initialWrapupVideo: PropTypes.string,
    initialProjectWidgetVisible: PropTypes.bool,
    initialProjectWidgetTypes: PropTypes.arrayOf(PropTypes.string),
    initialTeacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    initialLessonExtrasAvailable: PropTypes.bool,
    initialLessonLevelData: PropTypes.string,
    initialHasVerifiedResources: PropTypes.bool,
    initialHasLessonPlan: PropTypes.bool,
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
    scriptFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isLevelbuilder: PropTypes.bool,
    initialTts: PropTypes.bool,
    hasCourse: PropTypes.bool,
    initialIsCourse: PropTypes.bool,

    // from redux
    lessonGroups: PropTypes.arrayOf(lessonGroupShape).isRequired,
    levelKeyList: PropTypes.object.isRequired,
    init: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    const resources = [...props.initialTeacherResources];
    // add empty entries to get to max
    while (resources.length < Object.keys(ResourceType).length) {
      resources.push({type: '', link: ''});
    }

    this.state = {
      isSaving: false,
      error: null,
      lastSaved: null,
      familyName: this.props.initialFamilyName,
      isCourse: this.props.initialIsCourse,
      description: this.props.i18nData.description,
      announcements: this.props.initialAnnouncements,
      hidden: this.props.initialHidden,
      isStable: this.props.initialIsStable,
      loginRequired: this.props.initialLoginRequired,
      hideableLessons: this.props.initialHideableLessons,
      studentDetailProgressView: this.props.initialStudentDetailProgressView,
      professionalLearningCourse: this.props.initialProfessionalLearningCourse,
      peerReviewsRequired: this.props.initialPeerReviewsRequired,
      wrapupVideo: this.props.initialWrapupVideo,
      projectWidgetVisible: this.props.initialProjectWidgetVisible,
      projectWidgetTypes: this.props.initialProjectWidgetTypes,
      lessonExtrasAvailable: this.props.initialLessonExtrasAvailable,
      lessonLevelData: this.props.initialLessonLevelData,
      hasVerifiedResources: this.props.initialHasVerifiedResources,
      hasLessonPlan: this.props.initialHasLessonPlan,
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
      lessonDescriptions: this.props.i18nData.stageDescriptions,
      teacherResources: resources,
      hasImportedLessonDescriptions: false
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

  handleStandaloneCourseChange = () => {
    this.setState({isCourse: !this.state.isCourse});
  };

  handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    this.setState({isSaving: true, lastSaved: null, error: null});

    const videoKeysBefore = (
      this.props.initialLessonLevelData.match(VIDEO_KEY_REGEX) || []
    ).length;
    const scriptText = this.props.beta ? '' : this.state.lessonLevelData;
    const videoKeysAfter = (scriptText.match(VIDEO_KEY_REGEX) || []).length;
    if (videoKeysBefore !== videoKeysAfter) {
      if (
        !confirm(
          'WARNING: adding or removing video keys will also affect ' +
            'uses of this level in other scripts. Are you sure you want to ' +
            'continue?'
        )
      ) {
        shouldCloseAfterSave = false;
      }
    }
    // HACK: until the script edit page no longer overwrites changes to the
    // arrangement of levels within lessons, give the user a warning
    if (
      window.lessonEditorOpened &&
      !confirm(
        'WARNING: It looks like you opened a lesson edit page from this script edit page. ' +
          'If you made any changes on the lesson edit page which you do not ' +
          'wish to lose, please click cancel now and reload this page before ' +
          'saving any changes to this script edit page.'
      )
    ) {
      shouldCloseAfterSave = false;
    }

    let dataToSave = {
      name: this.props.name,
      family_name: this.state.familyName,
      is_course: this.state.isCourse,
      description: this.state.description,
      announcements: JSON.stringify(this.state.announcements),
      visible_to_teachers: !this.state.hidden,
      is_stable: this.state.isStable,
      login_required: this.state.loginRequired,
      hideable_lessons: this.state.hideableLessons,
      student_detail_progress_view: this.state.studentDetailProgressView,
      professional_learning_course: this.state.professionalLearningCourse,
      peer_reviews_to_complete: this.state.peerReviewsRequired,
      wrapup_video: this.state.wrapupVideo,
      project_widget_visible: this.state.projectWidgetVisible,
      project_widget_types: this.state.projectWidgetTypes,
      lesson_extras_available: this.state.lessonExtrasAvailable,
      script_text: this.props.beta
        ? getSerializedLessonGroups(
            this.props.lessonGroups,
            this.props.levelKeyList
          )
        : this.state.lessonLevelData,
      has_verified_resources: this.state.hasVerifiedResources,
      has_lesson_plan: this.state.hasLessonPlan,
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
      resourceTypes: this.state.teacherResources.map(resource => resource.type)
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
          navigateToHref(`${data.scriptPath}${window.location.search}`);
        } else {
          const lessonGroups = mapLessonGroupDataForEditor(data.lesson_groups);

          this.props.init(lessonGroups, this.props.levelKeyList);
          this.setState({lastSaved: data.updatedAt, isSaving: false});
        }
      })
      .fail(error => {
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  render() {
    const {betaWarning} = this.props;
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
        <label>
          Short Description
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
          label={'Description'}
          name={'description'}
          inputRows={5}
          handleMarkdownChange={e =>
            this.setState({description: e.target.value})
          }
        />

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
              <p>Require users to log in before viewing this script.</p>
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
                start for this script.
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
                assigned to this script.
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
              <p>Check to enable text-to-speech for this script.</p>
            </HelpTip>
          </label>
          <label>
            Supported locales
            <p>
              <span>
                {'Select additional locales supported by this script. Select '}
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
                  machine will be able to edit this script.
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
                    By selecting, this script will have a property,
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
              <label>
                Family Name
                <select
                  className="familyNameSelector"
                  value={this.state.familyName}
                  style={styles.dropdown}
                  disabled={this.props.hasCourse}
                  onChange={this.handleFamilyNameChange}
                >
                  {!this.state.isCourse && <option value="">(None)</option>}
                  {this.props.scriptFamilies.map(familyOption => (
                    <option key={familyOption} value={familyOption}>
                      {familyOption}
                    </option>
                  ))}
                </select>
                {this.props.hasCourse && (
                  <HelpTip>
                    <p>
                      This field cannot be edited because this script belongs to
                      a course, and redirecting to the latest version of a
                      specific unit within a course is deprecated. Please go to
                      the course page to edit this field.
                    </p>
                  </HelpTip>
                )}
                {!this.props.hasCourse && (
                  <HelpTip>
                    <p>
                      The family name is used to group together scripts that are
                      different version years of the same standalone course so
                      that users can be redirected between different version
                      years.
                    </p>
                  </HelpTip>
                )}
                {this.state.isCourse && (
                  <HelpTip>
                    <p>
                      If you want to clear the family name you need to uncheck
                      standalone course.
                    </p>
                  </HelpTip>
                )}
              </label>
              <label>
                Version Year
                <select
                  value={this.state.versionYear}
                  style={styles.dropdown}
                  disabled={this.props.hasCourse}
                  onChange={e => this.setState({versionYear: e.target.value})}
                >
                  <option value="">(None)</option>
                  {this.props.versionYearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {this.props.hasCourse && (
                  <HelpTip>
                    <p>
                      This field cannot be edited because this script belongs to
                      a course, and redirecting to the latest version of a
                      specific unit within a course is deprecated. Please go to
                      the course page to edit this field.
                    </p>
                  </HelpTip>
                )}
              </label>
              <label>
                Is a Standalone Course
                <input
                  className="isCourseCheckbox"
                  type="checkbox"
                  checked={this.state.isCourse}
                  disabled={!this.state.familyName}
                  style={styles.checkbox}
                  onChange={this.handleStandaloneCourseChange}
                />
                {this.state.familyName && !this.props.hasCourse && (
                  <HelpTip>
                    <p>
                      (Still in development) If checked, indicates that this
                      Unit represents a standalone course. Examples of such
                      Units include CourseA-F, Express, and Pre-Express.
                    </p>
                  </HelpTip>
                )}
                {!this.state.familyName && !this.props.hasCourse && (
                  <HelpTip>
                    <p>
                      You must select a family name in order to mark something
                      as a standalone course.
                    </p>
                  </HelpTip>
                )}
                {this.props.hasCourse && (
                  <HelpTip>
                    <p>
                      This unit is already part of a course so it can not be a
                      standalone course.
                    </p>
                  </HelpTip>
                )}
              </label>
              <label>
                Can be recommended (aka stable)
                <input
                  type="checkbox"
                  checked={this.state.isStable}
                  style={styles.checkbox}
                  onChange={() =>
                    this.setState({isStable: !this.state.isStable})
                  }
                />
                <HelpTip>
                  <p>
                    If checked, this unit will be eligible to be the recommended
                    version of the unit. The most recent eligible version will
                    be the recommended version.
                  </p>
                </HelpTip>
              </label>
              <VisibleAndPilotExperiment
                visible={!this.state.hidden}
                updateVisible={() =>
                  this.setState({hidden: !this.state.hidden})
                }
                pilotExperiment={this.state.pilotExperiment}
                updatePilotExperiment={pilotExperiment =>
                  this.setState({pilotExperiment})
                }
              />
            </div>
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Lesson Settings">
          <label>
            Show Lesson Plan Links
            <input
              type="checkbox"
              checked={this.state.hasLessonPlan}
              style={styles.checkbox}
              onChange={() =>
                this.setState({hasLessonPlan: !this.state.hasLessonPlan})
              }
            />
            <HelpTip>
              <p>
                Check if this script has lesson plans (on Curriculum Builder or
                in PDF form) that we should provide links to.
              </p>
            </HelpTip>
          </label>
          {!this.props.beta && (
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
                script are visible to students in their section.
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
          {!this.props.beta && (
            <LessonDescriptions
              scriptName={this.props.name}
              currentDescriptions={this.props.i18nData.stageDescriptions}
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
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Teacher Resources Settings">
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
                Check if this script has resources for verified teachers, and we
                want to notify non-verified teachers that this is the case.
              </p>
            </HelpTip>
          </label>
          <div>
            <h4>Teacher Resources</h4>
            <div>
              Select the Teacher Resources buttons you'd like to have show up on
              the top of the script overview page
            </div>
            <ResourcesEditor
              inputStyle={styles.input}
              resources={this.state.teacherResources}
              updateTeacherResources={teacherResources =>
                this.setState({teacherResources})
              }
            />
          </div>
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Professional Learning Settings">
          {this.props.isLevelbuilder && (
            <label>
              Professional Learning Course
              <HelpTip>
                <p>
                  When filled out, the course unit associated with this script
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
          )}
          <label>
            Number of Peer Reviews to Complete
            <HelpTip>
              <p>Currently only supported for professional learning courses</p>
            </HelpTip>
            <input
              value={this.state.peerReviewsRequired}
              style={styles.input}
              onChange={e =>
                this.setState({peerReviewsRequired: e.target.value})
              }
            />
          </label>
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Lesson Groups and Lessons">
          {this.props.beta ? (
            <UnitCard />
          ) : (
            <div>
              {betaWarning || (
                <a href="?beta=true">
                  Try the beta Script Editor (will reload the page without
                  saving)
                </a>
              )}
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
          error={this.state.error}
          isSaving={this.state.isSaving}
          lastSaved={this.state.lastSaved}
        />
      </div>
    );
  }
}

export const UnconnectedScriptEditor = ScriptEditor;

export default connect(
  state => ({
    lessonGroups: state.lessonGroups,
    levelKeyList: state.levelKeyList
  }),
  {
    init
  }
)(ScriptEditor);
