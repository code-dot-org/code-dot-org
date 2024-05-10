import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import {tableLayoutStyles} from '../tables/tableConstants';

interface Props {
  id: number;
  consentStatus: string;
}

class AgeGatedTableConsentStatusCell extends Component<Props> {
  static propTypes = {
    id: PropTypes.number.isRequired,
    consentStatus: PropTypes.string.isRequired,
  };

  getConsentStatus = () => {
    switch (this.props.consentStatus) {
      case 'l':
        return i18n.childAccountPolicy_lockedOut();
      case 's':
        return i18n.childAccountPolicy_requestSent();
      case 'p':
        return i18n.childAccountPolicy_permissionGranted();
      default:
        return i18n.childAccountPolicy_notStarted();
    }
  };

  render() {
    return (
      <div style={tableLayoutStyles.tableText}>
        <div>{this.getConsentStatus()}</div>
      </div>
    );
  }
}

export default AgeGatedTableConsentStatusCell;
