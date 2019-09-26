import React from 'react';
import {Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {PermissionPropType} from '../../permission';

export class SurveyRollupTable extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    permission: PermissionPropType.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table bordered>
        <thead>
          <tr>
            <th>Hello</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>World</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default SurveyRollupTable;
