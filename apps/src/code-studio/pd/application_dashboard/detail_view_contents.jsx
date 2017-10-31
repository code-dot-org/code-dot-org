import React, {PropTypes} from 'react';
import {Button, FormControl} from 'react-bootstrap';
import Facilitator1819Questions from './detail_view_facilitator_specific_components';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';

const STATUSES = ['Accepted', 'Waitlisted', 'Pending', 'Declined', 'Unreviewed'];

export default class DetailViewContents extends React.Component {
  static propTypes = {
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      regional_partner_name: PropTypes.string,
      notes: PropTypes.string,
      status: PropTypes.string.isRequired,
      school_name: PropTypes.string,
      district_name: PropTypes.string,
      email: PropTypes.string,
      form_data: PropTypes.object
    }),
  };

  state = {
    status: this.props.applicationData.status,
    notes: this.props.applicationData.notes
  };

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      status: this.props.applicationData.status
    });
  };

  handleEditClick = () => {
    this.setState({
      editing: true
    });
  };

  handleStatusChange = (event) => {
    this.setState({
      status: event.target.value
    });
  };

  handleNotesChange = (event) => {
    this.setState({
      notes: event.target.value
    });
  };

  handleSaveClick = () => {
    $.ajax({
      method: "PATCH",
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(this.state)
    }).done(() => {
      this.setState({
        editing: false
      });
    });
  };

  renderEditButtons = () => {
    if (this.state.editing) {
      return [(
        <Button
          onClick={this.handleSaveClick}
          bsStyle="primary"
          key="save"
          style={{marginRight: '5px'}}
        >
          Save
        </Button>
      ), (
        <Button onClick={this.handleCancelEditClick} key="cancel">
          Cancel
        </Button>
      )];
    } else {
      return (
        <Button onClick={this.handleEditClick}>
          Edit
        </Button>
      );
    }
  };

  renderHeader = () => {
    return (
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <h1>
          {`${this.props.applicationData.form_data.firstName} ${this.props.applicationData.form_data.lastName}`}
        </h1>

        <div id="DetailViewHeader" style={{display: 'flex', marginLeft: 'auto'}}>
          <FormControl
            componentClass="select"
            disabled={!this.state.editing}
            value={this.state.status}
            onChange={this.handleStatusChange}
            style={{marginRight: '5px'}}
          >
            {
              STATUSES.map((status, i) => (
                <option value={status.toLowerCase()} key={i}>
                  {status}
                </option>
              ))
            }
          </FormControl>
          {this.renderEditButtons()}
        </div>
      </div>
    );
  };

  renderTopSection = () => {
    return (
      <div id="TopSection">
        <DetailViewResponse
          question="Email"
          answer={this.props.applicationData.email}
          layout="lineItem"
        />
        <DetailViewResponse
          question="Regional Partner"
          answer={this.props.applicationData.regional_partner_name}
          layout="lineItem"
        />
        <DetailViewResponse
          question="School Name"
          answer={this.props.applicationData.school_name}
          layout="lineItem"
        />
        <DetailViewResponse
          question="District Name"
          answer={this.props.applicationData.district_name}
          layout="lineItem"
        />
      </div>
    );
  };

  renderQuestions = () => {
    return (
      <Facilitator1819Questions
        formResponses={this.props.applicationData.form_data}
      />
    );
  };

  renderNotes = () => {
    return (
      <div>
        <h4>
          Notes
        </h4>
        <FormControl
          id="Notes"
          disabled={!this.state.editing}
          componentClass="textarea"
          value={this.state.notes || ''}
          onChange={this.handleNotesChange}
        />
        <br/>
        {this.renderEditButtons()}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderTopSection()}
        {this.renderQuestions()}
        {this.renderNotes()}
      </div>
    );
  }
}
