/**
 * Workshop view. Displays details for a workshop.
 * Routes:
 *   /workshops/:workshopId
 */
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

import {RouterContext} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';

import Spinner from '../../../sharedComponents/Spinner';

import AttendancePanel from './AttendancePanel';
import DetailsPanel from './DetailsPanel';
import EndWorkshopPanel from './EndWorkshopPanel';
import EnrollmentsPanel from './EnrollmentsPanel';
import IntroPanel from './IntroPanel';
import {PermissionPropType, WorkshopAdmin} from './permission';
import WorkshopLinks from './WorkshopLinks';

export class Workshop extends React.Component {
  static contextType = RouterContext;

  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string.isRequired,
    }).isRequired,
    permission: PermissionPropType.isRequired,
  };

  constructor(props) {
    super(props);

    if (props.params.workshopId) {
      this.state = {
        loadingWorkshop: true,
        loadingEnrollments: true,
        showAdminEditConfirmation: false,
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
    if (this.state.workshop && this.state.workshop.state !== 'Not Started') {
      this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
      return false;
    }
    return true;
  }

  loadWorkshop = () => {
    this.loadWorkshopRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}`,
      dataType: 'json',
    })
      .done(data => {
        this.setState({
          loadingWorkshop: false,
          workshop: data,
        });
      })
      .fail(data => {
        if (data.statusText !== 'abort') {
          this.setState({
            loadingWorkshop: false,
            workshop: null,
          });
        }
      })
      .always(() => {
        this.loadWorkshopRequest = null;
      });
  };

  loadEnrollments = () => {
    this.setState({loadingEnrollments: true});
    this.loadEnrollmentsRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/enrollments`,
      dataType: 'json',
    }).done(data => {
      this.setState({
        loadingEnrollments: false,
        enrollments: data,
        workshop: _.merge(_.cloneDeep(this.state.workshop), {
          enrolled_teacher_count: data.length,
        }),
      });
      this.loadEnrollmentsRequest = null;
    });
  };

  componentWillUnmount() {
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
    if (this.loadEnrollmentsRequest) {
      this.loadEnrollmentsRequest.abort();
    }
  }

  render() {
    if (this.state.loadingWorkshop) {
      return <Spinner />;
    } else if (!this.state.workshop) {
      return <p>No workshop found</p>;
    }

    const {params, permission} = this.props;
    const {workshopId} = params;
    const isWorkshopAdmin = permission.has(WorkshopAdmin);
    const {workshop, enrollments, loadingEnrollments} = this.state;
    const {created_at, sessions, state: workshopState, time_zone} = workshop;

    return (
      <Grid>
        <DetailsPanel
          workshopId={workshopId}
          workshop={workshop}
          workshopState={workshopState}
          isWorkshopAdmin={isWorkshopAdmin}
        />
        {workshopState === 'Not Started' && (
          <WorkshopLinks
            workshopId={workshopId}
            hasCustomRegistrationLink={!!workshop['registration_link']}
          />
        )}
        <IntroPanel
          workshopId={workshopId}
          workshopState={workshopState}
          workshopTimezone={time_zone}
          sessions={sessions}
          isAccountRequiredForAttendance={
            workshop['account_required_for_attendance?']
          }
          isWorkshopAdmin={isWorkshopAdmin}
          loadWorkshop={this.loadWorkshop}
        />
        {workshopState !== 'Not Started' && (
          <AttendancePanel workshopId={workshopId} sessions={sessions} />
        )}
        {workshopState === 'In Progress' && (
          <EndWorkshopPanel
            workshopId={workshopId}
            isReadyToClose={workshop['ready_to_close?']}
            loadWorkshop={this.loadWorkshop}
          />
        )}
        <EnrollmentsPanel
          workshopId={workshopId}
          workshop={workshop}
          enrollments={enrollments}
          isLoadingEnrollments={loadingEnrollments}
          isWorkshopAdmin={isWorkshopAdmin}
          loadEnrollments={this.loadEnrollments}
        />

        <MetadataFooter createdAt={created_at} />
      </Grid>
    );
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission,
}))(Workshop);

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
  createdAt: PropTypes.string.isRequired, // An ISO 8601 date string
};
const METADATA_FOOTER_STYLE = {
  textAlign: 'right',
  fontSize: 'smaller',
  fontStyle: 'italic',
};
