import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import DetailViewApplicationSpecificQuestions from './detail_view_application_specific_questions';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import {ValidScores as TeacherValidScores} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import _ from 'lodash';
import {
  ApplicationStatuses,
  ApplicationFinalStatuses,
  UnmatchedFilter,
  UnmatchedLabel
} from './constants';

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

export class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      regional_partner_name: PropTypes.string,
      locked: PropTypes.bool,
      regional_partner_id: PropTypes.number,
      notes: PropTypes.string,
      status: PropTypes.string.isRequired,
      school_name: PropTypes.string,
      district_name: PropTypes.string,
      email: PropTypes.string,
      form_data: PropTypes.object,
      application_type: PropTypes.oneOf(['Facilitator', 'Teacher']),
      response_scores: PropTypes.object,
      meets_criteria: PropTypes.string,
      bonus_points: PropTypes.number
    }),
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
    reload: PropTypes.func.isRequired,
    isWorkshopAdmin: PropTypes.bool
  };

  state = {
    status: this.props.applicationData.status,
    locked: this.props.applicationData.locked,
    notes: this.props.applicationData.notes || "Google doc rubric completed: Y/N\nTotal points:\n(If interviewing) Interview notes completed: Y/N\nAdditional notes:",
    response_scores: this.props.applicationData.response_scores || {},
    editing: false,
    regional_partner_name: this.props.applicationData.regional_partner_name || UnmatchedLabel,
    regional_partner_filter: this.props.applicationData.regional_partner_id || UnmatchedFilter
  };

  componentWillMount() {
    this.statuses = ApplicationStatuses[this.props.viewType];
  }

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      status: this.props.applicationData.status,
      locked: this.props.applicationData.locked,
      notes: this.props.applicationData.notes,
      regional_partner_name: this.props.applicationData.regional_partner_name,
      regional_partner_filter: this.props.applicationData.regional_partner_id
    });
  };

  handleEditClick = () => {
    this.setState({
      editing: true
    });
  };

  handleLockClick = () => {
    this.setState({
      locked: !this.state.locked,
    });
  }

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

  handleScoreChange = (event) => {
    this.setState({
      response_scores: {...this.state.response_scores, [event.target.id.replace('-score', '')]: event.target.value}
    });
  };

  handleRegionalPartnerChange = (selected) => {
    const regional_partner_filter = selected ? selected.value : UnmatchedFilter;
    const regional_partner_name = selected ? selected.label : UnmatchedLabel;
    this.setState({ regional_partner_name, regional_partner_filter});
  };

  handleSaveClick = () => {
    const data = {
      ...(_.pick(this.state, [
        'status',
        'locked',
        'notes',
        'regional_partner_filter'
      ])),
      response_scores: JSON.stringify(this.state.response_scores)
    };
    $.ajax({
      method: "PATCH",
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done((applicationData) => {
      this.setState({
        editing: false
      });

      //Reload the page, but don't display the spinner
      this.props.reload();
    });
  };

  renderLockButton = () => {
    const statusIsLockable = ApplicationFinalStatuses.includes(this.state.status);
    return (
      <Button
        title={!statusIsLockable && `Can only lock if status is one of ${ApplicationFinalStatuses.join(', ')}`}
        disabled={!(this.state.editing && statusIsLockable)}
        onClick={this.handleLockClick}
      >
        {this.state.locked ? "Unlock" : "Lock"}
      </Button>
    );
  };

  renderRegionalPartnerAnswer = () => {
    if (this.state.editing && this.props.isWorkshopAdmin) {
      return (
        <RegionalPartnerDropdown
          onChange={this.handleRegionalPartnerChange}
          regionalPartnerFilter={this.state.regional_partner_filter}
          additionalOptions={[{label: UnmatchedLabel, value: UnmatchedFilter}]}
        />
      );
    }
    return this.state.regional_partner_name;
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

  renderStatusSelect = () => {
    const selectControl = (
      <FormControl
        componentClass="select"
        disabled={this.state.locked || !this.state.editing}
        title={this.state.locked && "The status of this application has been locked"}
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
    );

    if (this.props.canLock) {
      // Render the select with the lock button in a fancy InputGroup
      return (
        <InputGroup style={{maxWidth: 200, marginRight: 5}}>
          <InputGroup.Button>
            {this.renderLockButton()}
          </InputGroup.Button>
          {selectControl}
        </InputGroup>
      );
    } else {
      // Render just the select; otherwise, rendering a single element in an
      // InputGroup makes it look funky
      return selectControl;
    }
  };

  renderHeader = () => {
    return (
      <div style={styles.headerWrapper}>
        <div>
          <h1>
            {`${this.props.applicationData.form_data.firstName} ${this.props.applicationData.form_data.lastName}`}
          </h1>
          <h4>
            Meets all criteria: {this.props.applicationData.meets_criteria}
          </h4>
          <h4>
            Bonus Points: {this.props.applicationData.bonus_points}
          </h4>
        </div>

        <div id="DetailViewHeader" style={styles.detailViewHeader}>
          {this.renderStatusSelect()}
          {this.renderEditButtons()}
        </div>
      </div>
    );
  };

  renderTopSection = () => {
    const regionalPartnerAnswer = this.renderRegionalPartnerAnswer();
    return (
      <div id="TopSection">
        <DetailViewResponse
          question="Email"
          answer={this.props.applicationData.email}
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
        {
          this.props.applicationData.application_type === 'Teacher' ?
            (
              <DetailViewResponse
                question="Regional Partner"
                questionId="regionalPartnerName"
                answer={regionalPartnerAnswer}
                layout="panel"
                score={this.state.response_scores['regionalPartnerName']}
                possibleScores={TeacherValidScores['regionalPartnerName']}
                editing={this.state.editing}
                handleScoreChange={this.handleScoreChange}
              />
            ) : (
              <DetailViewResponse
                question="Regional Partner"
                answer={regionalPartnerAnswer}
                layout="panel"
              />
            )
        }
      </div>
    );
  };

  renderQuestions = () => {
    return (
      <DetailViewApplicationSpecificQuestions
        formResponses={this.props.applicationData.form_data}
        applicationType={this.props.applicationData.application_type}
        editing={this.state.editing}
        scores={this.state.response_scores}
        handleScoreChange={this.handleScoreChange}
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
              value={this.state.notes}
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
        <br/>
        {this.renderTopSection()}
        {this.renderQuestions()}
        {this.renderNotes()}
      </div>
    );
  }
}

export default connect(state => ({
  canLock: state.permissions.lockApplication,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(DetailViewContents);
