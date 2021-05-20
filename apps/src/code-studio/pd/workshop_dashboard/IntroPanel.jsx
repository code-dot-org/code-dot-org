import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Button} from 'react-bootstrap';
import ConfirmationDialog from '../components/confirmation_dialog';
import WorkshopPanel from './WorkshopPanel';

/**
 * Panel near the top of the workshop view that gives the current state of
 * the workshop and appropriate controls for advancing the state of the workshop.
 */
export default class IntroPanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    workshopState: PropTypes.string,
    sessions: PropTypes.array,
    isAccountRequiredForAttendance: PropTypes.bool,
    isWorkshopAdmin: PropTypes.bool,
    loadWorkshop: PropTypes.func.isRequired
  };

  state = {
    pendingAdminAction: null,
    showStartWorkshopConfirmation: false
  };

  componentWillUnmount() {
    if (this.adminActionRequest) {
      this.adminActionRequest.abort();
    }
    if (this.startRequest) {
      this.startRequest.abort();
    }
  }
  handleAdminActionClick = action =>
    this.setState({pendingAdminAction: action});

  handleAdminActionCancel = () => this.setState({pendingAdminAction: null});

  handleAdminActionConfirmed = () => {
    const {workshopId, loadWorkshop} = this.props;
    const action = this.state.pendingAdminAction;
    this.setState({pendingAdminAction: null});
    this.adminActionRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${workshopId}/${action}`,
      dataType: 'json'
    })
      .done(loadWorkshop)
      .fail(data => {
        if (data.statusText !== 'abort') {
          console.log(`Failed to ${action} workshop: ${workshopId}`);
          alert(
            `We're sorry, we were unable to ${action} the workshop. Please try again.`
          );
        }
      })
      .always(() => {
        this.adminActionRequest = null;
      });
  };

  handleStartWorkshopClick = () => {
    this.setState({showStartWorkshopConfirmation: true});
  };

  handleStartWorkshopCancel = () => {
    this.setState({showStartWorkshopConfirmation: false});
  };

  handleStartWorkshopConfirmed = () => {
    const {workshopId, loadWorkshop} = this.props;
    this.startRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${workshopId}/start`,
      dataType: 'json'
    })
      .done(() => {
        this.setState({showStartWorkshopConfirmation: false});
        loadWorkshop();
      })
      .fail(data => {
        if (data.statusText !== 'abort') {
          console.log(`Failed to start workshop: ${workshopId}`);
          alert(
            "We're sorry, we were unable to start the workshop. Please try again."
          );
        }
      })
      .always(() => {
        this.startRequest = null;
      });
  };

  renderAdminActionButton() {
    const {workshopState} = this.props;
    let action = undefined;
    switch (workshopState) {
      case 'In Progress':
        action = 'Unstart';
        break;
      case 'Ended':
        action = 'Reopen';
        break;
      default:
        return;
    }

    if (this.state.pendingAdminAction) {
      let bodyText;
      if (this.state.pendingAdminAction === 'unstart') {
        bodyText = `Are you sure you want to unstart this workshop and change it back to "Not Started?"`;
      } else if (this.state.pendingAdminAction === 'reopen') {
        bodyText = `Are you sure you want to reopen this workshop and change it back to "In Progress"?
          Note reopening then ending again will send exit survey emails for new attendees,
          but will not re-send surveys that were already sent.
          `;
      }
      return (
        <ConfirmationDialog
          show={true}
          onOk={this.handleAdminActionConfirmed}
          onCancel={this.handleAdminActionCancel}
          headerText={`${action} Workshop?`}
          bodyText={bodyText}
        />
      );
    }

    return (
      <Button
        onClick={() => this.handleAdminActionClick(action.toLowerCase())}
        bsSize="xsmall"
        style={{float: 'right'}}
      >
        {action} (admin)
      </Button>
    );
  }

  render() {
    const {
      workshopId,
      workshopState,
      sessions,
      isAccountRequiredForAttendance,
      isWorkshopAdmin
    } = this.props;
    const header = (
      <div>
        Workshop State: {workshopState}
        {isWorkshopAdmin && this.renderAdminActionButton()}
      </div>
    );

    let contents = null;

    switch (workshopState) {
      case 'Not Started': {
        const firstSessionStart = sessions[0].start;
        let buttonClass = null;
        if (moment().isSame(moment.utc(firstSessionStart), 'day')) {
          buttonClass = 'btn-orange';
        }
        contents = (
          <div>
            <p>
              On the day of your workshop, click the Start Workshop button
              below.
            </p>
            <Button
              onClick={this.handleStartWorkshopClick}
              className={buttonClass}
            >
              Start Workshop
            </Button>
            <ConfirmationDialog
              show={this.state.showStartWorkshopConfirmation}
              onOk={this.handleStartWorkshopConfirmed}
              onCancel={this.handleStartWorkshopCancel}
              headerText="Start Workshop"
              bodyText="Are you sure you want to start this workshop?"
            />
          </div>
        );
        break;
      }
      case 'In Progress': {
        if (isAccountRequiredForAttendance) {
          contents = (
            <div>
              <p>
                On the day of the workshop, ask workshop attendees to follow the
                steps:
              </p>
              <h4>Step 1: Sign into Code Studio</h4>
              <p>
                Tell teachers to sign into their Code Studio accounts. If they
                do not already have an account tell them to create one by going
                to{' '}
                <a
                  href={location.origin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {location.origin}
                </a>
              </p>
              <h4>Step 2: Take attendance</h4>
              <p>
                After teachers have signed into their Code Studio accounts, use
                the attendance links below to take attendance.
              </p>
            </div>
          );
        } else {
          // account not required
          const signupUrl = `${
            location.origin
          }/pd/workshops/${workshopId}/enroll`;
          contents = (
            <div>
              <p>
                On the day of the workshop, ask workshop attendees to register
                if they haven't already:
              </p>
              <p>
                <a href={signupUrl} target="_blank" rel="noopener noreferrer">
                  {signupUrl}
                </a>
              </p>
            </div>
          );
        }
        break;
      }
      default:
        contents = (
          <div>
            <p>We hope you had a great workshop!</p>
            <p>
              Teachers will receive an email with survey link from{' '}
              <a href="mailto:survey@code.org">survey@code.org</a>. If they do
              not receive the link ask them to check their spam. Many school
              districts block outside emails. You can also recommend they set
              hadi_partovi and any other @code.org addresses to their contacts
              or safe senders list, so they don't miss out on future emails.
              Lastly, they can check to make sure the email went to the correct
              email address by logging into their Code Studio account,
              navigating to the 'my account' page via the top right corner to
              confirm their email address was typed correctly when they first
              created the account.
            </p>
            <p>
              If they still can’t find the email, have them email{' '}
              <a href="mailto:support@code.org">support@code.org</a> and we will
              help them.
            </p>
          </div>
        );
    }

    return <WorkshopPanel header={header}>{contents}</WorkshopPanel>;
  }
}
