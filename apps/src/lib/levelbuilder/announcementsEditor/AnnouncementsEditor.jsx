import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  announcementShape,
  VisibilityType
} from '@cdo/apps/code-studio/announcementsRedux';
import Announcements from '@cdo/apps/code-studio/components/progress/Announcements';
import {NotificationType} from '@cdo/apps/templates/Notification';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import Announcement from '@cdo/apps/lib/levelbuilder/announcementsEditor/Announcement';

export default class AnnouncementsEditor extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape),
    inputStyle: PropTypes.object.isRequired,
    updateAnnouncements: PropTypes.func.isRequired
  };

  add = () => {
    this.props.updateAnnouncements(
      this.props.announcements.concat({
        notice: '',
        details: '',
        link: '',
        type: NotificationType.information,
        visibility: VisibilityType.teacher
      })
    );
  };

  remove = index => {
    const newAnnouncements = [...this.props.announcements];
    newAnnouncements.splice(index, 1);
    this.props.updateAnnouncements(newAnnouncements);
  };

  change = (index, field, newValue) => {
    const newAnnouncements = [...this.props.announcements];
    newAnnouncements[index][field] = newValue;
    this.props.updateAnnouncements(newAnnouncements);
  };

  render() {
    const {inputStyle, announcements} = this.props;
    return (
      <div>
        <input
          type="hidden"
          name="announcements"
          value={JSON.stringify(announcements)}
        />
        <h4>
          Announcements
          <HelpTip>
            <p>
              This can be used to provide one or more announcements that will
              show up for signed in teachers, students, or teachers and students
              on the overview page.
            </p>
          </HelpTip>
        </h4>
        {announcements.map((announce, index) => (
          <Announcement
            key={index}
            index={index}
            announcement={announce}
            inputStyle={inputStyle}
            onChange={this.change}
            onRemove={this.remove}
          />
        ))}
        <button className="btn" type="button" onClick={this.add}>
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Add Announcement
        </button>
        {announcements.length > 0 && (
          <div>
            <div style={styles.preview}>
              <div>Teacher Preview:</div>
              <Announcements announcements={announcements} viewAs={'Teacher'} />
            </div>
            <div style={styles.preview}>
              <div>Student Preview:</div>
              <Announcements announcements={announcements} viewAs={'Student'} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  preview: {
    marginTop: 10
  }
};
