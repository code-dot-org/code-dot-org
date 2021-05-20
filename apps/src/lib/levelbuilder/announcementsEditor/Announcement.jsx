import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  announcementShape,
  VisibilityType
} from '@cdo/apps/code-studio/announcementsRedux';
import {NotificationType} from '@cdo/apps/templates/Notification';

export default class Announcement extends Component {
  static propTypes = {
    announcement: announcementShape,
    inputStyle: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };

  render() {
    const {announcement, inputStyle, index, onRemove, onChange} = this.props;
    return (
      <div style={styles.announcement}>
        <h5>Announcement #{index + 1}</h5>
        <label>
          Notice
          <input
            value={announcement.notice}
            style={inputStyle}
            onChange={event => onChange(index, 'notice', event.target.value)}
          />
        </label>
        <label>
          Details
          <input
            value={announcement.details}
            style={inputStyle}
            onChange={event => onChange(index, 'details', event.target.value)}
          />
        </label>
        <label>
          Link
          <input
            value={announcement.link}
            style={inputStyle}
            onChange={event => onChange(index, 'link', event.target.value)}
          />
        </label>
        <label>
          Type
          <div>
            <select
              className="uitest-announcement-type"
              value={announcement.type}
              onChange={event => onChange(index, 'type', event.target.value)}
            >
              {Object.values(NotificationType).map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </label>
        <label>
          Visibility
          <div>
            <select
              className="uitest-announcement-visibility"
              value={announcement.visibility}
              onChange={event =>
                onChange(index, 'visibility', event.target.value)
              }
            >
              {Object.values(VisibilityType).map(visibility => (
                <option key={visibility} value={visibility}>
                  {visibility}
                </option>
              ))}
            </select>
          </div>
        </label>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => onRemove(index)}
        >
          Remove
        </button>
      </div>
    );
  }
}

const styles = {
  announcement: {
    border: '1px solid #ccc',
    padding: 5,
    marginBottom: 10
  }
};
