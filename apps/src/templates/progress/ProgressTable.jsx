import React from 'react';

const styles = {
  table: {
    backgroundColor: '#F6F6F6',
    border: '1px solid #BBBBBB',
    borderRadius: 2
  },
  col1: {
    width: 200,
    marginLeft: 20,
    marginRight: 20
  }
};

const ProgressTable = React.createClass({
  render() {
    return (
      <table style={styles.table}>
        <thead>
          <tr>
            <td style={styles.col1}>Stage Name</td>
            <td>Your Progress</td>
          </tr>
        </thead>
      </table>
    );
  }
});

export default ProgressTable;
