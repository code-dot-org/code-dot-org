import React from 'react';
import FlexGroup from './FlexGroup';
import StageDescriptions from './StageDescriptions';

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
    wrapupVideo: React.PropTypes.string
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
          Professional Learning Course
          <input
            name="professional_learning_course"
            defaultValue={this.props.professionalLearningCourse}
            style={styles.input}
          />
        </label>
        <label>
          Peer Reviews to Complete
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
        <h2>Stages and Levels</h2>
        {this.props.beta && <FlexGroup />}
      </div>
    );
  }
});

export default ScriptEditor;
