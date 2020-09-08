import PropTypes from 'prop-types';
import React from 'react';
import LessonGroups from './LessonGroups';
import LessonDescriptions from './LessonDescriptions';
import ScriptAnnouncementsEditor from './ScriptAnnouncementsEditor';
import $ from 'jquery';
import ResourcesEditor from '@cdo/apps/templates/courseOverview/ResourcesEditor';
import {resourceShape} from '@cdo/apps/templates/courseOverview/resourceType';
import {announcementShape} from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import VisibleAndPilotExperiment from './VisibleAndPilotExperiment';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import LessonExtrasEditor from './LessonExtrasEditor';
import color from '@cdo/apps/util/color';
import MarkdownPreview from '@cdo/apps/lib/levelbuilder/MarkdownPreview';

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
    announcements: PropTypes.arrayOf(announcementShape).isRequired,
    supportedLocales: PropTypes.arrayOf(PropTypes.string),
    locales: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    projectSharing: PropTypes.bool,
    curriculumUmbrella: PropTypes.oneOf(CURRICULUM_UMBRELLAS),
    familyName: PropTypes.string,
    versionYear: PropTypes.string,
    scriptFamilies: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isLevelbuilder: PropTypes.bool,
    tts: PropTypes.bool,
    hasCourse: PropTypes.bool,
    isCourse: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      curriculumUmbrella: this.props.curriculumUmbrella,
      description: this.props.i18nData.description
    };
  }

  handleClearSupportedLocalesSelectClick = () => {
    $(this.supportedLocaleSelect)
      .children('option')
      .removeAttr('selected', true);
  };

  handleUmbrellaSelectChange = event => {
    const curriculumUmbrella = event.target.value;
    this.setState({curriculumUmbrella});
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
  };

  handleDescriptionChange = event => {
    this.setState({description: event.target.value});
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
        <MarkdownPreview
          markdown={this.state.description}
          onChange={this.handleDescriptionChange}
          label={'Description'}
          name={'description'}
          inputRows={5}
        />
        <h2>Basic Settings</h2>
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
              By default students start in the summary view. When this box is
              checked, we instead stick everyone into detail view to start for
              this script.
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
            Select additional locales supported by this script. Select
            <a onClick={this.handleClearSupportedLocalesSelectClick}> none </a>
            or shift-click or cmd-click to select multiple.
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
          <input
            name="wrapup_video"
            defaultValue={this.props.wrapupVideo}
            style={styles.input}
          />
        </label>
        <ScriptAnnouncementsEditor
          defaultAnnouncements={this.props.announcements}
          inputStyle={styles.input}
        />
        <h2>Publishing Settings</h2>
        {this.props.isLevelbuilder && (
          <div>
            <label>
              Core Course
              <select
                name="curriculum_umbrella"
                style={styles.dropdown}
                defaultValue={this.props.curriculumUmbrella}
                onChange={this.handleUmbrellaSelectChange}
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
                defaultValue={this.props.familyName}
                style={styles.dropdown}
                disabled={this.props.hasCourse}
              >
                <option value="">(None)</option>
                {this.props.scriptFamilies.map(familyOption => (
                  <option key={familyOption} value={familyOption}>
                    {familyOption}
                  </option>
                ))}
              </select>
              {this.props.hasCourse && (
                <HelpTip>
                  <p>
                    This field cannot be edited because this script belongs to a
                    course, and redirecting to the latest version of a specific
                    unit within a course is deprecated. Please go to the course
                    page to edit this field.
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
                    This field cannot be edited because this script belongs to a
                    course, and redirecting to the latest version of a specific
                    unit within a course is deprecated. Please go to the course
                    page to edit this field.
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
                  version of the unit. The most recent eligible version will be
                  the recommended version.
                </p>
              </HelpTip>
            </label>
            <VisibleAndPilotExperiment
              visible={!this.props.hidden}
              pilotExperiment={this.props.pilotExperiment}
            />
            <label>
              Is a Standalone Course
              <input
                name="is_course"
                type="checkbox"
                defaultChecked={this.props.isCourse}
                style={styles.checkbox}
              />
              <HelpTip>
                <p>
                  (Still in development) If checked, indicates that this Unit
                  represents a standalone course. Examples of such Units include
                  CourseA-F, Express, and Pre-Express.
                </p>
              </HelpTip>
            </label>
          </div>
        )}

        <h2>Lesson Settings</h2>
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
              Check if this script has lesson plans (on Curriculum Builder or in
              PDF form) that we should provide links to.
            </p>
          </HelpTip>
        </label>
        <label>
          Curriculum Path
          <input
            name="curriculum_path"
            defaultValue={this.props.curriculumPath}
            style={styles.input}
          />
        </label>
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
        <LessonDescriptions
          scriptName={this.props.name}
          currentDescriptions={this.props.i18nData.stageDescriptions}
        />
        <h2>Teacher Resources Settings</h2>
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
        <h2>Professional Learning Settings</h2>
        {this.props.isLevelbuilder && (
          <label>
            Professional Learning Course
            <HelpTip>
              <p>
                When filled out, the course unit associated with this script
                will be associated with the course named in this box. If the
                course unit does not exist, and if the course does not exist it
                will be created.
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

        <h2>Lessons and Levels</h2>
        {this.props.beta ? (
          <LessonGroups />
        ) : (
          <div>
            {betaWarning || (
              <a href="?beta=true">
                Try the beta Script Editor (will reload the page without saving)
              </a>
            )}
            <textarea
              id="script_text"
              name="script_text"
              rows={textAreaRows}
              style={styles.input}
              defaultValue={
                this.props.lessonLevelData ||
                "lesson_group 'lesson group', display_name: 'display name'\nlesson 'new lesson'\n"
              }
              ref={textArea => (this.scriptTextArea = textArea)}
            />
          </div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          style={{margin: 0}}
          onClick={this.presubmit}
        >
          Save Changes
        </button>
      </div>
    );
  }
}
