/**
 * Workshop view / edit. Displays and optionally edits details for a workshop.
 * Routes:
 *   /workshops/:workshopId
 *   /Workshops/:workshopId/edit
 */
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col, ButtonToolbar, Button} from 'react-bootstrap';
import ConfirmationDialog from '../components/confirmation_dialog';
import WorkshopForm from './components/workshop_form';
import Spinner from '../components/spinner';
import {PermissionPropType, WorkshopAdmin} from './permission';
import WorkshopPanel from './WorkshopPanel';
import SignUpPanel from './SignUpPanel';
import IntroPanel from './IntroPanel';
import AttendancePanel from './AttendancePanel';
import EndWorkshopPanel from './EndWorkshopPanel';
import EnrollmentsPanel from './EnrollmentsPanel';

export class Workshop extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string.isRequired
    }).isRequired,
    route: PropTypes.shape({
      view: PropTypes.string
    }).isRequired,
    permission: PermissionPropType.isRequired
  };

  constructor(props) {
    super(props);

    if (props.params.workshopId) {
      this.state = {
        loadingWorkshop: true,
        loadingEnrollments: true,
        showAdminEditConfirmation: false
      };
    }
  }

  componentDidMount() {
    this.loadWorkshop();
    this.loadEnrollments();
  }

  shouldComponentUpdate() {
    // Workshop admins can always edit
    if (this.props.permission.has(WorkshopAdmin)) {
      return true;
    }

    // Don't allow editing a workshop that has been started.
    if (
      this.props.route.view === 'edit' &&
      this.state.workshop &&
      this.state.workshop.state !== 'Not Started'
    ) {
      this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
      return false;
    }
    return true;
  }

  loadWorkshop() {
    this.loadWorkshopRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}`,
      dataType: 'json'
    })
      .done(data => {
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
            'on_map',
            'funded',
            'funding_type',
            'course',
            'subject',
            'notes',
            'sessions',
            'state',
            'account_required_for_attendance?',
            'ready_to_close?',
            'regional_partner_name',
            'regional_partner_id',
            'scholarship_workshop?',
            'potential_organizers',
            'created_at'
          ])
        });
      })
      .fail(data => {
        if (data.statusText !== 'abort') {
          this.setState({
            loadingWorkshop: false,
            workshop: null
          });
        }
      })
      .always(() => {
        this.loadWorkshopRequest = null;
      });
  }

  loadEnrollments() {
    this.setState({loadingEnrollments: true});
    this.loadEnrollmentsRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/enrollments`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loadingEnrollments: false,
        enrollments: data,
        workshop: _.merge(_.cloneDeep(this.state.workshop), {
          enrolled_teacher_count: data.length
        })
      });
      this.loadEnrollmentsRequest = null;
    });
  }

  componentWillUnmount() {
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
    if (this.loadEnrollmentsRequest) {
      this.loadEnrollmentsRequest.abort();
    }
  }

  handleWorkshopSaved = workshop => {
    this.setState({workshop: workshop});
    this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
  };

  render() {
    if (this.state.loadingWorkshop) {
      return <Spinner />;
    } else if (!this.state.workshop) {
      return <p>No workshop found</p>;
    }

    const {params, permission, route} = this.props;
    const {workshopId} = params;
    const isWorkshopAdmin = permission.has(WorkshopAdmin);
    const {workshop} = this.state;
    const {sessions, state: workshopState} = workshop;

    return (
      <Grid>
        {workshopState === 'Not Started' && (
          <SignUpPanel workshopId={workshopId} />
        )}
        <IntroPanel
          workshopId={workshopId}
          workshopState={workshopState}
          sessions={sessions}
          isAccountRequiredForAttendance={
            workshop['account_required_for_attendance?']
          }
          isWorkshopAdmin={isWorkshopAdmin}
          loadWorkshop={this.loadWorkshop.bind(this)}
        />
        {workshopState !== 'Not Started' && (
          <AttendancePanel workshopId={workshopId} sessions={sessions} />
        )}
        {workshopState === 'In Progress' && (
          <EndWorkshopPanel
            workshopId={workshopId}
            isReadyToClose={workshop['ready_to_close?']}
            loadWorkshop={this.loadWorkshop.bind(this)}
          />
        )}
        <EnrollmentsPanel
          workshopId={workshopId}
          workshop={this.state.workshop}
          enrollments={this.state.enrollments}
          isLoadingEnrollments={this.state.loadingEnrollments}
          isWorkshopAdmin={isWorkshopAdmin}
          loadEnrollments={this.loadEnrollments.bind(this)}
        />
        <DetailsPanel
          view={route.view}
          workshopId={workshopId}
          workshop={this.state.workshop}
          workshopState={workshopState}
          isWorkshopAdmin={isWorkshopAdmin}
          onWorkshopSaved={this.handleWorkshopSaved}
        />
      </Grid>
    );
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission
}))(Workshop);

class DetailsPanel extends React.Component {
  static propTypes = {
    view: PropTypes.string,
    workshopId: PropTypes.string,
    workshop: PropTypes.shape({
      state: PropTypes.string
    }),
    isWorkshopAdmin: PropTypes.bool,
    onWorkshopSaved: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    showAdminEditConfirmation: false
  };

  handleEditClick = () => {
    const {workshopId} = this.props;
    this.context.router.push(`/workshops/${workshopId}/edit`);
  };

  handleSaveClick = () => {
    // This button is just a shortcut to click the Save button in the form component,
    // which will handle the logic.
    $('#workshop-form-save-btn').trigger('click');
  };

  handleAdminEditClick = () => this.setState({showAdminEditConfirmation: true});

  handleAdminEditCancel = () =>
    this.setState({showAdminEditConfirmation: false});

  handleAdminEditConfirmed = () => {
    this.setState({showAdminEditConfirmation: false});
    this.handleEditClick();
  };

  handleBackClick = () => {
    this.context.router.push('/workshops');
  };

  renderDetailsPanelHeader() {
    const {view, workshop, isWorkshopAdmin} = this.props;
    let button = null;

    if (view === 'edit') {
      button = (
        <Button
          bsSize="xsmall"
          bsStyle="primary"
          onClick={this.handleSaveClick}
        >
          Save
        </Button>
      );
    } else if (workshop.state === 'Not Started') {
      button = (
        <Button bsSize="xsmall" onClick={this.handleEditClick}>
          Edit
        </Button>
      );
    } else if (isWorkshopAdmin) {
      if (this.state.showAdminEditConfirmation) {
        return (
          <ConfirmationDialog
            show={true}
            onOk={this.handleAdminEditConfirmed}
            onCancel={this.handleAdminEditCancel}
            headerText={`Edit ${workshop.state} Workshop?`}
            bodyText={`Are you sure you want to edit this ${workshop.state.toLowerCase()} workshop?
            Use caution! Note that deleting a session (day)
            will also delete all associated attendance records.
            `}
          />
        );
      }
      button = (
        <Button bsSize="xsmall" onClick={this.handleAdminEditClick}>
          Edit (admin)
        </Button>
      );
    }

    return <span>Workshop Details: {button}</span>;
  }

  renderDetailsPanelContent() {
    const {view, workshop, onWorkshopSaved} = this.props;
    if (view === 'edit') {
      return (
        <div>
          <WorkshopForm workshop={workshop} onSaved={onWorkshopSaved} />
        </div>
      );
    }

    let editButton = null;
    if (workshop.state === 'Not Started') {
      editButton = <Button onClick={this.handleEditClick}>Edit</Button>;
    }

    return (
      <div>
        <WorkshopForm workshop={workshop} readOnly>
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
  }

  render() {
    return (
      <WorkshopPanel header={this.renderDetailsPanelHeader()}>
        {this.renderDetailsPanelContent()}
      </WorkshopPanel>
    );
  }
}

/**
 * A small, right-aligned section at the end of the workshop dashboard showing
 * metadata we want to be able to check occasionally, like the workshop created_at date.
 * @param {string} createdAt - and ISO 8601 date string
 * @returns {Component}
 * @constructor
 */
const MetadataFooter = ({createdAt}) => (
  <Row>
    <Col sm={12}>
      <div style={METADATA_FOOTER_STYLE}>
        Workshop created {new Date(createdAt).toLocaleDateString('en-US')}.
      </div>
    </Col>
  </Row>
);
MetadataFooter.propTypes = {
  createdAt: PropTypes.string.isRequired // An ISO 8601 date string
};
const METADATA_FOOTER_STYLE = {
  textAlign: 'right',
  fontSize: 'smaller',
  fontStyle: 'italic'
};
