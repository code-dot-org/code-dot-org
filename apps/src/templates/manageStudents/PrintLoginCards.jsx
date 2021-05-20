import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {PrintLoginCardsButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

export default class PrintLoginCards extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    entryPointForMetrics: PropTypes.oneOf(
      Object.values(PrintLoginCardsButtonMetricsCategory)
    ),
    onPrintLoginCards: PropTypes.func.isRequired
  };

  onClick = () => {
    const {sectionId, entryPointForMetrics} = this.props;
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'print-login-cards-button-click',
        data_json: JSON.stringify({
          sectionId: sectionId,
          entryPoint: entryPointForMetrics
        })
      },
      {includeUserId: true}
    );
    this.props.onPrintLoginCards();
  };

  render() {
    return (
      <div style={styles.button}>
        <Button
          __useDeprecatedTag
          onClick={this.onClick}
          target="_blank"
          color={Button.ButtonColor.gray}
          text={i18n.printLoginCards_button()}
          icon="print"
        />
      </div>
    );
  }
}

const styles = {
  button: {
    marginLeft: 5
  }
};
