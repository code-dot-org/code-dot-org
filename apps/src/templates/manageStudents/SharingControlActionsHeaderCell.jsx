import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {handleShareSetting} from './manageStudentsRedux';

const LEARN_MORE_URL =
  'https://support.code.org/hc/en-us/articles/115001554911-Configuring-sharing-options-for-students-using-App-Lab-Game-Lab-and-Web-Lab';

class SharingControlActionsHeaderCell extends Component {
  static propTypes = {
    handleShareSetting: PropTypes.func,
  };

  onEnableAll = () => {
    this.props.handleShareSetting(false);
  };

  onDisableAll = () => {
    this.props.handleShareSetting(true);
  };

  onLearnMore = () => {
    window.open(LEARN_MORE_URL, '_blank', 'noopener,noreferrer');
  };

  render() {
    const options = [
      {
        value: 'enable-all-sharing',
        label: i18n.projectSharingEnableAll(),
        icon: {iconName: 'circle-check'},
        onClick: this.onEnableAll,
      },
      {
        value: 'disable-all-sharing',
        label: i18n.projectSharingDisableAll(),
        icon: {iconName: 'circle-xmark'},
        onClick: this.onDisableAll,
      },
      {
        value: 'learn-more-sharing',
        label: i18n.learnMore(),
        icon: {iconName: 'arrow-up-right-from-square'},
        onClick: this.onLearnMore,
      },
    ];

    return (
      <div>
        <ActionDropdown
          name="sharing-control-actions"
          labelText={i18n.actions()}
          size="s"
          menuPlacement="right"
          options={options}
          triggerButtonProps={{
            color: 'tertiary',
            variant: 'text',
            children: <FontAwesomeV6Icon iconName="gear" />,
          }}
        />
      </div>
    );
  }
}

export const UnconnectedSharingControlActionsHeaderCell =
  SharingControlActionsHeaderCell;

export default connect(
  state => ({}),
  dispatch => ({
    handleShareSetting(disable) {
      dispatch(handleShareSetting(disable));
    },
  })
)(SharingControlActionsHeaderCell);
