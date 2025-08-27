import Button from '@code-dot-org/component-library/button';
import Modal from '@code-dot-org/component-library/modal';
import {Heading2} from '@code-dot-org/component-library/typography';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import ReactTooltip from 'react-tooltip';

import Spinner from '@cdo/apps/sharedComponents/Spinner';

import * as utils from '../../../utils';
import {getSessionDate, getSessionTimes} from '../sessionDateUtils';
import {workshopShape} from '../workshop_dashboard/types.js';
import {
  DATE_FORMAT,
  TIME_FORMAT,
} from '../workshop_dashboard/workshopConstants';

import moduleStyles from './landingPageWorkshopsTable.module.scss';

const workshopsTableButtonCommonProps = {
  size: 's',
  type: 'secondary',
  color: 'black',
};

export default class LandingPageWorkshopsTable extends React.Component {
  static propTypes = {
    workshops: PropTypes.arrayOf(workshopShape),
    isLoading: PropTypes.bool,
    tableHeader: PropTypes.string,
    participantView: PropTypes.bool,
  };

  state = {
    showCancelModal: false,
    enrollmentCodeToCancel: undefined,
  };

  cancelEnrollment = event => {
    window.location = `/pd/workshop_enrollment/${this.state.enrollmentCodeToCancel}/cancel`;
  };

  dismissCancelModal = event => {
    this.setState({
      showCancelModal: false,
      enrollmentCodeToCancel: undefined,
    });
  };

  showCancelModal = enrollmentCode => {
    this.setState({
      showCancelModal: true,
      enrollmentCodeToCancel: enrollmentCode,
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
        {...workshopsTableButtonCommonProps}
        onClick={() => utils.windowOpen(workshop.pre_workshop_survey_url)}
        disabled={this.moreThanTenDaysUntilWorkshop(
          workshop.workshop_starting_date
        )}
        text="Complete pre-workshop survey"
      />
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
    if (!!this.props.participantView) {
      return (
        <div className={moduleStyles.workshopsTableActions}>
          {workshop.state === 'Not Started' &&
            workshop.pre_workshop_survey_url &&
            this.renderPreWorkshopSurveyButton(workshop)}
          {workshop.state === 'Ended' && (
            <Button
              {...workshopsTableButtonCommonProps}
              onClick={() => this.openCertificate(workshop)}
              disabled={!workshop.attended}
              text="Print certificate"
            />
          )}
          <Button
            {...workshopsTableButtonCommonProps}
            onClick={() =>
              utils.windowOpen(
                `/professional-learning/workshops/${workshop.id}`
              )
            }
            text="Workshop details"
          />
          {workshop.state === 'Not Started' && (
            <Button
              {...workshopsTableButtonCommonProps}
              onClick={() => this.showCancelModal(workshop.enrollment_code)}
              color="destructive"
              text="Cancel enrollment"
            />
          )}
        </div>
      );
    } else {
      return (
        <Button
          {...workshopsTableButtonCommonProps}
          onClick={() =>
            utils.windowOpen(`/pd/workshop_dashboard/workshops/${workshop.id}`)
          }
          text="Workshop Details"
        />
      );
    }
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
            {!this.props.participantView && <th>Status</th>}
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
          {workshop.name ? workshop.name : workshop.course}
          <br />
          {workshop.subject}
        </td>
        <td>
          {workshop.sessions.map((session, i) => {
            const date = getSessionDate({
              session,
              format: DATE_FORMAT,
              isLocal: !workshop.time_zone,
            });
            return <p key={i}>{date}</p>;
          })}
        </td>
        <td>
          {workshop.sessions.map((session, i) => {
            const {startTime, endTime, tzAbbreviation} = getSessionTimes({
              session,
              format: TIME_FORMAT,
              isLocal: !workshop.time_zone,
            });
            return (
              <p key={i}>{`${startTime} - ${endTime} ${tzAbbreviation}`}</p>
            );
          })}
        </td>
        <td>
          <div>
            <p>{workshop.location_name}</p>
            <p>{workshop.location_address}</p>
          </div>
        </td>
        {!this.props.participantView && <td>{workshop.status}</td>}
        <td>{this.renderWorkshopActionButtons(workshop)}</td>
      </tr>
    );
  }

  render() {
    if (this.props.isLoading) {
      return (
        // While reloading, preserve the height of the previous child component so the refresh is smoother.
        <div style={{height: this.childHeight}}>
          <Spinner />
        </div>
      );
    }

    if (this.props.workshops.length === 0) {
      return null;
    }

    return (
      <div>
        {this.state.showCancelModal && (
          <Modal
            onClose={this.dismissCancelModal}
            title="Cancel Enrollment"
            description="Are you sure you want to cancel your enrollment in this course?"
            primaryButtonProps={{
              onClick: this.cancelEnrollment,
              text: 'Yes - cancel my enrollment',
            }}
            secondaryButtonProps={{
              onClick: this.dismissCancelModal,
              text: 'No - stay enrolled in this class',
            }}
          />
        )}
        {this.props.workshops && (
          <section>
            {this.props.tableHeader && (
              <Heading2>{this.props.tableHeader}</Heading2>
            )}
            {this.renderWorkshopsTable()}
          </section>
        )}
      </div>
    );
  }
}
