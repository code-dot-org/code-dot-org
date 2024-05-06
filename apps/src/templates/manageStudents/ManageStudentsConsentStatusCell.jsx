import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getSelectedScriptName} from '@cdo/apps/redux/unitSelectionRedux';
import i18n from '@cdo/locale';

import {tableLayoutStyles} from '../tables/tableConstants';

import {editStudent} from './manageStudentsRedux';

class ManageStudentsConsentStatusCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    consentStatus: PropTypes.string.isReequired,

    //Provided by redux
    editStudent: PropTypes.func.isRequired,
    scriptName: PropTypes.string,
  };

  onChangeName = e => {
    this.props.editStudent(this.props.id, {name: e.target.value});
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

export default connect(
  state => ({
    scriptName: getSelectedScriptName(state),
  }),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    },
  })
)(ManageStudentsConsentStatusCell);
