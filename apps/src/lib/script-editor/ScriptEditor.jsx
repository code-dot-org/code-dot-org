import React from 'react';
import FlexGroup from './FlexGroup';
import StageDescriptions from './StageDescriptions';
import LegendSelector from './LegendSelector';
import $ from 'jquery';

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

/**
 * Component for editing course scripts.
 */
const ScriptEditor = React.createClass({
  propTypes: {
    beta: React.PropTypes.bool,
    name: React.PropTypes.string.isRequired,
    i18nData: React.PropTypes.object.isRequired,
    hidden: React.PropTypes.bool,
    loginRequired: React.PropTypes.bool,
    hideableStages: React.PropTypes.bool,
    studentDetailProgressView: React.PropTypes.bool,
    professionalLearningCourse: React.PropTypes.bool,
    peerReviewsRequired: React.PropTypes.number,
    wrapupVideo: React.PropTypes.string,
    excludeCsfColumnInLegend: React.PropTypes.bool,
    projectWidgetVisible: React.PropTypes.bool,
    projectWidgetTypes: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  handleClearProjectWidgetSelectClick() {
    $(this.projectWidgetSelect).children('option')['removeAttr']('selected', true);
  },

  render() {
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
            Require users to log in before viewing this script. This should be
            enabled on scripts that contain App Lab or Game Lab levels.
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
            <option value="artist">Artist</option>
            <option value="applab">App Lab</option>
            <option value="gamelab">Game Lab</option>
            <option value="weblab">Web Lab</option>
            <option value="calc">Calc</option>
            <option value="eval">Eval</option>
            <option value="frozen">Frozen</option>
            <option value="mc">Minecraft Adventurer</option>
            <option value="minecraft">Minecraft Designer</option>
            <option value="starwars">Star Wars</option>
          </select>
        </label>
        <h2>Stages and Levels</h2>
        {this.props.beta && <FlexGroup />}
      </div>
    );
  }
});

export default ScriptEditor;
