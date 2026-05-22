import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

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
    this.props.onPrintLoginCards();
  };

  render() {
    return (
      <MuiButton
        variant="outlined"
        color="tertiary"
        size="small"
        onClick={this.onClick}
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="print" />}
      >
        {i18n.printLoginCards_button()}
      </MuiButton>
    );
  }
}
