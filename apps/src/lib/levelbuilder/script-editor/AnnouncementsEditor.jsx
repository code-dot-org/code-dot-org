import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  announcementShape,
  VisibilityType
} from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import ScriptAnnouncements from '@cdo/apps/code-studio/components/progress/ScriptAnnouncements';
import {NotificationType} from '@cdo/apps/templates/Notification';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import Announce from '@cdo/apps/lib/levelbuilder/script-editor/Announce';

const styles = {
  preview: {
    marginTop: 10
  }
};

export default class AnnouncementsEditor extends Component {
  static propTypes = {
    defaultAnnouncements: PropTypes.arrayOf(announcementShape),
    inputStyle: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      announcements: props.defaultAnnouncements
    };
  }

  add = () => {
    this.setState({
      announcements: this.state.announcements.concat({
        notice: '',
        details: '',
        link: '',
        type: NotificationType.information,
        visibility: VisibilityType.teacher
      })
    });
  };

  remove = index => {
    const newAnnouncements = [...this.state.announcements];
    newAnnouncements.splice(index, 1);
    this.setState({
      announcements: newAnnouncements
    });
  };

  change = (index, field, newValue) => {
    const newAnnouncements = [...this.state.announcements];
    newAnnouncements[index][field] = newValue;
    this.setState({
      announcements: newAnnouncements
    });
  };

  render() {
    const {inputStyle} = this.props;
    const {announcements} = this.state;
    return (
      <div>
        <input
          type="hidden"
          name="script_announcements"
          value={JSON.stringify(announcements)}
        />
        <h4>
          Script Announcements
          <HelpTip>
            <p>
              This can be used to provide one or more announcements that will
              show up for signed in teachers, students, or teachers and students
              on the script overview page.
            </p>
          </HelpTip>
        </h4>
        {announcements.map((announce, index) => (
          <Announce
            key={index}
            index={index}
            announcement={announce}
            inputStyle={inputStyle}
            onChange={this.change}
            onRemove={this.remove}
          />
        ))}
        <button className="btn" type="button" onClick={this.add}>
          Additional Announcement
        </button>
        {announcements.length > 0 && (
          <div style={styles.preview}>
            <div>Preview:</div>
            <ScriptAnnouncements announcements={announcements} />
          </div>
        )}
      </div>
    );
  }
}
