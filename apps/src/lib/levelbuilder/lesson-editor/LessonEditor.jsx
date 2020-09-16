import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';

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
    margin: '0 6px'
  }
};

export default class LessonEditor extends Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    overview: PropTypes.string,
    studentOverview: PropTypes.string,
    title: PropTypes.string,
    shortTitle: PropTypes.string,
    unplugged: PropTypes.bool,
    lockable: PropTypes.bool,
    assessment: PropTypes.bool,
    creativeCommonsLicense: PropTypes.string,
    purpose: PropTypes.string,
    preparation: PropTypes.string,
    announcements: PropTypes.arrayOf(announcementShape)
  };

  render() {
    const {
      displayName,
      overview,
      studentOverview,
      shortTitle,
      unplugged,
      lockable,
      creativeCommonsLicense,
      assessment,
      purpose,
      preparation,
      announcements
    } = this.props;
    return (
      <div style={styles.editor}>
        <h1>Editing Lesson "{displayName}"</h1>
        <label>
          Title
          <input name="name" defaultValue={displayName} style={styles.input} />
        </label>
        <label>
          Short Title
          <input
            name="short_title"
            defaultValue={shortTitle}
            style={styles.input}
          />
        </label>
        <h2>Lesson Settings</h2>
        <label>
          Lockable
          <input
            name="lockable"
            type="checkbox"
            defaultChecked={lockable}
            style={styles.checkbox}
          />
          <HelpTip>
            <p>
              Check this box if this lesson should be locked from teachers. Only
              validated teachers will be able to see it and unlock the
              materials.
            </p>
          </HelpTip>
        </label>
        <label>
          Assessment
          <input
            name="assessment"
            type="checkbox"
            defaultChecked={assessment}
            style={styles.checkbox}
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
            defaultChecked={unplugged}
            style={styles.checkbox}
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
            name="creative_commons_license"
            style={styles.dropdown}
            defaultValue={creativeCommonsLicense}
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
        <AnnouncementsEditor
          defaultAnnouncements={announcements}
          inputStyle={styles.input}
        />
        <h2>Lesson Plan</h2>
        <TextareaWithMarkdownPreview
          markdown={overview}
          label={'Overview'}
          name={'overview'}
          inputRows={5}
        />
        <TextareaWithMarkdownPreview
          markdown={studentOverview}
          label={'Student Overview'}
          name={'student_overview'}
          inputRows={5}
        />
        <TextareaWithMarkdownPreview
          markdown={purpose}
          label={'Purpose'}
          name={'purpose'}
          inputRows={5}
        />
        <TextareaWithMarkdownPreview
          markdown={preparation}
          label={'Preparation'}
          name={'preparation'}
          inputRows={5}
        />

        <h2>Activities & Levels</h2>
        <ActivitiesEditor />

        <button className="btn btn-primary" type="submit" style={{margin: 0}}>
          Save Changes
        </button>
      </div>
    );
  }
}
