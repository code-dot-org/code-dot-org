import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

const styles = {
  button: {
    marginLeft: 5
  }
};

export default class PrintLoginCards extends Component {
  static propTypes = {
    sectionId: PropTypes.number
  };

  onPrintLoginCards = () => {
    const {sectionId} = this.props;
    const url =
      teacherDashboardUrl(sectionId, '/login_info') + `?autoPrint=true`;
    window.open(url, '_blank');
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'print-login-cards-button-click',
        data_json: JSON.stringify({
          sectionId: sectionId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    return (
      <div style={styles.button}>
        <Button
          __useDeprecatedTag
          onClick={this.onPrintLoginCards}
          target="_blank"
          color={Button.ButtonColor.gray}
          text={i18n.printLoginCards_button()}
          icon="print"
        />
      </div>
    );
  }
}
