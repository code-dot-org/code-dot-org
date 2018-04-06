/**
 * Workshop management buttons (view, edit, delete).
 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';
import ConfirmationDialog from './confirmation_dialog';
import {
  PermissionPropType,
  Organizer,
  ProgramManager
} from '../permission';

export class WorkshopManagement extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    permission: PermissionPropType.isRequired,
    workshopId: PropTypes.number.isRequired,
    subject: PropTypes.string,
    viewUrl: PropTypes.string.isRequired,
    editUrl: PropTypes.string,
    onDelete: PropTypes.func,
    showSurveyUrl: PropTypes.bool
  };

  static defaultProps = {
    editUrl: null,
    onDelete: null
  };

  constructor(props) {
    super(props);

    if (props.showSurveyUrl) {
      let surveyBaseUrl;

      if (props.subject === '5-day Summer') {
        surveyBaseUrl = "local_summer_workshop_survey_results";
      } else {
        surveyBaseUrl = props.permission.hasAny(Organizer, ProgramManager) ? "organizer_survey_results" : "survey_results";
      }

      this.surveyUrl = `/${surveyBaseUrl}/${this.props.workshopId}`;
    }
  }

  state = {
    showDeleteConfirmation: false
  };

  handleViewClick = (event) => {
    event.preventDefault();
    this.context.router.push(this.props.viewUrl);
  };

  handleEditClick = (event) => {
    event.preventDefault();
    this.context.router.push(this.props.editUrl);
  };

  handleDeleteClick = () => {
    this.setState({showDeleteConfirmation: true});
  };

  handleDeleteCanceled = () => {
    this.setState({showDeleteConfirmation: false});
  };

  handleDeleteConfirmed = () => {
    this.setState({showDeleteConfirmation: false});
    this.props.onDelete(this.props.workshopId);
  };

  handleSurveyClick = (event) => {
    event.preventDefault();
    this.context.router.push(this.surveyUrl);
  };

  renderViewButton() {
    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.props.viewUrl)}
        onClick={this.handleViewClick}
      >
        View Workshop
      </Button>
    );
  }

  renderEditButton() {
    if (!this.props.editUrl) {
      return null;
    }

    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.props.editUrl)}
        onClick={this.handleEditClick}
      >
        Edit
      </Button>
    );
  }

  renderSurveyButton() {
    if (!this.props.showSurveyUrl) {
      return null;
    }

    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.surveyUrl)}
        onClick={this.handleSurveyClick}
      >
        View Survey Results
      </Button>
    );
  }

  renderDeleteButton() {
    if (!this.props.onDelete) {
      return null;
    }

    return (
      <Button bsSize="xsmall" onClick={this.handleDeleteClick}>
        Delete
      </Button>
    );
  }

  render() {
    return (
      <div>
        {this.renderViewButton()}
        {this.renderEditButton()}
        {this.renderDeleteButton()}
        {this.renderSurveyButton()}
        <ConfirmationDialog
          show={this.state.showDeleteConfirmation}
          onOk={this.handleDeleteConfirmed}
          onCancel={this.handleDeleteCanceled}
          headerText="Delete Workshop"
          bodyText="Are you sure you want to delete this workshop? Once deleted it can't be recovered."
        />
      </div>
    );
  }
}

export default connect(state => ({
  permission: state.permission
}))(WorkshopManagement);
