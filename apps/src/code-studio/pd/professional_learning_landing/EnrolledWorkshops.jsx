import PropTypes from 'prop-types';
import React from 'react';
import * as utils from '../../../utils';
import WorkshopTableLoader from '../workshop_dashboard/components/workshop_table_loader';
import {workshopShape} from '../workshop_dashboard/types.js';
import {Table, Button, Modal} from 'react-bootstrap';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import {
  DATE_FORMAT,
  TIME_FORMAT
} from '../workshop_dashboard/workshopConstants';

class EnrolledWorkshops extends React.Component {
  render() {
    return (
      <WorkshopTableLoader
        queryUrl="/api/v1/pd/workshops_user_enrolled_in"
        hideNoWorkshopsMessage={true}
      >
        <EnrolledWorkshopsTable />
      </WorkshopTableLoader>
    );
  }
}

class EnrolledWorkshopsTable extends React.Component {
  static propTypes = {
    workshops: PropTypes.arrayOf(workshopShape)
  };

  state = {
    showCancelModal: false,
    enrollmentCodeToCancel: undefined
  };

  cancelEnrollment = event => {
    window.location = `/pd/workshop_enrollment/${
      this.state.enrollmentCodeToCancel
    }/cancel`;
  };

  dismissCancelModal = event => {
    this.setState({
      showCancelModal: false,
      enrollmentCodeToCancel: undefined
    });
  };

  showCancelModal = enrollmentCode => {
    this.setState({
      showCancelModal: true,
      enrollmentCodeToCancel: enrollmentCode
    });
  };

  openCertificate = ({enrollment_code}) => {
    utils.windowOpen(`/pd/generate_workshop_certificate/${enrollment_code}`);
  };

  moreThanTenDaysUntilWorkshop = workshop_starting_date => {
    return moment(workshop_starting_date).diff(moment.now(), 'days') > 10;
  };

  renderPreWorkshopSurveyButton = workshop => {
    const preWorkshopSurveyButton = (
      <Button
        onClick={() => utils.windowOpen(workshop.pre_workshop_survey_url)}
        style={styles.button}
        disabled={this.moreThanTenDaysUntilWorkshop(
          workshop.workshop_starting_date
        )}
      >
        Complete pre-workshop survey
      </Button>
    );

    const surveyWaitMessage = `
      Workshop surveys can only be started 10 days prior to your workshop date.
    `;

    if (preWorkshopSurveyButton.props.disabled) {
      return (
        <div>
          <span data-tip={surveyWaitMessage} data-for="pre-survey-date-limit">
            {preWorkshopSurveyButton}
          </span>
          <ReactTooltip
            id="pre-survey-date-limit"
            effect="solid"
            delayShow={500}
          />
        </div>
      );
    } else {
      return preWorkshopSurveyButton;
    }
  };

  renderWorkshopActionButtons(workshop) {
    return (
      <div>
        {workshop.state === 'Not Started' &&
          workshop.pre_workshop_survey_url &&
          this.renderPreWorkshopSurveyButton(workshop)}
        {workshop.state === 'Ended' && (
          <Button
            onClick={() => this.openCertificate(workshop)}
            style={styles.button}
            disabled={!workshop.attended}
          >
            Print certificate
          </Button>
        )}
        <Button
          onClick={() =>
            utils.windowOpen(
              `/pd/workshop_enrollment/${workshop.enrollment_code}`
            )
          }
          style={styles.button}
        >
          Workshop details
        </Button>
        {workshop.state === 'Not Started' && (
          <Button
            onClick={() => this.showCancelModal(workshop.enrollment_code)}
            style={styles.button}
          >
            Cancel enrollment
          </Button>
        )}
      </div>
    );
  }

  renderWorkshopsTable() {
    const rows = this.props.workshops.map((workshop, i) => {
      return this.renderRowForWorkshop(workshop);
    });

    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th style={{width: '20%'}} />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }

  renderRowForWorkshop(workshop) {
    return (
      <tr key={workshop.id}>
        <td>
          {workshop.course}
          <br />
          {workshop.subject}
        </td>
        <td>
          {workshop.sessions.map((session, i) => {
            return (
              <p key={i}>{moment.utc(session.start).format(DATE_FORMAT)}</p>
            );
          })}
        </td>
        <td>
          {workshop.sessions.map((session, i) => {
            return (
              <p key={i}>
                {`${moment.utc(session.start).format(TIME_FORMAT)} -
                     ${moment.utc(session.end).format(TIME_FORMAT)}`}
              </p>
            );
          })}
        </td>
        <td>
          <div>
            <p>{workshop.location_name}</p>
            <p>{workshop.location_address}</p>
          </div>
        </td>
        <td>{this.renderWorkshopActionButtons(workshop)}</td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <Modal
          show={this.state.showCancelModal}
          onHide={this.dismissCancelModal}
          style={{width: 560}}
        >
          <Modal.Body>
            Are you sure you want to cancel your enrollment in this course?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.cancelEnrollment} bsStyle="primary">
              Yes - cancel my enrollment
            </Button>
            <Button onClick={this.dismissCancelModal}>
              No - stay enrolled in this class
            </Button>
          </Modal.Footer>
        </Modal>
        <h2>My Workshops</h2>
        {this.renderWorkshopsTable()}
      </div>
    );
  }
}

const styles = {
  button: {
    width: '100%'
  }
};

export {EnrolledWorkshops, EnrolledWorkshopsTable};
