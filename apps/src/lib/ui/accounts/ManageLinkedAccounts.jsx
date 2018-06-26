import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles} from "@cdo/apps/templates/tables/tableConstants";
import BootstrapButton from './BootstrapButton';

const OAUTH_PROVIDERS = {
  GOOGLE: 'google_oauth2',
  FACEBOOK: 'facebook',
  CLEVER: 'clever',
  MICROSOFT: 'microsoft',
};

export default class ManageLinkedAccounts extends React.Component {
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
            <OauthConnection
              type={OAUTH_PROVIDERS.GOOGLE}
              displayName={i18n.manageLinkedAccounts_google_oauth2()}
              email={'brad@code.org'}
              onClick={() => {}}
            />
            <OauthConnection
              type={OAUTH_PROVIDERS.MICROSOFT}
              displayName={i18n.manageLinkedAccounts_microsoft()}
              email={'*** encrypted ***'}
              onClick={() => {}}
            />
            <OauthConnection
              type={OAUTH_PROVIDERS.CLEVER}
              displayName={i18n.manageLinkedAccounts_clever()}
              email={undefined}
              onClick={() => {}}
            />
            <OauthConnection
              type={OAUTH_PROVIDERS.FACEBOOK}
              displayName={i18n.manageLinkedAccounts_facebook()}
              email={'brad@code.org'}
              onClick={() => {}}
              cannotDisconnect
            />
          </tbody>
        </table>
      </div>
    );
  }
}

class OauthConnection extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(Object.values(OAUTH_PROVIDERS)).isRequired,
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

    return (
      <tr>
        <td style={styles.cell}>
          {displayName}
        </td>
        <td style={emailStyles}>
          {email || i18n.manageLinkedAccounts_notConnected()}
        </td>
        <td style={styles.cell}>
          {/* This button intentionally uses BootstrapButton to match other account page buttons */}
          <BootstrapButton
            style={styles.button}
            text={buttonText}
            onClick={onClick}
            disabled={cannotDisconnect}
          />
        </td>
      </tr>
    );
  }
}

const GUTTER = 20;
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
    width: 105,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    padding: 8,
    margin: 0,
  },
};
