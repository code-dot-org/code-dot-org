/* global TEACHER_DASHBOARD_URL */

/*
  Workshop view / edit. Displays and optionally edits details for a workshop.
  Routes:
    /workshops/:workshopId
    /Workshops/:workshopId/edit
 */

import $ from 'jquery';
var _ = require('lodash');
import React from 'react';
var moment = require('moment');
var ConfirmationDialog = require('./components/confirmation_dialog');
var WorkshopForm = require('./components/workshop_form');
var WorkshopEnrollment = require('./components/workshop_enrollment');
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Panel = require('react-bootstrap').Panel;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Button = require('react-bootstrap').Button;

var Workshop = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    params: React.PropTypes.shape({
      workshopId: React.PropTypes.string.isRequired
    }).isRequired,
    route: React.PropTypes.shape({
      view: React.PropTypes.string
    }).isRequired,
  },

  getInitialState: function () {
    if (this.props.params.workshopId) {
      return {
        loadingWorkshop: true,
        loadingEnrollments: true
      };
    }
  },

  componentDidMount: function () {
    this.loadWorkshop();
    this.loadEnrollments();
  },

  shouldComponentUpdate: function () {
    // Don't allow editing a workshop that has been started.
    if (this.props.route.view === 'edit' && this.state.workshop && this.state.workshop.state !== 'Not Started') {
      this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
      return false;
    }
    return true;
  },

  loadWorkshop: function () {
    this.loadWorkshopRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}`,
      dataType: "json"
    }).done(function (data) {
      this.setState({
        loadingWorkshop: false,
        workshop: _.pick(data, [
          'id',
          'organizer',
          'facilitators',
          'location_name',
          'location_address',
          'capacity',
          'enrolled_teacher_count',
          'workshop_type',
          'course',
          'subject',
          'notes',
          'section_id',
          'section_code',
          'sessions',
          'state'
        ])
      });
    }.bind(this));
  },

  loadEnrollments: function () {
    this.loadEnrollmentsRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/enrollments`,
      dataType: "json"
    }).done(function (data) {
      this.setState({
        loadingEnrollments: false,
        enrollments: data,
        workshop: _.merge(_.cloneDeep(this.state.workshop), {
          enrolled_teacher_count: data.length
        })
      });
    }.bind(this));
  },


  componentWillUnmount: function () {
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
    if (this.loadEnrollmentsRequest) {
      this.loadEnrollmentsRequest.abort();
    }
    if (this.startRequest) {
      this.startRequest.abort();
    }
    if (this.endRequest) {
      this.endRequest.abort();
    }
  },

  handleStartWorkshopClick: function () {
    this.setState({showStartWorkshopConfirmation: true});
  },

  handleStartWorkshopCancel: function () {
    this.setState({showStartWorkshopConfirmation: false});
  },

  handleStartWorkshopConfirmed: function (e) {
    this.startRequest = $.ajax({
      method: "POST",
      url: "/api/v1/pd/workshops/" + this.props.params.workshopId + "/start",
      dataType: "json"
    }).done(function (data) {
      this.setState({
        showStartWorkshopConfirmation: false,
        workshop: _.merge(_.cloneDeep(this.state.workshop), {
          state: 'In Progress',
          section_id: data.section_id,
          section_code: data.section_code
        })
      });
    }.bind(this));
  },

  handleEndWorkshopClick: function () {
    this.setState({showEndWorkshopConfirmation: true});
  },

  handleEndWorkshopCancel: function () {
    this.setState({showEndWorkshopConfirmation: false});
  },

  handleEndWorkshopConfirmed: function (e) {
    this.endRequest = $.ajax({
      method: "POST",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/end`,
      dataType: "json"
    }).done(function () {
      this.setState({
        workshop: _.merge(_.cloneDeep(this.state.workshop), {
          state: 'Ended'
        })
      });
    }.bind(this));
  },

  handleTakeAttendanceClick: function (i) {
    this.context.router.push(`/workshops/${this.props.params.workshopId}/attendance/${i}`);
  },

  handleEditClick: function () {
    this.context.router.push(`/workshops/${this.props.params.workshopId}/edit`);
  },

  handleBackClick: function () {
    this.context.router.push('/workshops');
  },

  handleWorkshopSaved: function (workshop) {
    this.setState({workshop: workshop});
    this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
  },

  handleSaveClick: function () {
    // This button is just a shortcut to click the Save button in the form component,
    // which will handle the logic.
    $('#workshop-form-save-btn').trigger('click');
  },

  handleEnrollmentRefreshClick: function () {
    this.loadEnrollments();
    this.setState({loadingEnrollments: true});
  },

  getSectionUrl: function () {
    return `${window.dashboard.workshop.TEACHER_DASHBOARD_URL}#/sections/${this.state.workshop.section_id}/manage`;
  },

  renderSignupPanel: function () {
    if (this.state.workshop.state !== 'Not Started') {
      return null;
    }

    let header = (
      <div>
        Your workshop sign-up link:
      </div>
    );

    let signupUrl = `${location.origin}/pd/workshops/${this.props.params.workshopId}/enroll`;
    let content = (
      <div>
        <p>Share this link with teachers who need to sign up for your workshop.</p>
        <a href={signupUrl} target="_blank">
          {signupUrl}
        </a>
      </div>
    );

    return this.renderPanel(header, content);
  },

  renderIntroPanel: function () {
    let header = (
      <div>
        Workshop State: {this.state.workshop.state}
      </div>
    );

    let contents = null;

    switch (this.state.workshop.state) {
      case 'Not Started':
        contents = (
          <div>
            <p>
              On the day of your workshop, click the Start Workshop button below to
              create a section for teachers attending the workshop to join.
            </p>
            <Button onClick={this.handleStartWorkshopClick}>Start Workshop</Button>
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
      case 'In Progress':
        var joinUrl = location.origin + "/join/" + this.state.workshop.section_code;
        var joinLink = (<a href={joinUrl} target="_blank">{joinUrl}</a>);
        contents = (
          <div>
            <p>
              On the day of the workshop, ask workshop attendees to follow the steps:
            </p>
            <h4>Step 1: Sign into Code Studio</h4>
            <p>
              Tell teachers to sign into their Code Studio accounts. If they do not already have an
              account tell them to create one by going to{' '}
              <a href={location.origin} target="_blank">
                {location.origin}
              </a>
            </p>
            <h4>Step 2: Go to the workshop URL</h4>
            <p>
              After teachers have signed into their Code Studio accounts, ask them to type this
              URL ({joinLink}) into their browsers.
              They will be taken to code.org and see a green box at the top that reads: “You’ve joined…”.
              This will allow you to view their Code Studio progress for different professional development courses.
            </p>
            <p>
              You can also{' '}
              <a href={this.getSectionUrl()} target="_blank">
                view this section in your Teacher Dashboard
              </a>{' '}
              to make sure everyone has joined.
            </p>
          </div>
        );
        break;
      default:
        contents = (
          <div>
            <p>
              We hope you had a great workshop!
            </p>
            <p>
              Teachers will receive an email with survey link from{' '}
              <a href="mailto:hadi_partovi@code.org">
                hadi_partovi@code.org
              </a>.{' '}
              If they do not receive the link ask them to check their spam.
              Many school districts block outside emails.
              You can also recommend they set hadi_partovi and any other @code.org
              addresses to their contacts or safe senders list, so they don't miss
              out on future emails. Lastly, they can check to make sure the email
              went to the correct email address by logging into their Code Studio
              account, navigating to the 'my account' page via the top right corner
              to confirm their email address was typed correctly when they
              first created the account.
            </p>
            <p>
              If they still can’t find the email, have them email{' '}
              <a href="mailto:support@code.org">
                support@code.org
              </a>{' '}
              and we will help them.
            </p>
          </div>
        );
    }

    return this.renderPanel(header, contents);
  },

  renderAttendancePanel: function () {
    if (this.state.workshop.state === 'Not Started') {
      return null;
    }

    let header = (
      <div>
        Take Attendance:
      </div>
    );

    let attendanceButtons = this.state.workshop.sessions.map(function (session, i) {
      let date = moment.utc(session.start).format('MM/DD/YY');
      return (
        <Button key={i} onClick={this.handleTakeAttendanceClick.bind(null,i)}>
          {date}
        </Button>
      );
    }.bind(this));

    let contents = (
      <div>
        <p>
          Every day of the workshop, you must take attendance in order for teachers to
          receive professional development credit. Follow the
          button{this.state.workshop.sessions.length > 1 ? 's ' : ' '}
          below to take attendance.
        </p>
        <ButtonGroup vertical>
          {attendanceButtons}
        </ButtonGroup>
      </div>
    );

    return this.renderPanel(header, contents);
  },

  renderEndWorkshopPanel: function () {
    if (this.state.workshop.state !== 'In Progress') {
      return null;
    }

    let header = (
      <div>
        End Workshop:
      </div>
    );

    let contents = (
      <div>
        <p>
          After the last day of your workshop, you must end the workshop.
          This will generate a report to Code.org as well as email teachers
          a survey regarding the workshop.
        </p>
        <Button onClick={this.handleEndWorkshopClick}>End Workshop</Button>
        <ConfirmationDialog
          show={this.state.showEndWorkshopConfirmation}
          onOk={this.handleEndWorkshopConfirmed}
          onCancel={this.handleEndWorkshopCancel}
          headerText="End Workshop"
          bodyText="Are you sure? Once ended, the workshop cannot be restarted."
        />
      </div>
    );

    return this.renderPanel(header, contents);
  },

  renderDetailsPanelHeader: function () {
    let button = null;
    if (this.state.workshop.state === 'Not Started') {
      if (this.props.route.view === 'edit') {
        button = <Button bsSize="xsmall" bsStyle="primary" onClick={this.handleSaveClick}>Save</Button>;
      } else {
        button = <Button bsSize="xsmall" onClick={this.handleEditClick}>Edit</Button>;
      }
    }

    return (
      <span>
        Workshop Details: {button}
      </span>
    );
  },

  renderDetailsPanelContent: function () {
    if (this.props.route.view === 'edit' ) {
      return (
        <div>
          <WorkshopForm
            workshop={this.state.workshop}
            onSaved={this.handleWorkshopSaved}
          />
        </div>
      );
    }

    let editButton = null;
    if (this.state.workshop.state === 'Not Started') {
      editButton = (
        <Button onClick={this.handleEditClick}>Edit</Button>
      );
    }

    return (
      <div>
        <WorkshopForm workshop={this.state.workshop} readOnly>
          <Row>
            <Col sm={4}>
              <ButtonToolbar>
                {editButton}
                <Button onClick={this.handleBackClick}>Back</Button>
              </ButtonToolbar>
            </Col>
          </Row>
        </WorkshopForm>
      </div>
    );
  },

  renderDetailsPanel: function () {
    return this.renderPanel(this.renderDetailsPanelHeader(), this.renderDetailsPanelContent());
  },

  renderEnrollmentsPanel: function () {
    let header = (
      <div>
        Workshop Enrollment:{' '}
        {this.state.workshop.enrolled_teacher_count}/{this.state.workshop.capacity}
        <Button bsStyle="link" style={{color:'inherit'}} onClick={this.handleEnrollmentRefreshClick}>
          <i className="fa fa-refresh" />
        </Button>
      </div>
    );

    let contents = null;
    if (this.state.loadingEnrollments) {
      contents = this.renderSpinner();
    } else {
      contents = (
        <WorkshopEnrollment
          workshopId={this.props.params.workshopId}
          enrollments={this.state.enrollments}
        />
      );
    }

    return this.renderPanel(header, contents);
  },

  renderPanel: function (header, content) {
    return (
      <Row>
        <Col sm={12}>
          <Panel header={header}>
            {content}
          </Panel>
        </Col>
      </Row>
    );
  },

  renderSpinner: function () {
    return <i className="fa fa-spinner fa-pulse fa-3x" />;
  },

  render: function () {
    if (this.state.loadingWorkshop) {
      return this.renderSpinner();
    }
    return (
      <Grid>
        {this.renderSignupPanel()}
        {this.renderIntroPanel()}
        {this.renderAttendancePanel()}
        {this.renderEndWorkshopPanel()}
        {this.renderEnrollmentsPanel()}
        {this.renderDetailsPanel()}
      </Grid>
    );
  }
});
module.exports = Workshop;
