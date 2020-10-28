import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import WorkshopPanel from './WorkshopPanel';
import ConfirmationDialog from '../components/confirmation_dialog';
import color from '@cdo/apps/util/color';

const warningStyle = {
  color: color.red,
  fontWeight: 'bold'
};

const earlyCloseWarning = (
  <div>
    <span style={warningStyle}>Warning: </span>There are still sessions
    remaining for this workshop. Once you end a workshop, attendance is locked.
    <br />
    <br />
    Are you sure you want to end this workshop now?
  </div>
);

const normalCloseWarning = (
  <div>
    Ending this workshop will close the attendance.
    <br />
    <br />
    Are you sure you want to end this workshop now?
  </div>
);

export default class EndWorkshopPanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    isReadyToClose: PropTypes.bool,
    loadWorkshop: PropTypes.func.isRequired
  };

  state = {
    showEndWorkshopConfirmation: false
  };

  componentWillUnmount() {
    if (this.endRequest) {
      this.endRequest.abort();
    }
  }

  handleEndWorkshopClick = () => {
    this.setState({showEndWorkshopConfirmation: true});
  };

  handleEndWorkshopCancel = () => {
    this.setState({showEndWorkshopConfirmation: false});
  };

  handleEndWorkshopConfirmed = () => {
    const {workshopId, loadWorkshop} = this.props;

    this.endRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${workshopId}/end`,
      dataType: 'json'
    })
      .done(() => {
        this.setState({showEndWorkshopConfirmation: false});
        loadWorkshop();
      })
      .fail(data => {
        if (data.statusText !== 'abort') {
          console.log(`Failed to end workshop: ${workshopId}`);
          alert(
            "We're sorry, we were unable to end the workshop. Please try again."
          );
        }
      })
      .always(() => {
        this.endRequest = null;
      });
  };

  render() {
    const {isReadyToClose} = this.props;
    return (
      <WorkshopPanel header="End Workshop:">
        <div>
          <p>After the last day of your workshop, you must end the workshop.</p>
          <Button onClick={this.handleEndWorkshopClick}>End Workshop</Button>
          <ConfirmationDialog
            show={this.state.showEndWorkshopConfirmation}
            onOk={this.handleEndWorkshopConfirmed}
            okText={'Yes, end this workshop'}
            onCancel={this.handleEndWorkshopCancel}
            headerText="End workshop"
            bodyText={isReadyToClose ? normalCloseWarning : earlyCloseWarning}
            width={isReadyToClose ? 500 : 800}
          />
        </div>
      </WorkshopPanel>
    );
  }
}
