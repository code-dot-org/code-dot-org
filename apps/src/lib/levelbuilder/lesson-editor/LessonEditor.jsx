import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';
import ObjectivesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ObjectivesEditor';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import RelatedLessons from './RelatedLessons';
import {
  relatedLessonShape,
  activityShape,
  resourceShape
} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import _ from 'lodash';
import {connect} from 'react-redux';
import {NEW_LEVEL_ID} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

const styles = {
  editor: {
    width: '100%'
  },
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
    margin: '0 6px',
    width: 300
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

class LessonEditor extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    displayName: PropTypes.string.isRequired,
    overview: PropTypes.string,
    studentOverview: PropTypes.string,
    unplugged: PropTypes.bool,
    lockable: PropTypes.bool,
    assessment: PropTypes.bool,
    creativeCommonsLicense: PropTypes.string,
    purpose: PropTypes.string,
    preparation: PropTypes.string,
    announcements: PropTypes.arrayOf(announcementShape),
    relatedLessons: PropTypes.arrayOf(relatedLessonShape).isRequired,
    objectives: PropTypes.arrayOf(PropTypes.object).isRequired,
    activities: PropTypes.arrayOf(activityShape).isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      displayName: this.props.displayName,
      overview: this.props.overview,
      studentOverview: this.props.studentOverview,
      unplugged: this.props.unplugged,
      lockable: this.props.lockable,
      creativeCommonsLicense: this.props.creativeCommonsLicense,
      assessment: this.props.assessment,
      purpose: this.props.purpose,
      preparation: this.props.preparation,
      announcements: this.props.announcements,
      objectives: this.props.objectives
    };
  }

  handleSaveAndKeepEditing = e => {
    e.preventDefault();

    $.ajax({
      url: `/lessons/${this.props.id}?do_not_redirect=true`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({
        name: this.state.displayName,
        lockable: this.state.lockable,
        creativeCommonsLicense: this.state.creativeCommonsLicense,
        assessment: this.state.assessment,
        unplugged: this.state.unplugged,
        overview: this.state.overview,
        studentOverview: this.state.studentOverview,
        purpose: this.state.purpose,
        preparation: this.state.preparation,
        objectives: JSON.stringify(this.state.objectives),
        activities: this.serializeActivities(),
        resources: JSON.stringify(this.props.resources.map(r => r.key)),
        announcements: this.state.announcements
      })
    })
      .done(data => {
        console.log(data);
      })
      .fail(error => {
        console.log(error);
      });
  };

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleUpdateObjectives = newObjectives => {
    this.setState({objectives: newObjectives});
  };

  // Serialize the activities into JSON, renaming any keys which are different
  // on the backend.
  serializeActivities = () => {
    const activities = _.cloneDeep(this.props.activities);
    activities.forEach(activity => {
      activity.name = activity.displayName;
      delete activity.displayName;

      activity.activitySections.forEach(activitySection => {
        activitySection.name = activitySection.displayName;
        delete activitySection.displayName;

        activitySection.description = activitySection.text;
        delete activitySection.text;

        activitySection.scriptLevels.forEach(scriptLevel => {
          // The server expects id to be absent if a new script level is to be
          // created.
          if (scriptLevel.id === NEW_LEVEL_ID) {
            delete scriptLevel.id;
          }

          // The position within the activity section
          scriptLevel.activitySectionPosition = scriptLevel.position;

          // Other position values will be recomputed from the
          // activitySectionPosition on the server.
          delete scriptLevel.position;
          delete scriptLevel.levelNumber;
        });
      });
    });

    return JSON.stringify(activities);
  };

  render() {
    const {
      displayName,
      overview,
      studentOverview,
      unplugged,
      lockable,
      creativeCommonsLicense,
      assessment,
      purpose,
      preparation,
      announcements
    } = this.state;
    const {relatedLessons} = this.props;
    return (
      <div style={styles.editor}>
        <h1>Editing Lesson "{displayName}"</h1>
        <label>
          Title
          <input
            name="name"
            value={displayName}
            style={styles.input}
            onChange={e => this.setState({displayName: e.target.value})}
          />
        </label>

        <RelatedLessons relatedLessons={relatedLessons} />

        <CollapsibleEditorSection
          title="General Lesson Settings"
          collapsed={true}
        >
          <label>
            Lockable
            <input
              name="lockable"
              type="checkbox"
              checked={lockable}
              style={styles.checkbox}
              onChange={() => this.setState({lockable: !lockable})}
            />
            <HelpTip>
              <p>
                Check this box if this lesson should be locked for students. If
                checked, teachers will be able to unlock the lesson for their
                students.
              </p>
            </HelpTip>
          </label>
          <label>
            Assessment
            <input
              name="assessment"
              type="checkbox"
              checked={assessment}
              style={styles.checkbox}
              onChange={() => this.setState({assessment: !assessment})}
            />
            <HelpTip>
              <p>Check this box if this lesson is an assessment or project. </p>
            </HelpTip>
          </label>
          <label>
            Unplugged Lesson
            <input
              name="unplugged"
              type="checkbox"
              checked={unplugged}
              style={styles.checkbox}
              onChange={() => this.setState({unplugged: !unplugged})}
            />
            <HelpTip>
              <p>
                Check this box if the lesson does not require use of a device.
              </p>
            </HelpTip>
          </label>
          <label>
            Creative Commons Image
            <select
              name="creativeCommonsLicense"
              style={styles.dropdown}
              value={creativeCommonsLicense}
              onChange={e =>
                this.setState({creativeCommonsLicense: e.target.value})
              }
            >
              <option value="Creative Commons BY-NC-SA">
                Creative Commons BY-NC-SA
              </option>
              <option value="Creative Commons BY-NC-ND">
                Creative Commons BY-NC-ND
              </option>
            </select>
            <HelpTip>
              <p>
                Controls what creative commons license applies to this material.
                Default is Creative Commons BY-NC-SA.
              </p>
            </HelpTip>
          </label>
        </CollapsibleEditorSection>
        <CollapsibleEditorSection title="Announcements" collapsed={true}>
          <AnnouncementsEditor
            announcements={announcements}
            inputStyle={styles.input}
            updateAnnouncements={this.handleUpdateAnnouncements}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection
          title="Overviews"
          collapsed={true}
          fullWidth={true}
        >
          <TextareaWithMarkdownPreview
            markdown={overview}
            label={'Overview'}
            inputRows={5}
            handleMarkdownChange={e =>
              this.setState({overview: e.target.value})
            }
          />
          <TextareaWithMarkdownPreview
            markdown={studentOverview}
            label={'Student Overview'}
            inputRows={5}
            helpTip={
              'This overview will appear on the students Lessons Resources page.'
            }
            handleMarkdownChange={e =>
              this.setState({studentOverview: e.target.value})
            }
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection
          title="Purpose and Prep"
          collapsed={true}
          fullWidth={true}
        >
          <TextareaWithMarkdownPreview
            markdown={purpose}
            label={'Purpose'}
            inputRows={5}
            handleMarkdownChange={e => this.setState({purpose: e.target.value})}
          />
          <TextareaWithMarkdownPreview
            markdown={preparation}
            label={'Preparation'}
            inputRows={5}
            handleMarkdownChange={e =>
              this.setState({preparation: e.target.value})
            }
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection
          title="Resources"
          collapsed={true}
          fullWidth={true}
        >
          <ResourcesEditor />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection
          title="Objectives"
          collapsed={true}
          fullWidth={true}
        >
          <ObjectivesEditor
            objectives={this.state.objectives}
            updateObjectives={this.handleUpdateObjectives}
          />
        </CollapsibleEditorSection>

        <CollapsibleEditorSection title="Activities & Levels" fullWidth={true}>
          <ActivitiesEditor serializeActivities={this.serializeActivities} />
        </CollapsibleEditorSection>

        <div style={styles.saveButtonBackground}>
          <button
            className="btn btn-primary"
            type="submit"
            style={styles.saveButton}
            onClick={this.handleSaveAndKeepEditing}
          >
            Save and Keep Editing
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            style={styles.saveButton}
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }
}

export const UnconnectedLessonEditor = LessonEditor;

export default connect(state => ({
  activities: state.activities,
  resources: state.resources
}))(LessonEditor);
