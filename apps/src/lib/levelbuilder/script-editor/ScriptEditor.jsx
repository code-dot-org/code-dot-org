import PropTypes from 'prop-types';
import React from 'react';
import UnitCard from '@cdo/apps/lib/levelbuilder/script-editor/UnitCard';
import LessonDescriptions from '@cdo/apps/lib/levelbuilder/script-editor/LessonDescriptions';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import $ from 'jquery';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import {resourceShape} from '@cdo/apps/templates/courseOverview/resourceType';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import VisibleAndPilotExperiment from '@cdo/apps/lib/levelbuilder/script-editor/VisibleAndPilotExperiment';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import LessonExtrasEditor from '@cdo/apps/lib/levelbuilder/script-editor/LessonExtrasEditor';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';

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
  },
  saveButtonBackground: {
    margin: 0,
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: color.lightest_gray,
    borderColor: color.lightest_gray,
    height: 50,
    width: '100%',
    zIndex: 900,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  saveButton: {
    margin: '10px 50px 10px 20px'
  }
};

const VIDEO_KEY_REGEX = /video_key_for_next_level/g;

const CURRICULUM_UMBRELLAS = ['CSF', 'CSD', 'CSP'];

/**
 * Component for editing course scripts.
 */
export default class ScriptEditor extends React.Component {
  static propTypes = {
    beta: PropTypes.bool,
    betaWarning: PropTypes.string,
    name: PropTypes.string.isRequired,
    i18nData: PropTypes.object.isRequired,
    hidden: PropTypes.bool,
    isStable: PropTypes.bool,
    loginRequired: PropTypes.bool,
    hideableLessons: PropTypes.bool,
    studentDetailProgressView: PropTypes.bool,
    professionalLearningCourse: PropTypes.string,
    peerReviewsRequired: PropTypes.number,
    wrapupVideo: PropTypes.string,
    projectWidgetVisible: PropTypes.bool,
    projectWidgetTypes: PropTypes.arrayOf(PropTypes.string),
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    lessonExtrasAvailable: PropTypes.bool,
    lessonLevelData: PropTypes.string,
    hasVerifiedResources: PropTypes.bool,
    hasLessonPlan: PropTypes.bool,
    curriculumPath: PropTypes.string,
    pilotExperiment: PropTypes.string,
    editorExperiment: PropTypes.string,
    initialAnnouncements: PropTypes.arrayOf(announcementShape).isRequired,
    supportedLocales: PropTypes.arrayOf(PropTypes.string),
    locales: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    projectSharing: PropTypes.bool,
    curriculumUmbrella: PropTypes.oneOf(CURRICULUM_UMBRELLAS),
    initialFamilyName: PropTypes.string,
    versionYear: PropTypes.string,
    scriptFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isLevelbuilder: PropTypes.bool,
    tts: PropTypes.bool,
    hasCourse: PropTypes.bool,
    initialIsCourse: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      familyName: this.props.initialFamilyName || '',
      isCourse: this.props.initialIsCourse,
      description: this.props.i18nData.description,
      announcements: this.props.initialAnnouncements
    };
  }

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleClearSupportedLocalesSelectClick = () => {
    $(this.supportedLocaleSelect)
      .children('option')
      .removeAttr('selected', true);
  };

  handleFamilyNameChange = event => {
    this.setState({familyName: event.target.value});
  };

  handleStandaloneCourseChange = () => {
    this.setState({isCourse: !this.state.isCourse});
  };

  presubmit = e => {
    const videoKeysBefore = (
      this.props.lessonLevelData.match(VIDEO_KEY_REGEX) || []
    ).length;
    const scriptText = this.props.beta ? '' : this.scriptTextArea.value;
    const videoKeysAfter = (scriptText.match(VIDEO_KEY_REGEX) || []).length;
    if (videoKeysBefore !== videoKeysAfter) {
      if (
        !confirm(
          'WARNING: adding or removing video keys will also affect ' +
            'uses of this level in other scripts. Are you sure you want to ' +
            'continue?'
        )
      ) {
        e.preventDefault();
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
      e.preventDefault();
    }
  };

  render() {
    const {betaWarning} = this.props;
    const textAreaRows = this.props.lessonLevelData
      ? this.props.lessonLevelData.split('\n').length + 5
      : 10;
    return (
      <div>
        <label>
          Title
          <input
            name="title"
            defaultValue={this.props.i18nData.title}
            style={styles.input}
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
            name="description_audience"
            defaultValue={this.props.i18nData.descriptionAudience}
            style={styles.input}
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
            name="description_short"
            defaultValue={this.props.i18nData.descriptionShort}
            style={styles.input}
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
              name="login_required"
              type="checkbox"
              defaultChecked={this.props.loginRequired}
              style={styles.checkbox}
            />
            <HelpTip>
              <p>Require users to log in before viewing this script.</p>
            </HelpTip>
          </label>
          <label>
            Default Progress to Detail View
            <input
              name="student_detail_progress_view"
              type="checkbox"
              defaultChecked={this.props.studentDetailProgressView}
              style={styles.checkbox}
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
              name="project_sharing"
              type="checkbox"
              defaultChecked={this.props.projectSharing}
              style={styles.checkbox}
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
              name="tts"
              type="checkbox"
              defaultChecked={this.props.tts}
              style={styles.checkbox}
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
              name="supported_locales[]"
              multiple
              defaultValue={this.props.supportedLocales}
              ref={select => (this.supportedLocaleSelect = select)}
            >
              {this.props.locales
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
                name="editor_experiment"
                defaultValue={this.props.editorExperiment}
                style={styles.input}
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
              name="wrapup_video"
              defaultValue={this.props.wrapupVideo}
              style={styles.input}
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
                  name="curriculum_umbrella"
                  style={styles.dropdown}
                  defaultValue={this.props.curriculumUmbrella}
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
                  name="family_name"
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
                  name="version_year"
                  defaultValue={this.props.versionYear}
                  style={styles.dropdown}
                  disabled={this.props.hasCourse}
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
                  name="is_course"
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
                  name="is_stable"
                  type="checkbox"
                  defaultChecked={this.props.isStable}
                  style={styles.checkbox}
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
                visible={!this.props.hidden}
                pilotExperiment={this.props.pilotExperiment}
              />
            </div>
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Lesson Settings">
          <label>
            Show Lesson Plan Links
            <input
              name="has_lesson_plan"
              type="checkbox"
              defaultChecked={this.props.hasLessonPlan}
              style={styles.checkbox}
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
                name="curriculum_path"
                defaultValue={this.props.curriculumPath}
                style={styles.input}
              />
            </label>
          )}
          <label>
            Allow Teachers to Hide Lessons
            <input
              name="hideable_lessons"
              type="checkbox"
              defaultChecked={this.props.hideableLessons}
              style={styles.checkbox}
            />
            <HelpTip>
              <p>
                Allow teachers to toggle whether or not specific lessons in this
                script are visible to students in their section.
              </p>
            </HelpTip>
          </label>
          <LessonExtrasEditor
            lessonExtrasAvailable={this.props.lessonExtrasAvailable}
            projectWidgetTypes={this.props.projectWidgetTypes}
            projectWidgetVisible={this.props.projectWidgetVisible}
          />
          {!this.props.beta && (
            <LessonDescriptions
              scriptName={this.props.name}
              currentDescriptions={this.props.i18nData.stageDescriptions}
            />
          )}
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Teacher Resources Settings">
          <label>
            Has Resources for Verified Teachers
            <input
              name="has_verified_resources"
              type="checkbox"
              defaultChecked={this.props.hasVerifiedResources}
              style={styles.checkbox}
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
              resources={this.props.teacherResources}
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
                name="professional_learning_course"
                defaultValue={this.props.professionalLearningCourse}
                style={styles.input}
              />
            </label>
          )}
          <label>
            Number of Peer Reviews to Complete
            <HelpTip>
              <p>Currently only supported for professional learning courses</p>
            </HelpTip>
            <input
              name="peer_reviews_to_complete"
              defaultValue={this.props.peerReviewsRequired}
              style={styles.input}
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
                name="script_text"
                rows={textAreaRows}
                style={styles.input}
                defaultValue={
                  this.props.lessonLevelData ||
                  "lesson_group 'lesson group', display_name: 'lesson group display name'\nlesson 'new lesson', display_name: 'lesson display name'\n"
                }
                ref={textArea => (this.scriptTextArea = textArea)}
              />
            </div>
          )}
        </CollapsibleEditorSection>

        <div style={styles.saveButtonBackground}>
          <button
            className="btn btn-primary"
            type="submit"
            style={styles.saveButton}
            onClick={this.presubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }
}
