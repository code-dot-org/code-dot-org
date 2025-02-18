import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {ChildAccountComplianceStates} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {tableLayoutStyles} from '../../tables/tableConstants';

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
      case ChildAccountComplianceStates.GRACE_PERIOD:
        return i18n.childAccountPolicy_pendingLockout();
      case ChildAccountComplianceStates.LOCKED_OUT:
        return i18n.childAccountPolicy_lockedOut();
      case ChildAccountComplianceStates.PERMISSION_GRANTED:
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
