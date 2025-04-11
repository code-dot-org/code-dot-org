import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import {Row, Col, Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {RouterContext} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import ConfirmationDialog from '../components/confirmation_dialog';

import {DATE_FORMAT, TIME_FORMAT} from './workshopConstants';
import WorkshopPanel from './WorkshopPanel';

/**
 * UI to view and edit workshop details.
 */
export default class DetailsPanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.string,
    workshop: PropTypes.shape({
      state: PropTypes.string,
      time_zone: PropTypes.string,
      name: PropTypes.string,
      course: PropTypes.string,
      subject: PropTypes.string,
      course_offering_names: PropTypes.string,
      sessions: PropTypes.array,
      facilitators: PropTypes.array,
      regional_partner_name: PropTypes.string,
    }),
    isWorkshopAdmin: PropTypes.bool,
  };

  static contextType = RouterContext;

  state = {
    showAdminEditConfirmation: false,
  };

  get timeZone() {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      this.props.workshop?.time_zone ||
      'UTC'
    );
  }

  handleEditClick = () => {
    const {workshopId} = this.props;
    this.context.router.push(`/workshops/${workshopId}/edit`);
  };

  handleAdminEditClick = () => this.setState({showAdminEditConfirmation: true});

  handleAdminEditCancel = () =>
    this.setState({showAdminEditConfirmation: false});

  handleAdminEditConfirmed = () => {
    this.setState({showAdminEditConfirmation: false});
    this.handleEditClick();
  };

  render() {
    const {workshop, isWorkshopAdmin} = this.props;

    let header = <DetailsPanelHeader />;
    if (workshop.state === 'Not Started') {
      header = <NotStartedHeader handleEdit={this.handleEditClick} />;
    } else if (isWorkshopAdmin) {
      header = <AdminHeader handleEdit={this.handleAdminEditClick} />;
    }
    if (
      !WorkshopCourseConfigs.some(config => config.label === workshop.course)
    ) {
      header = <DetailsPanelHeader />;
    }
    return (
      <WorkshopPanel header={header}>
        <Row style={styles.container}>
          <Col style={styles.section} md={4}>
            <h2 style={styles.header}>
              <strong>Workshop Name</strong>
            </h2>
            <p style={styles.truncate}>{workshop.name || workshop.course}</p>

            <h2 style={styles.header}>
              <strong>Subject/Topics</strong>
            </h2>
            <ul style={{...styles.list, ...styles.truncate}}>
              {workshop.subject && <li>{workshop.subject}</li>}
              {workshop.course_offering_names &&
                workshop.course_offering_names
                  .split(', ')
                  .map(course => <li key={course}>{course}</li>)}
            </ul>
          </Col>

          <div style={styles.divider} />

          <Col style={styles.section} md={4}>
            <Row>
              <Col xs={4}>
                <h2 style={styles.header}>
                  <strong>Date</strong>
                </h2>
              </Col>
              <Col xs={4}>
                <h2 style={styles.header}>
                  <strong>Time</strong>
                </h2>
              </Col>
              <Col xs={4}>
                <h2 style={styles.header}>
                  <strong>Location</strong>
                </h2>
              </Col>
            </Row>
            {workshop.sessions.map(session => (
              <Row key={session.id}>
                <Col style={styles.noWrap} xs={4}>
                  {moment.tz(session.start, this.timeZone).format(DATE_FORMAT)}
                </Col>
                <Col style={styles.noWrap} xs={4}>
                  {moment.tz(session.start, this.timeZone).format(TIME_FORMAT)}-
                  {moment.tz(session.end, this.timeZone).format(TIME_FORMAT)}
                </Col>
                <Col style={styles.truncate} xs={4}>
                  {session.session_format === 'in_person'
                    ? session.location_name ?? 'N/A'
                    : 'Virtual'}
                </Col>
              </Row>
            ))}
          </Col>

          <div style={styles.divider} />

          <Col style={styles.section} md={4}>
            <h2 style={styles.header}>
              <strong>Facilitators</strong>
            </h2>
            {workshop.facilitators?.length ? (
              workshop.facilitators.map(facilitator => (
                <p style={styles.truncate} key={facilitator.id}>
                  {facilitator.name}, {facilitator.email}
                </p>
              ))
            ) : (
              <p>N/A</p>
            )}

            <h2 style={styles.header}>
              <strong>Regional Partner</strong>
            </h2>
            <p style={styles.truncate}>
              {workshop.regional_partner_name || 'N/A'}
            </p>
          </Col>
        </Row>

        <ConfirmationDialog
          show={isWorkshopAdmin && this.state.showAdminEditConfirmation}
          onOk={this.handleAdminEditConfirmed}
          onCancel={this.handleAdminEditCancel}
          headerText={`Edit ${workshop.state} Workshop?`}
          bodyText={`Are you sure you want to edit this ${workshop.state.toLowerCase()} workshop?
              Use caution! Note that deleting a session (day)
              will also delete all associated attendance records.
              `}
        />
      </WorkshopPanel>
    );
  }
}

const styles = {
  header: {
    fontSize: '13px',
  },
  container: {
    display: 'flex',
  },
  section: {
    width: '100%',
    overflow: 'hidden',
  },
  divider: {
    flex: 1,
    borderRight: '1px solid #D1D4D8',
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
};

const NotStartedHeader = ({handleEdit}) => (
  <DetailsPanelHeader>
    <HeaderButton text="Edit" onClick={handleEdit} />
  </DetailsPanelHeader>
);
NotStartedHeader.propTypes = {handleEdit: PropTypes.func.isRequired};

const AdminHeader = ({handleEdit}) => (
  <DetailsPanelHeader>
    <HeaderButton text="Edit (admin)" onClick={handleEdit} />
  </DetailsPanelHeader>
);
AdminHeader.propTypes = {handleEdit: PropTypes.func.isRequired};

const EditHeader = ({handleSave}) => (
  <DetailsPanelHeader>
    <HeaderButton text="Save" bsStyle="primary" onClick={handleSave} />
  </DetailsPanelHeader>
);
EditHeader.propTypes = {handleSave: PropTypes.func.isRequired};

const DetailsPanelHeader = ({children}) => (
  <span>Workshop Information: {children}</span>
);
DetailsPanelHeader.propTypes = {children: PropTypes.node};

const HeaderButton = ({text, bsStyle, onClick}) => (
  <Button bsSize="xsmall" bsStyle={bsStyle} onClick={onClick}>
    {text}
  </Button>
);
HeaderButton.propTypes = {
  text: PropTypes.string.isRequired,
  bsStyle: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};
