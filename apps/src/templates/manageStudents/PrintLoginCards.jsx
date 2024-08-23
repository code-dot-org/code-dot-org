import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import harness from '@cdo/apps/lib/util/harness';
import {PrintLoginCardsButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import i18n from '@cdo/locale';

export default class PrintLoginCards extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    entryPointForMetrics: PropTypes.oneOf(
      Object.values(PrintLoginCardsButtonMetricsCategory)
    ),
    onPrintLoginCards: PropTypes.func.isRequired,
  };

  onClick = () => {
    const {sectionId, entryPointForMetrics} = this.props;
    harness.trackAnalytics(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'print-login-cards-button-click',
        data_json: JSON.stringify({
          sectionId: sectionId,
          entryPoint: entryPointForMetrics,
        }),
      },
      {includeUserId: true}
    );
    this.props.onPrintLoginCards();
  };

  render() {
    return (
      <Button
        style={styles.button}
        onClick={this.onClick}
        target="_blank"
        color={Button.ButtonColor.gray}
        text={i18n.printLoginCards_button()}
        icon="print"
      />
    );
  }
}

const styles = {
  button: {
    margin: 0,
    marginLeft: 5,
    marginBottom: 5,
  },
};
