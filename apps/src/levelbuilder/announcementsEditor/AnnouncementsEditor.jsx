import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {
  announcementShape,
  VisibilityType,
} from '@cdo/apps/code-studio/announcementsRedux';
import Announcements from '@cdo/apps/code-studio/components/progress/Announcements';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import HelpTip from '@cdo/apps/legacySharedComponents/HelpTip';
import Announcement from '@cdo/apps/levelbuilder/announcementsEditor/Announcement';
import {NotificationType} from '@cdo/apps/sharedComponents/Notification';
import {createUuid} from '@cdo/apps/utils';

export default class AnnouncementsEditor extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape),
    inputStyle: PropTypes.object.isRequired,
    updateAnnouncements: PropTypes.func.isRequired,
  };

  add = () => {
    this.props.updateAnnouncements(
      this.props.announcements.concat({
        key: createUuid(),
        notice: '',
        details: '',
        link: '',
        type: NotificationType.information,
        visibility: VisibilityType.teacher,
        dismissible: true,
        buttonText: '',
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
              <div>Instructor Preview:</div>
              <Announcements
                announcements={announcements}
                viewAs={ViewType.Instructor}
              />
            </div>
            <div style={styles.preview}>
              <div>Participant Preview:</div>
              <Announcements
                announcements={announcements}
                viewAs={ViewType.Participant}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  preview: {
    marginTop: 10,
  },
};
