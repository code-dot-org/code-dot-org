import React, {PropTypes} from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles} from "@cdo/apps/templates/tables/tableConstants";
import BootstrapButton from './BootstrapButton';
import {connect} from 'react-redux';
import {disconnect} from './manageLinkedAccountsRedux';

const OAUTH_PROVIDERS = {
  GOOGLE: 'google_oauth2',
  MICROSOFT: 'windowslive',
  CLEVER: 'clever',
  FACEBOOK: 'facebook',
};
export const ENCRYPTED = `*** ${i18n.encrypted()} ***`;
const authOptionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  credentialType: PropTypes.string.isRequired,
  email: PropTypes.string,
  error: PropTypes.string,
  isConnecting: PropTypes.bool,
  isDisconnecting: PropTypes.bool,
});
const EMPTY_AUTH_OPTION = {
  credentialType: '',
  email: '',
  error: '',
  isConnecting: false,
  isDisconnecting: false,
};

class ManageLinkedAccounts extends React.Component {
  static propTypes = {
    // Provided by redux
    authenticationOptions: PropTypes.objectOf(authOptionPropType),
    userType: PropTypes.string.isRequired,
    userHasPassword: PropTypes.bool.isRequired,
    isGoogleClassroomStudent: PropTypes.bool.isRequired,
    isCleverStudent: PropTypes.bool.isRequired,
    disconnect: PropTypes.func.isRequired,
  };

  connect = (provider) => {
    navigateToHref(`/users/auth/${provider}/connect`);
  };

  getAuthenticationOption = (provider) => {
    const {authenticationOptions} = this.props;
    const id = Object.keys(authenticationOptions).find(id => {
      return authenticationOptions[id].credentialType === provider;
    });
    return authenticationOptions[id];
  };

  hasAuthOption = (provider) => {
    return this.getAuthenticationOption(provider) !== undefined;
  };

  toggleProvider = (id, provider) => {
    if (id) {
      this.props.disconnect(id);
    } else {
      this.connect(provider);
    }
  };

  cannotDisconnectGoogle = () => {
    const {isGoogleClassroomStudent} = this.props;
    const cannotDisconnect = this.hasAuthOption(OAUTH_PROVIDERS.GOOGLE) ? isGoogleClassroomStudent : false;
    return cannotDisconnect;
  };

  cannotDisconnectClever = () => {
    const {isCleverStudent} = this.props;
    const cannotDisconnect = this.hasAuthOption(OAUTH_PROVIDERS.CLEVER) ? isCleverStudent : false;
    return cannotDisconnect;
  };

  cannotDisconnect = (provider) => {
    const {authenticationOptions, userHasPassword} = this.props;
    const otherAuthOptions = _.reject(authenticationOptions, option => option.credentialType === provider);
    const otherOptionIsEmail = otherAuthOptions.length === 1 && otherAuthOptions[0].credentialType === 'email';

    if (!this.hasAuthOption(provider)) {
      // If not connected to this provider, return early
      return false;
    } else if (provider === OAUTH_PROVIDERS.GOOGLE && this.cannotDisconnectGoogle()) {
      // Cannot disconnect from Google if student is in a Google Classroom section
      return true;
    } else if (provider === OAUTH_PROVIDERS.CLEVER && this.cannotDisconnectClever()) {
      // Cannot disconnect from Clever if student is in a Clever section
      return true;
    } else if (otherAuthOptions.length === 0) {
      // If it's the user's last authentication option
      return true;
    } else if (otherOptionIsEmail && !userHasPassword) {
      // If the user's only other authentication option is an email address, a password is required to disconnect
      return true;
    } else {
      return false;
    }
  };

  getDisplayName = (provider) => {
    switch (provider) {
      case OAUTH_PROVIDERS.GOOGLE:
        return i18n.manageLinkedAccounts_google_oauth2();
      case OAUTH_PROVIDERS.MICROSOFT:
        return i18n.manageLinkedAccounts_microsoft();
      case OAUTH_PROVIDERS.CLEVER:
        return i18n.manageLinkedAccounts_clever();
      case OAUTH_PROVIDERS.FACEBOOK:
        return i18n.manageLinkedAccounts_facebook();
    }
  };

  formatEmail = (authOption) => {
    // Always display 'encrypted' if email is not recorded for connected authentication option
    if (authOption.id) {
      return authOption.email || ENCRYPTED;
    }
    return null;
  };

  emptyAuthOption = (provider) => {
    return {
      ...EMPTY_AUTH_OPTION,
      credentialType: provider
    };
  };

  formatAuthOptions = () => {
    const allOptions = Object.values(this.props.authenticationOptions);
    const optionsByProvider = _.groupBy(allOptions, 'credentialType');

    let formattedOptions = [];
    Object.values(OAUTH_PROVIDERS).forEach(provider => {
      const providerOptions = optionsByProvider[provider] || [this.emptyAuthOption(provider)];
      formattedOptions = formattedOptions.concat(providerOptions);
    });
    return formattedOptions;
  };

  render() {
    return (
      <div style={styles.container}>
        <hr/>
        <h2 style={styles.header}>{i18n.manageLinkedAccounts()}</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.headerCell}>{i18n.manageLinkedAccounts_loginType()}</th>
              <th style={styles.headerCell}>{i18n.manageLinkedAccounts_emailAddress()}</th>
              <th style={styles.headerCell}>{i18n.manageLinkedAccounts_actions()}</th>
            </tr>
          </thead>
          <tbody>
            {this.formatAuthOptions().map(option => {
              return (
                <OauthConnection
                  key={option.id || _.uniqueId()}
                  displayName={this.getDisplayName(option.credentialType)}
                  email={this.formatEmail(option)}
                  onClick={() => this.toggleProvider(option.id, option.credentialType)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export const UnconnectedManageLinkedAccounts = ManageLinkedAccounts;

export default connect(state => ({
  authenticationOptions: state.manageLinkedAccounts.authenticationOptions,
  userType: state.manageLinkedAccounts.userType,
  userHasPassword: state.manageLinkedAccounts.userHasPassword,
  isGoogleClassroomStudent: state.manageLinkedAccounts.isGoogleClassroomStudent,
  isCleverStudent: state.manageLinkedAccounts.isCleverStudent,
}), dispatch => ({
  disconnect(id) {
    dispatch(disconnect(id));
  }
}))(ManageLinkedAccounts);

class OauthConnection extends React.Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    email: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    cannotDisconnect: PropTypes.bool
  };

  render() {
    const {displayName, email, onClick, cannotDisconnect} = this.props;
    const emailStyles = !!email ? styles.cell : {...styles.cell, ...styles.emptyEmailCell};
    const buttonText = !!email ?
      i18n.manageLinkedAccounts_disconnect() :
      i18n.manageLinkedAccounts_connect();
    const tooltipId = _.uniqueId();

    return (
      <tr>
        <td style={styles.cell}>
          {displayName}
        </td>
        <td style={emailStyles}>
          {email || i18n.manageLinkedAccounts_notConnected()}
        </td>
        <td style={styles.cell}>
          <span
            data-for={tooltipId}
            data-tip
          >
            {/* This button intentionally uses BootstrapButton to match other account page buttons */}
            <BootstrapButton
              style={styles.button}
              text={buttonText}
              onClick={onClick}
              disabled={cannotDisconnect}
            />
            {cannotDisconnect &&
              <ReactTooltip
                id={tooltipId}
                offset={styles.tooltipOffset}
                role="tooltip"
                effect="solid"
              >
                <div style={styles.tooltip}>
                  {i18n.manageLinkedAccounts_cannotDisconnectTooltip()}
                </div>
              </ReactTooltip>
            }
          </span>
        </td>
      </tr>
    );
  }
}

const GUTTER = 20;
const BUTTON_WIDTH = 105;
const styles = {
  container: {
    paddingTop: GUTTER,
  },
  header: {
    fontSize: 22,
  },
  table: {
    ...tableLayoutStyles.table,
    marginTop: GUTTER,
  },
  headerCell: {
    ...tableLayoutStyles.headerCell,
    paddingLeft: GUTTER,
    paddingRight: GUTTER,
    fontWeight: 'normal',
    width: tableLayoutStyles.table.width / 3,
  },
  cell: {
    ...tableLayoutStyles.cell,
    paddingLeft: GUTTER,
    paddingRight: GUTTER,
  },
  emptyEmailCell: {
    color: color.light_gray,
    fontStyle: 'italic',
  },
  button: {
    width: BUTTON_WIDTH,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    padding: 8,
  },
  tooltipOffset: {
    left: -(BUTTON_WIDTH / 2)
  },
  tooltip: {
    width: BUTTON_WIDTH * 2
  },
};
