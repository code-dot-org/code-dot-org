import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import fontConstants from '@cdo/apps/fontConstants';
import {OAuthProviders} from '@cdo/apps/lib/ui/accounts/constants';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import RailsAuthenticityToken from '../../util/RailsAuthenticityToken';

import BootstrapButton from './BootstrapButton';
import lockImage from './images/lock.svg';

export const ENCRYPTED = `*** ${i18n.encrypted()} ***`;
const authOptionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  credentialType: PropTypes.string.isRequired,
  email: PropTypes.string,
  error: PropTypes.string,
});
const EMPTY_AUTH_OPTION = {
  credentialType: '',
  email: '',
  error: '',
};
const CONNECT_DISABLED_STATUS = {
  PARENTAL_PERMISSION_REQUIRED: 'parentalPermissionRequired',
};
const DISCONNECT_DISABLED_STATUS = {
  ROSTER_SECTION: 'rosterSection',
  NO_LOGIN_OPTIONS: 'noLoginOptions',
};

const PERSONAL_LOGIN_TYPES = [
  OAuthProviders.google,
  OAuthProviders.microsoft,
  OAuthProviders.facebook,
];

class ManageLinkedAccounts extends React.Component {
  static propTypes = {
    // Provided by redux
    authenticationOptions: PropTypes.objectOf(authOptionPropType),
    userHasPassword: PropTypes.bool.isRequired,
    isGoogleClassroomStudent: PropTypes.bool.isRequired,
    isCleverStudent: PropTypes.bool.isRequired,
    personalAccountLinkingEnabled: PropTypes.bool.isRequired,
    usStateCode: PropTypes.string,
  };

  cannotDisconnectGoogle = authOption => {
    return (
      authOption.credentialType === OAuthProviders.google &&
      this.props.isGoogleClassroomStudent
    );
  };

  cannotDisconnectClever = authOption => {
    return (
      authOption.credentialType === OAuthProviders.clever &&
      this.props.isCleverStudent
    );
  };

  // Given an array of authentication options, returns a boolean indicating whether or not the user can log in
  userHasLoginOption = authOptions => {
    // If it's the user's last authentication option or all of the user's authentication options are email addresses,
    // a password is required to log in
    const allEmailOptions = _.every(authOptions, ['credentialType', 'email']);
    if (allEmailOptions) {
      return this.props.userHasPassword;
    }

    // All other options must be OAuth, so user has login option
    return true;
  };

  // Disable the connect button when all conditions apply:
  // - We consider the login type a 'personal login'
  // - It isn't already connected (it doesn't have an id/email assigned)
  // - We have personal account linking disabled
  shouldDisableConnectButton = authOption => {
    return (
      PERSONAL_LOGIN_TYPES.includes(authOption.credentialType) &&
      !authOption.id &&
      !this.props.personalAccountLinkingEnabled
    );
  };

  disconnectDisabledStatus = authOption => {
    // Cannot disconnect from Google or Clever if student is in a Google Classroom or Clever section
    if (
      this.cannotDisconnectGoogle(authOption) ||
      this.cannotDisconnectClever(authOption)
    ) {
      return DISCONNECT_DISABLED_STATUS.ROSTER_SECTION;
    }

    // Make sure user has another way to log in if authOption is disconnected
    const otherAuthOptions = Object.values(
      this.props.authenticationOptions
    ).filter(option => {
      return option.id !== authOption.id;
    });
    if (!this.userHasLoginOption(otherAuthOptions)) {
      return DISCONNECT_DISABLED_STATUS.NO_LOGIN_OPTIONS;
    }
  };

  connectDisabledStatus = authOption => {
    // When the policy status disables the button, that's a particular state
    if (this.shouldDisableConnectButton(authOption)) {
      return CONNECT_DISABLED_STATUS.PARENTAL_PERMISSION_REQUIRED;
    }
  };

  disabledStatus = authOption => {
    return authOption.id
      ? this.disconnectDisabledStatus(authOption)
      : this.connectDisabledStatus(authOption);
  };

  getDisplayName = provider => {
    switch (provider) {
      case OAuthProviders.google:
        return i18n.manageLinkedAccounts_google_oauth2();
      case OAuthProviders.microsoft:
        return i18n.manageLinkedAccounts_microsoft();
      case OAuthProviders.clever:
        return i18n.manageLinkedAccounts_clever();
      case OAuthProviders.facebook:
        return i18n.manageLinkedAccounts_facebook();
    }
  };

  formatEmail = authOption => {
    // Always display 'encrypted' if email is not recorded for connected authentication option
    // (i.e., students or clever accounts)
    if (authOption.id) {
      return authOption.email || ENCRYPTED;
    }
    return null;
  };

  emptyAuthOption = provider => {
    return {
      ...EMPTY_AUTH_OPTION,
      credentialType: provider,
    };
  };

  formatAuthOptions = () => {
    const allOptions = Object.values(this.props.authenticationOptions);
    const optionsByProvider = _.groupBy(allOptions, 'credentialType');

    let formattedOptions = [];
    Object.values(OAuthProviders).forEach(provider => {
      const providerOptions = optionsByProvider[provider] || [
        this.emptyAuthOption(provider),
      ];
      formattedOptions = formattedOptions.concat(providerOptions);
    });
    return formattedOptions;
  };

  renderAuthOption = authOption => {
    return (
      <OauthConnection
        key={authOption.id || _.uniqueId('empty_')}
        displayName={this.getDisplayName(authOption.credentialType)}
        id={authOption.id}
        email={this.formatEmail(authOption)}
        credentialType={authOption.credentialType}
        disabledStatus={this.disabledStatus(authOption)}
        error={authOption.error}
        personalAccountLinkingEnabled={this.props.personalAccountLinkingEnabled}
      />
    );
  };

  render() {
    const [lockedOptions, unlockedOptions] = _.partition(
      this.formatAuthOptions(),
      this.shouldDisableConnectButton
    );
    return (
      <div style={styles.container}>
        <hr />
        <h2 style={styles.header}>{i18n.manageLinkedAccounts()}</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.headerCell}>
                {i18n.manageLinkedAccounts_loginType()}
              </th>
              <th style={styles.headerCell}>
                {i18n.manageLinkedAccounts_emailAddress()}
              </th>
              <th style={styles.headerCell}>
                {i18n.manageLinkedAccounts_actions()}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* The options that are always available. */}
            {unlockedOptions.map(this.renderAuthOption)}
          </tbody>
        </table>
        {lockedOptions.length > 0 && (
          <>
            <p style={styles.message}>
              {this.props.usStateCode
                ? i18n.manageLinkedAccounts_parentalPermissionRequired()
                : i18n.manageLinkedAccounts_stateRequired()}
            </p>
            <div style={styles.lockContainer}>
              <table style={{...styles.table, ...styles.lockedTable}}>
                <thead>
                  <tr>
                    <th
                      style={{...styles.headerCell, ...styles.headerCellLocked}}
                    >
                      {i18n.manageLinkedAccounts_loginType()}
                    </th>
                    <th
                      style={{...styles.headerCell, ...styles.headerCellLocked}}
                    >
                      {i18n.manageLinkedAccounts_emailAddress()}
                    </th>
                    <th
                      style={{...styles.headerCell, ...styles.headerCellLocked}}
                    >
                      {i18n.manageLinkedAccounts_actions()}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* The options that could be locked by account policy. */}
                  {lockedOptions.map(this.renderAuthOption)}
                </tbody>
              </table>
              <div aria-hidden="true" style={styles.lockSection}>
                <img alt="" style={styles.lockImage} src={lockImage} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export const UnconnectedManageLinkedAccounts = ManageLinkedAccounts;

export default connect(state => ({
  authenticationOptions: state.manageLinkedAccounts.authenticationOptions,
  userHasPassword: state.manageLinkedAccounts.userHasPassword,
  isGoogleClassroomStudent: state.manageLinkedAccounts.isGoogleClassroomStudent,
  isCleverStudent: state.manageLinkedAccounts.isCleverStudent,
  personalAccountLinkingEnabled:
    state.manageLinkedAccounts.personalAccountLinkingEnabled,
  usStateCode: state.currentUser.usStateCode,
}))(ManageLinkedAccounts);

class OauthConnection extends React.Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    id: PropTypes.number,
    credentialType: PropTypes.string.isRequired,
    email: PropTypes.string,
    disabledStatus: PropTypes.string,
    error: PropTypes.string,
    personalAccountLinkingEnabled: PropTypes.bool.isRequired,
  };

  getDisabledTooltip = () => {
    switch (this.props.disabledStatus) {
      case DISCONNECT_DISABLED_STATUS.ROSTER_SECTION:
        return i18n.manageLinkedAccounts_rosteredSectionTooltip();
      case DISCONNECT_DISABLED_STATUS.NO_LOGIN_OPTIONS:
        return i18n.manageLinkedAccounts_noLoginTooltip();
      case CONNECT_DISABLED_STATUS.PARENTAL_PERMISSION_REQUIRED:
        return i18n.manageLinkedAccounts_parentalPermissionRequired();
      default:
        return null;
    }
  };

  render() {
    const {credentialType, disabledStatus, displayName, id, email, error} =
      this.props;
    // if given an email, we are already connected to this provider and should
    // present the option to disconnect. Otherwise, we should present the
    // option to connect.
    const isConnected = !!email;
    const cellStyles = !disabledStatus
      ? styles.cell
      : {...styles.cell, ...styles.cellLocked};
    const emailStyles = isConnected
      ? styles.cell
      : {...styles.cell, ...styles.emptyEmailCell};
    const buttonText = isConnected
      ? i18n.manageLinkedAccounts_disconnect()
      : i18n.manageLinkedAccounts_connect();
    const tooltipId = _.uniqueId();

    const oauthToggleConnectionPath = isConnected
      ? `/users/auth/${id}/disconnect`
      : `/users/auth/${credentialType}?action=connect`;

    // There are two causes for errors: disabledStatus and logging in to
    // Google from the Maker App. Set the appropriate error text.
    let disabledMessage;
    if (!!disabledStatus) {
      disabledMessage = this.getDisabledTooltip();
    }

    return (
      <tr>
        <td style={cellStyles}>{displayName}</td>
        <td style={emailStyles}>
          {email || i18n.manageLinkedAccounts_notConnected()}
        </td>
        <td style={cellStyles}>
          <div data-for={tooltipId} data-tip>
            <form
              style={styles.noMargin}
              method="POST"
              action={oauthToggleConnectionPath}
            >
              {/* This button intentionally uses BootstrapButton to match other
                  account page buttons.
                  This button is disabled according to disconnectDisabledStatus or
                  when the user is attempting this action from the Maker App for
                  their Google Account. This action is blocked due to Google authentication
                  security protocols.
                  */}
              <BootstrapButton
                type="submit"
                style={styles.button}
                text={buttonText}
                disabled={!!disabledMessage}
              />
              <RailsAuthenticityToken />
            </form>
            {!!disabledMessage && (
              <ReactTooltip
                id={tooltipId}
                offset={styles.tooltipOffset}
                role="tooltip"
                effect="solid"
              >
                <div style={styles.tooltip}> {disabledMessage} </div>
              </ReactTooltip>
            )}
          </div>
          {error && <span style={styles.error}>{error}</span>}
        </td>
      </tr>
    );
  }
}

const GUTTER = 20;
const BUTTON_WIDTH = 105;
const BUTTON_PADDING = 8;
const CELL_WIDTH = tableLayoutStyles.table.width / 3;
const styles = {
  header: {
    fontSize: 22,
  },
  table: {
    ...tableLayoutStyles.table,
    marginTop: GUTTER,
  },
  lockedTable: {
    marginTop: 0,
  },
  headerCell: {
    ...tableLayoutStyles.headerCell,
    paddingLeft: GUTTER,
    paddingRight: GUTTER,
    fontWeight: 'normal',
    width: CELL_WIDTH,
  },
  headerCellLocked: {
    color: color.light_gray,
  },
  cell: {
    ...tableLayoutStyles.cell,
    paddingLeft: GUTTER,
    paddingRight: GUTTER,
  },
  cellLocked: {
    color: color.light_gray,
  },
  emptyEmailCell: {
    color: color.light_gray,
    fontStyle: 'italic',
  },
  button: {
    width: BUTTON_WIDTH,
    ...fontConstants['main-font-semi-bold'],
    color: color.charcoal,
    padding: BUTTON_PADDING,
  },
  tooltipOffset: {
    left:
      CELL_WIDTH / 2 - // This moves the tooltip to be in between the 2nd and 3rd columns of the table
      (tableLayoutStyles.cell.padding + BUTTON_PADDING + BUTTON_WIDTH / 2), // This centers the tooltip over the button in the 3rd column
  },
  tooltip: {
    width: BUTTON_WIDTH * 2,
  },
  error: {
    paddingLeft: GUTTER / 2,
    color: color.red,
    fontStyle: 'italic',
  },
  message: {
    paddingTop: GUTTER,
  },
  lockContainer: {
    position: 'relative',
  },
  lockSection: {
    /* Cover the entire locked table */
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    /* Center the 'lock' image */
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    /* Allow the tooltip to appear over the button */
    pointerEvents: 'none',
  },
  lockImage: {
    width: '3rem',
    height: '3rem',
  },
  noMargin: {
    margin: 0,
  },
};
