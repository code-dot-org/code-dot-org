import React, { Component, PropTypes } from 'react';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import ScriptAnnouncements from '@cdo/apps/code-studio/components/progress/ScriptAnnouncements';
import { NotificationType } from '@cdo/apps/templates/Notification';

const styles = {
  announcement: {
    border: '1px solid #ccc',
    padding: 5,
    marginBottom: 10,
  },
  preview: {
    marginTop: 10
  }
};

const Announce = ({announcement, inputStyle, index}) => (
  <div style={styles.announcement}>
    <h5>Announcement #{index + 1}</h5>
    <label>
      Notice
      <input value={announcement.notice} style={inputStyle}/>
    </label>
    <label>
      Details
      <input value={announcement.details} style={inputStyle}/>
    </label>
    <label>
      Link
      <input value={announcement.link} style={inputStyle}/>
    </label>
    <label>
      Type
      <div>
        <select value={announcement.type}>
          {Object.values(NotificationType).map(type => (
            <option value={type}>{type}</option>
          ))}
        </select>
      </div>
    </label>
    <button
      className="btn"
      onClick={() => console.log('remove')}
    >
      Remove
    </button>
  </div>
);
Announce.propTypes = {
  announcement: announcementShape,
  inputStyle: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export default class ScriptAnnouncementsEditor extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape),
    inputStyle: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      announcements: props.announcements
    };
  }

  render() {
    const { announcements, inputStyle } = this.props;
    return (
      <div>
        <input
          type="hidden"
          name="script_announcements"
          value={JSON.stringify(announcements)}
        />
        <h4>Script Announcements</h4>
        {announcements.map((announce, index) => (
          <Announce
            key={index}
            index={index}
            announcement={announce}
            inputStyle={inputStyle}
          />
        ))}
        <button
          className="btn"
          onClick={() => console.log('add')}
        >
          Add Announcement
        </button>
        <div style={styles.preview}>
          <ScriptAnnouncements announcements={announcements}/>
        </div>
      </div>
    );
  }
}
