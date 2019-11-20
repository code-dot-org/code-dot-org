import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, ButtonToolbar, Button} from 'react-bootstrap';
import ConfirmationDialog from '../components/confirmation_dialog';
import WorkshopForm from './components/workshop_form';
import WorkshopPanel from './WorkshopPanel';

export default class DetailsPanel extends React.Component {
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
