import React, { PropTypes } from 'react';
import FlexGroup from './FlexGroup';
import StageDescriptions from './StageDescriptions';
import ScriptAnnouncementsEditor from './ScriptAnnouncementsEditor';
import LegendSelector from './LegendSelector';
import $ from 'jquery';
import ResourcesEditor from '@cdo/apps/templates/courseOverview/ResourcesEditor';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';
import ResourceType, { resourceShape, stringForType } from '@cdo/apps/templates/courseOverview/resourceType';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';

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
  }
};

const VIDEO_KEY_REGEX = /video_key_for_next_level/g;

/**
 * Component for editing course scripts.
 */
const ScriptEditor = React.createClass({
  propTypes: {
    beta: PropTypes.bool,
    name: PropTypes.string.isRequired,
    i18nData: PropTypes.object.isRequired,
    hidden: PropTypes.bool,
    loginRequired: PropTypes.bool,
    hideableStages: PropTypes.bool,
    studentDetailProgressView: PropTypes.bool,
    professionalLearningCourse: PropTypes.bool,
    peerReviewsRequired: PropTypes.number,
    wrapupVideo: PropTypes.string,
    excludeCsfColumnInLegend: PropTypes.bool,
    projectWidgetVisible: PropTypes.bool,
    projectWidgetTypes: PropTypes.arrayOf(PropTypes.string),
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    stageExtrasAvailable: PropTypes.bool,
    stageLevelData: PropTypes.string,
    hasVerifiedResources: PropTypes.bool,
    announcements: PropTypes.arrayOf(announcementShape),
  },

  handleClearProjectWidgetSelectClick() {
    $(this.projectWidgetSelect).children('option')['removeAttr']('selected', true);
  },

  presubmit(e) {
    const videoKeysBefore = (this.props.stageLevelData.match(VIDEO_KEY_REGEX) || []).length;
    const videoKeysAfter = (this.scriptTextArea.value.match(VIDEO_KEY_REGEX) || []).length;
    if (videoKeysBefore !== videoKeysAfter) {
      if (!confirm("WARNING: adding or removing video keys will also affect " +
          "uses of this level in other scripts. Are you sure you want to " +
          "continue?")) {
        e.preventDefault();
      }
    }
  },

  render() {
    const textAreaRows = this.props.stageLevelData ?
      this.props.stageLevelData.split('\n').length + 5 :
      10;
    return (
      <div>
        <h2>I18n Strings</h2>
        <label>
          Title
          <input
            name="title"
            defaultValue={this.props.i18nData.title}
            style={styles.input}
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
          <input
            name="description_short"
            defaultValue={this.props.i18nData.descriptionShort}
            style={styles.input}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            defaultValue={this.props.i18nData.description}
            rows={5}
            style={styles.input}
          />
        </label>
        <StageDescriptions
          scriptName={this.props.name}
          currentDescriptions={this.props.i18nData.stageDescriptions}
        />
        <ScriptAnnouncementsEditor
          defaultAnnouncements={this.props.announcements}
          inputStyle={styles.input}
        />
        <h2>Basic Settings</h2>
        <label>
          Visible in Teacher Dashboard
          <input
            name="visible_to_teachers"
            type="checkbox"
            defaultChecked={!this.props.hidden}
            style={styles.checkbox}
          />
          <p>
            If checked this script will show up in the dropdown on the Teacher
            Dashboard, for teachers to assign to students.
          </p>
        </label>
        <label>
          Login Required
          <input
            name="login_required"
            type="checkbox"
            defaultChecked={this.props.loginRequired}
            style={styles.checkbox}
          />
          <p>
            Require users to log in before viewing this script.
          </p>
        </label>
        <label>
          Hideable Stages
          <input
            name="hideable_stages"
            type="checkbox"
            defaultChecked={this.props.hideableStages}
            style={styles.checkbox}
          />
          <p>
            Allow teachers to toggle whether or not specific stages in this
            script are visible to students in their section.
          </p>
        </label>
        <label>
          Default Progress to Detail View
          <input
            name="student_detail_progress_view"
            type="checkbox"
            defaultChecked={this.props.studentDetailProgressView}
            style={styles.checkbox}
          />
          <p>
            By default students start in the summary view. When this box is
            checked, we instead stick everyone into detail view to start for
            this script.
          </p>
        </label>
        <label>
          Lesson Extras Available
          <input
            name="stage_extras_available"
            type="checkbox"
            defaultChecked={this.props.stageExtrasAvailable}
            style={styles.checkbox}
          />
          <p>
            If also enabled by the teacher, show the lesson extras page at the end
            of each stage.
          </p>
        </label>
        <label>
          Verified Resources
          <input
            name="has_verified_resources"
            type="checkbox"
            defaultChecked={this.props.hasVerifiedResources}
            style={styles.checkbox}
          />
          <p>
            Check if this course has resources for verified teachers, and we
            want to notify non-verified teachers that this is the case.
          </p>
        </label>
        <label>
          Professional Learning Course. When filled out, the course unit associated with
          this script will be associated with the course named in this box. If the course
          unit does not exist, and if the course does not exist it will be created.
          <input
            name="professional_learning_course"
            defaultValue={this.props.professionalLearningCourse}
            style={styles.input}
          />
        </label>
        <label>
          Peer Reviews to Complete. Currently only supported for professional learning
          courses
          <input
            name="peer_reviews_to_complete"
            defaultValue={this.props.peerReviewsRequired}
            style={styles.input}
          />
        </label>
        <label>
          Wrap-up Video
          <input
            name="wrapup_video"
            defaultValue={this.props.wrapupVideo}
            style={styles.input}
          />
        </label>
        <LegendSelector
          excludeCsf={this.props.excludeCsfColumnInLegend}
          inputStyle={styles.checkbox}
        />
        <h3>Project widget options</h3>
        <label>
          Project widget visible
          <input
            name="project_widget_visible"
            type="checkbox"
            defaultChecked={this.props.projectWidgetVisible}
            style={styles.checkbox}
          />
          <p>
            If checked this script will have the projects widget (recent projects and new
            project buttons) visible in stage extras.
          </p>
        </label>
        <label>
          Project widget new project types
          <p>
            Select up to 4 project type options to appear in the 'Start a new project' section. Select
            <a onClick={this.handleClearProjectWidgetSelectClick}> none </a>
            or shift-click or cmd-click to select multiple.
          </p>
          <select
            name="project_widget_types[]"
            multiple
            defaultValue={this.props.projectWidgetTypes}
            ref={select => this.projectWidgetSelect = select}
          >
            <option value="playlab">Play Lab</option>
            <option value="playlab_k1">Play Lab K1</option>
            <option value="artist">Artist</option>
            <option value="artist_k1">Artist K1</option>
            <option value="applab">App Lab</option>
            <option value="gamelab">Game Lab</option>
            <option value="weblab">Web Lab</option>
            <option value="calc">Calc</option>
            <option value="eval">Eval</option>
            <option value="frozen">Frozen</option>
            <option value="minecraft_adventurer">Minecraft Adventurer</option>
            <option value="minecraft_designer">Minecraft Designer</option>
            <option value="minecraft_hero">Minecraft Hero</option>
            <option value="starwars">Star Wars</option>
            <option value="starwarsblocks">Star Wars Blocks</option>
            <option value="flappy">Flappy</option>
            <option value="sports">Sports</option>
            <option value="basketball">Basketball</option>
            <option value="bounce">Bounce</option>
            <option value="infinity">Infinity</option>
            <option value="iceage">Ice Age</option>
            <option value="gumball">Gumball</option>
          </select>
        </label>
        <div>
          <h4>Teacher Resources</h4>
          <div>
            Select the Teacher Resources buttons you'd like to have show up on
            the top of the course overview page
          </div>
          <ResourcesEditor
            inputStyle={styles.input}
            resources={this.props.teacherResources}
            maxResources={Object.keys(ResourceType).length}
            renderPreview={resources => (
              <DropdownButton
                text="Teacher resources"
                color={Button.ButtonColor.blue}
              >
              {resources.map(({type, link}, index) =>
                <a key={index} href={link}>{stringForType[type]}</a>
              )}
              </DropdownButton>
            )}
          />
        </div>
        <h2>Stages and Levels</h2>
        {this.props.beta ?
          <FlexGroup /> :
          <div>
            <a href="?beta=true">Try the beta Script Editor (will reload the page without saving)</a>
            <textarea
              id="script_text"
              name="script_text"
              rows={textAreaRows}
              style={{width: 700}}
              defaultValue={this.props.stageLevelData || "stage 'new stage'\n"}
              ref={textArea => this.scriptTextArea = textArea}
            />
          </div>
        }
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
});

export default ScriptEditor;
