import React, { Component, PropTypes } from 'react';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import ScriptAnnouncements from '@cdo/apps/code-studio/components/progress/ScriptAnnouncements';

export default class ScriptAnnouncementsEditor extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape)
  };

  render() {
    return (
      <div>
        <h4>Script Announcements</h4>
        <pre>{JSON.stringify(this.props.announcements, null, 2)}</pre>
        <ScriptAnnouncements announcements={this.props.announcements}/>
      </div>
    );
  }
}
