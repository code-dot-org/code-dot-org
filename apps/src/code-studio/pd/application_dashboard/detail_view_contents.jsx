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
  editMenu: {
    display: 'flex',
  },
  detailViewHeader: {
    marginLeft: 'auto'
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'baseline'
  },
  saveButton: {
    marginRight: '5px'
  },
  statusSelectGroup: {
    maxWidth: 200,
    marginRight: 5,
    marginLeft: 5,
  }
};

const DEFAULT_NOTES = "Google doc rubric completed: Y/N\nTotal points:\n(If interviewing) Interview notes completed: Y/N\nAdditional notes:";

export class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      course_name: PropTypes.string,
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
      bonus_points: PropTypes.number,
      pd_workshop_id: PropTypes.number,
      pd_workshop_name: PropTypes.string,
      pd_workshop_url: PropTypes.string,
      fit_workshop_name: PropTypes.string,
      fit_workshop_url: PropTypes.string,
      application_guid: PropTypes.string
    }).isRequired,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
    course: PropTypes.oneOf(['csf', 'csd', 'csp']),
    reload: PropTypes.func.isRequired,
    isWorkshopAdmin: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = this.getOriginalState();
  }

  getOriginalState() {
    return {
      editing: false,
      status: this.props.applicationData.status,
      locked: this.props.applicationData.locked,
      notes: this.props.applicationData.notes,
      response_scores: this.props.applicationData.response_scores || {},
      regional_partner_name: this.props.applicationData.regional_partner_name || UnmatchedLabel,
      regional_partner_filter: this.props.applicationData.regional_partner_id || UnmatchedFilter,
      pd_workshop_id: this.props.applicationData.pd_workshop_id
    };
  }

  componentWillMount() {
    this.statuses = ApplicationStatuses[this.props.viewType];
    if (this.props.applicationData.application_type === 'Facilitator' && !this.props.applicationData.notes) {
      this.setState({notes: DEFAULT_NOTES});
    }
  }

  handleCancelEditClick = () => {
    this.setState(this.getOriginalState());
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

  handleSelectedWorkshopChange = (selection) => {
    this.setState({
      pd_workshop_id: selection ? selection.value : null
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
    let stateValues = [
      'status',
      'locked',
      'notes',
      'regional_partner_filter',
    ];

    if (this.props.applicationData.application_type === 'Teacher') {
      stateValues.push('pd_workshop_id');
    }

    const data = {
      ...(_.pick(this.state, stateValues)),
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
        <InputGroup style={styles.statusSelectGroup}>
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

  renderEditMenu = () => {
    return (
      <div style={styles.editMenu}>
        {this.renderStatusSelect()}
        {this.renderEditButtons()}
      </div>
    );
  };

  renderHeader = () => {
    return (
      <div style={styles.headerWrapper}>
        <div>
          <h1>
            {`${this.props.applicationData.form_data.firstName} ${this.props.applicationData.form_data.lastName}`}
          </h1>
          <h4>
            Meets minimum requirements? {this.props.applicationData.meets_criteria}
          </h4>
          <h4>
            Bonus Points: {this.props.applicationData.bonus_points}
          </h4>
          {this.props.course === 'csp' &&
            <h4>
              <a target="_blank" href="https://docs.google.com/document/d/1ounHnw4fdihHiMwcNNjtQeK4avHz8Inw7W121PbDQRw/edit#heading=h.p1d568zb27s0">
                View CS Principles Rubric
              </a>
            </h4>
          }
          {this.props.course === 'csd' &&
            <h4>
              <a target="_blank" href="https://docs.google.com/document/d/1Sjzd_6zjHyXLgzIUgHVp-AeRK2y3hZ1PUjg8lTtWsHs/edit#heading=h.fqiranmp717e">
                View CS Discoveries Rubric
              </a>
            </h4>
          }
        </div>

        <div id="DetailViewHeader" style={styles.detailViewHeader}>
          {this.renderEditMenu()}
        </div>
      </div>
    );
  };

  renderRegionalPartnerPanel = () => {
    if (this.props.applicationData.application_type === 'Teacher') {
      return (
        <DetailViewResponse
          question="Regional Partner"
          questionId="regionalPartnerName"
          answer={this.renderRegionalPartnerAnswer()}
          layout="panel"
          score={this.state.response_scores['regionalPartnerName']}
          possibleScores={TeacherValidScores['regionalPartnerName']}
          editing={this.state.editing}
          handleScoreChange={this.handleScoreChange}
        />
      );
    } else {
      return (
        <DetailViewResponse
          question="Regional Partner"
          answer={this.renderRegionalPartnerAnswer()}
          layout="panel"
        />
      );
    }
  };

  renderTopSection = () => (
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
      {this.props.applicationData.pd_workshop_name &&
        this.renderAssignedSummerWorkshop()
      }
      {this.props.applicationData.application_type === 'Facilitator' &&
        this.renderAssignedFitWorkshop()
      }
      {this.props.isWorkshopAdmin && this.renderRegionalPartnerPanel()}
    </div>
  );

  renderAssignedSummerWorkshop() {
    let answer;
    if (this.props.applicationData.pd_workshop_url) {
      answer = (
        <span>
          {this.props.applicationData.pd_workshop_name} (
          <a href={this.props.applicationData.pd_workshop_url} target="_blank">
            see workshop
          </a>)
        </span>
      );
    } else {
      answer = "Unassigned";
    }
    return (
      <DetailViewResponse
        question="Summer Workshop"
        answer={answer}
        layout="lineItem"
      />
    );
  }

  renderAssignedFitWorkshop() {
    let answer;
    if (this.props.applicationData.fit_workshop_url) {
      answer = (
        <span>
          {this.props.applicationData.fit_workshop_name} (
          <a href={this.props.applicationData.fit_workshop_url} target="_blank">
            see workshop
          </a>)
        </span>
      );
    } else {
      answer = "Unassigned";
    }

    return (
      <DetailViewResponse
        question="FIT Workshop"
        answer={answer}
        layout="lineItem"
      />
    );
  }

  renderQuestions = () => {
    return (
      <DetailViewApplicationSpecificQuestions
        formResponses={this.props.applicationData.form_data}
        applicationType={this.props.applicationData.application_type}
        editing={this.state.editing}
        scores={this.state.response_scores}
        handleScoreChange={this.handleScoreChange}
        courseName={this.props.applicationData.course_name}
        assignedWorkshopId={this.state.pd_workshop_id}
        handleSelectedWorkshopChange={this.handleSelectedWorkshopChange}
        applicationGuid={this.props.applicationData.application_guid}
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
        <br />
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
        {this.renderEditMenu()}
      </div>
    );
  }
}

export default connect(state => ({
  canLock: state.permissions.lockApplication,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(DetailViewContents);
