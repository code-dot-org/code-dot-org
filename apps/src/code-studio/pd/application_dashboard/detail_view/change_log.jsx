import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap';

export default class ChangeLog extends React.Component {
  static propTypes = {
    changeLog: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        changing_user: PropTypes.string
      })
    ).isRequired
  };

  render() {
    return (
      <div>
        <h3>Timestamp log</h3>
        <Table style={styles.table} striped bordered>
          <tbody>
            {this.props.changeLog.map((entry, i) => (
              <tr key={i}>
                <td>{entry['time']}</td>
                <td>{entry['title']}</td>
                <td>
                  {entry['changing_user'] && (
                    <span>Status changed by {entry['changing_user']}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

const styles = {
  table: {
    marginTop: '20px',
    width: '80%'
  }
};
