import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import BootstrapButton from './BootstrapButton';
import {connect} from 'react-redux';
import RailsAuthenticityToken from '../../util/RailsAuthenticityToken';
import {OAuthProviders} from '@cdo/apps/lib/ui/accounts/constants';
import {isCodeOrgBrowser} from '@cdo/apps/lib/kits/maker/util/browserChecks';

export const ENCRYPTED = `*** ${i18n.encrypted()} ***`;
const authOptionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  credentialType: PropTypes.string.isRequired,
  email: PropTypes.string,
  error: PropTypes.string
});
const EMPTY_AUTH_OPTION = {
  credentialType: '',
  email: '',
  error: ''
};
const DISCONNECT_DISABLED_STATUS = {
  ROSTER_SECTION: 'rosterSection',
  NO_LOGIN_OPTIONS: 'noLoginOptions'
};

class ManageLinkedAccounts extends React.Component {
  static propTypes = {
    // Provided by redux
    authenticationOptions: PropTypes.objectOf(authOptionPropType),
    userHasPassword: PropTypes.bool.isRequired,
    isGoogleClassroomStudent: PropTypes.bool.isRequired,
    isCleverStudent: PropTypes.bool.isRequired
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
      credentialType: provider
    };
  };

  formatAuthOptions = () => {
    const allOptions = Object.values(this.props.authenticationOptions);
    const optionsByProvider = _.groupBy(allOptions, 'credentialType');

    let formattedOptions = [];
    Object.values(OAuthProviders).forEach(provider => {
      const providerOptions = optionsByProvider[provider] || [
        this.emptyAuthOption(provider)
      ];
      formattedOptions = formattedOptions.concat(providerOptions);
    });
    return formattedOptions;
  };

  render() {
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
            {this.formatAuthOptions().map(option => {
              return (
                <OauthConnection
                  key={option.id || _.uniqueId('empty_')}
                  displayName={this.getDisplayName(option.credentialType)}
                  id={option.id}
                  email={this.formatEmail(option)}
                  credentialType={option.credentialType}
                  disconnectDisabledStatus={
                    option.id ? this.disconnectDisabledStatus(option) : null
                  }
                  error={option.error}
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
  userHasPassword: state.manageLinkedAccounts.userHasPassword,
  isGoogleClassroomStudent: state.manageLinkedAccounts.isGoogleClassroomStudent,
  isCleverStudent: state.manageLinkedAccounts.isCleverStudent
}))(ManageLinkedAccounts);

class OauthConnection extends React.Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    id: PropTypes.number,
    credentialType: PropTypes.string.isRequired,
    email: PropTypes.string,
    disconnectDisabledStatus: PropTypes.string,
    error: PropTypes.string
  };

  getDisconnectDisabledTooltip = () => {
    switch (this.props.disconnectDisabledStatus) {
      case DISCONNECT_DISABLED_STATUS.ROSTER_SECTION:
        return i18n.manageLinkedAccounts_rosteredSectionTooltip();
      case DISCONNECT_DISABLED_STATUS.NO_LOGIN_OPTIONS:
        return i18n.manageLinkedAccounts_noLoginTooltip();
      default:
        return null;
    }
  };

  render() {
    const {
      credentialType,
      disconnectDisabledStatus,
      displayName,
      id,
      email,
      error
    } = this.props;
    // if given an email, we are already connected to this provider and should
    // present the option to disconnect. Otherwise, we should present the
    // option to connect.
    const isConnected = !!email;
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

    // There are two causes for errors: disconnectDisabledStatus and logging in to
    // Google from the Maker App. Set the appropriate error text.
    let disconnectDisabledMessage;
    if (isCodeOrgBrowser() && credentialType === OAuthProviders.google) {
      disconnectDisabledMessage = i18n.manageLinkedAccounts_makerAuthError();
    } else if (!!disconnectDisabledStatus) {
      disconnectDisabledMessage = this.getDisconnectDisabledTooltip();
    }

    return (
      <tr>
        <td style={styles.cell}>{displayName}</td>
        <td style={emailStyles}>
          {email || i18n.manageLinkedAccounts_notConnected()}
        </td>
        <td style={styles.cell}>
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
                disabled={!!disconnectDisabledMessage}
              />
              <RailsAuthenticityToken />
            </form>
            {!!disconnectDisabledMessage && (
              <ReactTooltip
                id={tooltipId}
                offset={styles.tooltipOffset}
                role="tooltip"
                effect="solid"
              >
                <div style={styles.tooltip}> {disconnectDisabledMessage} </div>
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
  container: {
    paddingTop: GUTTER
  },
  header: {
    fontSize: 22
  },
  table: {
    ...tableLayoutStyles.table,
    marginTop: GUTTER
  },
  headerCell: {
    ...tableLayoutStyles.headerCell,
    paddingLeft: GUTTER,
    paddingRight: GUTTER,
    fontWeight: 'normal',
    width: CELL_WIDTH
  },
  cell: {
    ...tableLayoutStyles.cell,
    paddingLeft: GUTTER,
    paddingRight: GUTTER
  },
  emptyEmailCell: {
    color: color.light_gray,
    fontStyle: 'italic'
  },
  button: {
    width: BUTTON_WIDTH,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    padding: BUTTON_PADDING
  },
  tooltipOffset: {
    left:
      CELL_WIDTH / 2 - // This moves the tooltip to be in between the 2nd and 3rd columns of the table
      (tableLayoutStyles.cell.padding + BUTTON_PADDING + BUTTON_WIDTH / 2) // This centers the tooltip over the button in the 3rd column
  },
  tooltip: {
    width: BUTTON_WIDTH * 2
  },
  error: {
    paddingLeft: GUTTER / 2,
    color: color.red,
    fontStyle: 'italic'
  },
  noMargin: {
    margin: 0
  }
};
