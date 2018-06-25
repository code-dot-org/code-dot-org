import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import Button from "../../../templates/Button";

export default class ManageLinkedAccounts extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <hr/>
        <h2 style={styles.header}>
          {i18n.manageLinkedAccounts()}
        </h2>
        <table>
          <thead>
            <tr>
              <th>{i18n.manageLinkedAccounts_loginType()}</th>
              <th>{i18n.manageLinkedAccounts_emailAddress()}</th>
              <th>{i18n.manageLinkedAccounts_actions()}</th>
            </tr>
          </thead>
          <tbody>
            <GoogleRow
              email={'brad@code.org'}
            />
            <GoogleRow
              email={'*** encrypted ***'}
            />
            <GoogleRow
              email={undefined}
            />
            <GoogleRow
              email={'brad@code.org'}
              cannotDisconnect
            />
          </tbody>
        </table>
      </div>
    );
  }
}

class GoogleRow extends React.Component {
  static propTypes = {
    email: PropTypes.string,
    cannotDisconnect: PropTypes.bool
  };

  render() {
    const {email, cannotDisconnect} = this.props;
    const buttonText = !!email ?
      i18n.manageLinkedAccounts_disconnect() :
      i18n.manageLinkedAccounts_connect();
    return (
      <tr>
        <td>{i18n.manageLinkedAccounts_google_oauth2()}</td>
        <td>{email || i18n.manageLinkedAccounts_notConnected()}</td>
        <td>
          <Button
            text={buttonText}
            onClick={() => {}}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
            disabled={cannotDisconnect}
          />
        </td>
      </tr>
    );
  }
}

const styles = {
  container: {
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
  },
};
