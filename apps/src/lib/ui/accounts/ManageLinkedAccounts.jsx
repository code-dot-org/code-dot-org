import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles} from "@cdo/apps/templates/tables/tableConstants";
import Button from "@cdo/apps/templates/Button";

export default class ManageLinkedAccounts extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <hr/>
        <h2 style={styles.header}>
          {i18n.manageLinkedAccounts()}
        </h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.headerCell}>{i18n.manageLinkedAccounts_loginType()}</th>
              <th style={styles.headerCell}>{i18n.manageLinkedAccounts_emailAddress()}</th>
              <th style={styles.headerCell}>{i18n.manageLinkedAccounts_actions()}</th>
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
    const emailStyles = !!email ? styles.cell : {...styles.cell, ...styles.emptyEmailCell};
    const buttonText = !!email ?
      i18n.manageLinkedAccounts_disconnect() :
      i18n.manageLinkedAccounts_connect();
    return (
      <tr>
        <td style={styles.cell}>{i18n.manageLinkedAccounts_google_oauth2()}</td>
        <td style={emailStyles}>{email || i18n.manageLinkedAccounts_notConnected()}</td>
        <td style={styles.cell}>
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
};
