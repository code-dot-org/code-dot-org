import React from 'react';
import i18n from '@cdo/locale';

export default class ManageLinkedAccounts extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <hr/>
        <h2 style={styles.header}>
          {i18n.manageLinkedAccounts()}
        </h2>
      </div>
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
