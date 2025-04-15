import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import {Row, Col, Button, ButtonToolbar} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {RouterContext} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import experiments from '@cdo/apps/util/experiments';

import ConfirmationDialog from '../components/confirmation_dialog';

import WorkshopForm from './components/workshop_form';
import {DATE_FORMAT, TIME_FORMAT} from './workshopConstants';
import WorkshopPanel from './WorkshopPanel';

const newWorkshopFormEnabled = experiments.isEnabled(
  experiments.NEW_WORKSHOP_FORM
);

/**
 * UI to view and edit workshop details.
 */
export default class DetailsPanel extends React.Component {
  static propTypes = {
    view: PropTypes.string,
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
    onWorkshopSaved: PropTypes.func,
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

  getToday = () => {
    return new Date();
  };

  handleEditClick = () => {
    const {workshopId} = this.props;
    this.context.router.push(`/workshops/${workshopId}/edit`);
  };

  handleAdminEditClick = () => this.setState({showAdminEditConfirmation: true});

  handleSaveClick = () => {
    // This button is just a shortcut to click the Save button in the form component,
    // which will handle the logic.
    $('#workshop-form-save-btn').trigger('click');
  };

  handleAdminEditCancel = () =>
    this.setState({showAdminEditConfirmation: false});

  handleBackClick = () => {
    this.context.router.push('/workshops');
  };

  handleAdminEditConfirmed = () => {
    this.setState({showAdminEditConfirmation: false});
    this.handleEditClick();
  };

  render() {
    const {view, workshop, isWorkshopAdmin, onWorkshopSaved} = this.props;

    if (view === 'edit') {
      const header = <EditHeader handleSave={this.handleSaveClick} />;
      return (
        <WorkshopPanel header={header}>
          <div>
            <WorkshopForm
              workshop={workshop}
              onSaved={onWorkshopSaved}
              today={this.getToday()}
            />
          </div>
        </WorkshopPanel>
      );
    }

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
        {newWorkshopFormEnabled ? (
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
                    {moment
                      .tz(session.start, this.timeZone)
                      .format(DATE_FORMAT)}
                  </Col>
                  <Col style={styles.noWrap} xs={4}>
                    {moment
                      .tz(session.start, this.timeZone)
                      .format(TIME_FORMAT)}
                    -{moment.tz(session.end, this.timeZone).format(TIME_FORMAT)}
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
        ) : (
          <div>
            <WorkshopForm workshop={workshop} today={this.getToday()} readOnly>
              <Row>
                <Col sm={4}>
                  <ButtonToolbar>
                    {workshop.state === 'Not Started' && (
                      <Button onClick={this.handleEditClick}>Edit</Button>
                    )}
                    <Button onClick={this.handleBackClick}>Back</Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </WorkshopForm>
          </div>
        )}

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
  <span>
    Workshop {newWorkshopFormEnabled ? 'Information' : 'Details'}: {children}
  </span>
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
