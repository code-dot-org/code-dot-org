import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';

export default class MoveEnrollmentsDialog extends React.Component {
  static propTypes = {
    selectedEnrollments: PropTypes.array
  };

  render() {
    return (
      <Dialog title="Move Enrollments">
        <Body>Move EM!</Body>
      </Dialog>
    );
  }
}
