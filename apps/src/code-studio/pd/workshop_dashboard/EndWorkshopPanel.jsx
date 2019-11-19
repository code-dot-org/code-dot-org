import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import WorkshopPanel from './WorkshopPanel';
import ConfirmationDialog from '../components/confirmation_dialog';

export default class EndWorkshopPanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.string,
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
          <p>
            After the last day of your workshop, you must end the workshop. This
            will generate a report to Code.org as well as email teachers a
            survey regarding the workshop.
          </p>
          <Button onClick={this.handleEndWorkshopClick}>
            End Workshop and Send Survey
          </Button>
          <ConfirmationDialog
            show={this.state.showEndWorkshopConfirmation}
            onOk={this.handleEndWorkshopConfirmed}
            okText={isReadyToClose ? 'OK' : 'Yes, end this workshop'}
            onCancel={this.handleEndWorkshopCancel}
            headerText="End Workshop and Send Survey"
            bodyText={
              isReadyToClose
                ? 'Are you sure? Once ended, the workshop cannot be restarted.'
                : 'There are still sessions remaining in this workshop. ' +
                  'Once a workshop is ended, attendees can no longer mark themselves as attended for the remaining sessions. ' +
                  'Are you sure you want to end this workshop?'
            }
            width={isReadyToClose ? 500 : 800}
          />
        </div>
      </WorkshopPanel>
    );
  }
}
