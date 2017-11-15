import React, {PropTypes} from 'react';
import {Button, FormControl} from 'react-bootstrap';
import DetailViewApplicationSpecificQuestions from './detail_view_application_specific_questions';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';
import {ApplicationStatuses} from './constants';

const styles = {
  notes: {
    height: '95px'
  },
  statusSelect: {
    marginRight: '5px'
  },
  detailViewHeader: {
    display: 'flex',
    marginLeft: 'auto'
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'baseline'
  },
  saveButton: {
    marginRight: '5px'
  }
};

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
      form_data: PropTypes.object,
      application_type: PropTypes.oneOf(['Facilitator', 'Teacher'])
    }),
    updateProps: PropTypes.func.isRequired,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
  };

  componentWillMount() {
    this.statuses = ApplicationStatuses[this.props.viewType];
  }

  state = {
    status: this.props.applicationData.status,
    notes: this.props.applicationData.notes
  };

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      status: this.props.applicationData.status,
      notes: this.props.applicationData.notes
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
      this.props.updateProps({notes: this.state.notes, status: this.state.status});
    });
  };

  renderEditButtons = () => {
    if (this.state.editing) {
      return [(
        <Button
          onClick={this.handleSaveClick}
          bsStyle="primary"
          key="save"
          style={styles.saveButton}
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
      <div style={styles.headerWrapper}>
        <h1>
          {`${this.props.applicationData.form_data.firstName} ${this.props.applicationData.form_data.lastName}`}
        </h1>

        <div id="DetailViewHeader" style={styles.detailViewHeader}>
          <FormControl
            componentClass="select"
            disabled={!this.state.editing}
            value={this.state.status}
            onChange={this.handleStatusChange}
            style={styles.statusSelect}
          >
            {
              this.statuses.map((status, i) => (
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
      <DetailViewApplicationSpecificQuestions
        formResponses={this.props.applicationData.form_data}
        applicationType={this.props.applicationData.application_type}
      />
    );
  };

  renderNotes = () => {
    return (
      <div>
        <h4>
          Notes
        </h4>
        <div className="row">
          <div className="col-md-8">
            <FormControl
              id="Notes"
              disabled={!this.state.editing}
              componentClass="textarea"
              value={this.state.notes || ''}
              onChange={this.handleNotesChange}
              style={styles.notes}
            />
          </div>
        </div>
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
