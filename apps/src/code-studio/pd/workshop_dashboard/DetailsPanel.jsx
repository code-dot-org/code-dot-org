import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, ButtonToolbar, Button} from 'react-bootstrap';
import ConfirmationDialog from '../components/confirmation_dialog';
import WorkshopForm from './components/workshop_form';
import WorkshopPanel from './WorkshopPanel';

/**
 * UI to view and edit workshop details.
 */
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

  render() {
    const {view, workshop, isWorkshopAdmin, onWorkshopSaved} = this.props;

    if (view === 'edit') {
      const header = <EditHeader handleSave={this.handleSaveClick} />;
      return (
        <WorkshopPanel header={header}>
          <div>
            <WorkshopForm workshop={workshop} onSaved={onWorkshopSaved} />
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
    return (
      <WorkshopPanel header={header}>
        <div>
          <WorkshopForm workshop={workshop} readOnly>
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
  <span>Workshop Details: {children}</span>
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
  onClick: PropTypes.func.isRequired
};
