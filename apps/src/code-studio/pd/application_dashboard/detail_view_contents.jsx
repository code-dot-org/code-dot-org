import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Button,
  SplitButton,
  MenuItem,
  FormControl,
  InputGroup
} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import DetailViewApplicationSpecificQuestions from './detail_view_application_specific_questions';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';
import { RegionalPartnerDropdown } from './regional_partner_dropdown';
import DetailViewWorkshopAssignmentResponse from './detail_view_workshop_assignment_response';
import ConfirmationDialog from '../workshop_dashboard/components/confirmation_dialog';
import {ValidScores as TeacherValidScores} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import _ from 'lodash';
import {
  ApplicationStatuses,
  ApplicationFinalStatuses,
  UNMATCHED_PARTNER_VALUE,
  UNMATCHED_PARTNER_LABEL
} from './constants';

const styles = {
  notes: {
    height: '95px'
  },
  statusSelect: {
    marginRight: '5px'
  },
  editMenuContainer: {
    display: 'inline-block' // fit contents
  },
  editMenu: {
    display: 'flex'
  },
  // React-Bootstrap components don't play well inside a flex box,
  // so this is required to get the contained split button to stay together.
  flexSplitButtonContainer: {
    flex: '0 0 auto'
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
  },
  lockedStatus: {
    fontFamily: '"Gotham 7r"',
    marginTop: 10
  }
};

const DEFAULT_NOTES = "Google doc rubric completed: Y/N\nTotal points:\n(If interviewing) Interview notes completed: Y/N\nAdditional notes:";

export class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      course: PropTypes.oneOf(['csf', 'csd', 'csp']),
      course_name: PropTypes.string.isRequired,
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
      fit_workshop_id: PropTypes.number,
      fit_workshop_name: PropTypes.string,
      fit_workshop_url: PropTypes.string,
      application_guid: PropTypes.string,
      registered_teachercon: PropTypes.bool,
      registered_fit_weekend: PropTypes.bool,
      attending_teachercon: PropTypes.bool
    }).isRequired,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
    onUpdate: PropTypes.func,
    isWorkshopAdmin: PropTypes.bool,
    regionalPartnerGroup: PropTypes.number,
    regionalPartners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }))
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
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
      regional_partner_name: this.props.applicationData.regional_partner_name || UNMATCHED_PARTNER_LABEL,
      regional_partner_value: this.props.applicationData.regional_partner_id || UNMATCHED_PARTNER_VALUE,
      pd_workshop_id: this.props.applicationData.pd_workshop_id,
      fit_workshop_id: this.props.applicationData.fit_workshop_id
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

  handleAdminEditClick = () => {
    this.context.router.push(`/${this.props.applicationId}/edit`);
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

  handleSummerWorkshopChange = (selection) => {
    this.setState({
      pd_workshop_id: selection ? selection.value : null
    });
  };

  handleFitWorkshopChange = (selection) => {
    this.setState({
      fit_workshop_id: selection ? selection.value : null
    });
  };

  handleScoreChange = (event) => {
    this.setState({
      response_scores: {...this.state.response_scores, [event.target.id.replace('-score', '')]: event.target.value}
    });
  };

  handleRegionalPartnerChange = (selected) => {
    const regional_partner_value = selected ? selected.value : UNMATCHED_PARTNER_VALUE;
    const regional_partner_name = selected ? selected.label : UNMATCHED_PARTNER_LABEL;
    this.setState({ regional_partner_name, regional_partner_value});
  };

  handleSaveClick = () => {
    let stateValues = [
      'status',
      'locked',
      'notes',
      'regional_partner_value',
      'pd_workshop_id'
    ];

    if (this.props.applicationData.application_type === 'Facilitator') {
      stateValues.push('fit_workshop_id');
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

      // Notify the parent of the updated data.
      // The parent is responsible for passing it back in as props.
      if (this.props.onUpdate) {
        this.props.onUpdate(applicationData);
      }
    });
  };

  handleDeleteApplicationClick = () => {
    this.setState({showDeleteApplicationConfirmation: true});
  };

  handleDeleteApplicationCancel = () => {
    this.setState({showDeleteApplicationConfirmation: false});
  };

  handleDeleteApplicationConfirmed = () => {
    $.ajax({
      method: "DELETE",
      url: `/api/v1/pd/applications/${this.props.applicationId}`
    }).done(() => {
      this.setState({deleted: true, showDeleteApplicationConfirmation: false});
    }).fail(() => {
      this.setState({deleted: false, showDeleteApplicationConfirmation: false});
    });
  };

  handleDeleteTeacherconRegistrationClick = () => {
    this.setState({showDeleteTeacherconRegistrationConfirmation: true});
  };

  handleDeleteTeacherconRegistrationCancel = () => {
    this.setState({showDeleteTeacherconRegistrationConfirmation: false});
  };

  handleDeleteTeacherconRegistrationConfirmed = () => {
    $.ajax({
      method: "DELETE",
      url: `/pd/teachercon_registration/${this.props.applicationData.application_guid}`
    }).done(() => {
      this.setState({showDeleteTeacherconRegistrationConfirmation: false});
      if (this.props.onUpdate) {
        this.props.onUpdate({ ...this.props.applicationData, registered_teachercon: false });
      }
    }).fail(() => {
      this.setState({showDeleteTeacherconRegistrationConfirmation: false});
    });
  };

  handleDeleteFitWeekendRegistrationClick = () => {
    this.setState({showDeleteFitWeekendRegistrationConfirmation: true});
  };

  handleDeleteFitWeekendRegistrationCancel = () => {
    this.setState({showDeleteFitWeekendRegistrationConfirmation: false});
  };

  handleDeleteFitWeekendRegistrationConfirmed = () => {
    $.ajax({
      method: "DELETE",
      url: `/pd/fit_weekend_registration/${this.props.applicationData.application_guid}`
    }).done(() => {
      this.setState({showDeleteFitWeekendRegistrationConfirmation: false});
      if (this.props.onUpdate) {
        this.props.onUpdate({ ...this.props.applicationData, registered_fit_weekend: false });
      }
    }).fail(() => {
      this.setState({showDeleteFitWeekendRegistrationConfirmation: false});
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
          regionalPartnerFilter={{value: this.state.regional_partner_value, label: this.state.regional_partner_name}}
          regionalPartners={this.props.regionalPartners}
          additionalOptions={[{label: UNMATCHED_PARTNER_LABEL, value: UNMATCHED_PARTNER_VALUE}]}
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
        <Button
          onClick={this.handleCancelEditClick}
          key="cancel"
        >
          Cancel
        </Button>
      )];
    } else if (this.props.isWorkshopAdmin) {
      return (
        <div style={styles.flexSplitButtonContainer}>
          <SplitButton
            id="admin-edit"
            pullRight
            title="Edit"
            onClick={this.handleEditClick}
          >
            <MenuItem
              onSelect={this.handleAdminEditClick}
            >
              (Admin) Edit Form Data
            </MenuItem>
            <MenuItem
              style={styles.delete}
              onSelect={this.handleDeleteApplicationClick}
            >
              Delete Application
            </MenuItem>
            <ConfirmationDialog
              show={this.state.showDeleteApplicationConfirmation}
              onOk={this.handleDeleteApplicationConfirmed}
              onCancel={this.handleDeleteApplicationCancel}
              headerText="Delete Application"
              bodyText="Are you sure you want to delete this application? You will not be able to undo this."
              okText="Delete"
            />
            {
              this.props.applicationData.registered_teachercon &&
              <MenuItem
                style={styles.delete}
                onSelect={this.handleDeleteTeacherconRegistrationClick}
              >
                Delete Teachercon Registration
              </MenuItem>
            }
            {
              this.props.applicationData.registered_teachercon &&
              <ConfirmationDialog
                show={this.state.showDeleteTeacherconRegistrationConfirmation}
                onOk={this.handleDeleteTeacherconRegistrationConfirmed}
                onCancel={this.handleDeleteTeacherconRegistrationCancel}
                headerText="Delete Teachercon Registration"
                bodyText="Are you sure you want to delete this Teachercon registration? You will not be able to undo this."
                okText="Delete"
              />
            }
            {
              this.props.applicationData.registered_fit_weekend &&
              <MenuItem
                style={styles.delete}
                onSelect={this.handleDeleteFitWeekendRegistrationClick}
              >
                Delete FiT Weekend Registration
              </MenuItem>
            }
            {
              this.props.applicationData.registered_fit_weekend &&
              <ConfirmationDialog
                show={this.state.showDeleteFitWeekendRegistrationConfirmation}
                onOk={this.handleDeleteFitWeekendRegistrationConfirmed}
                onCancel={this.handleDeleteFitWeekendRegistrationCancel}
                headerText="Delete FiT Weekend Registration"
                bodyText="Are you sure you want to delete this FiT Weekend registration? You will not be able to undo this."
                okText="Delete"
              />
            }
          </SplitButton>
        </div>
      );
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
      return (
        <div style={styles.statusSelectGroup}>
          {selectControl}
        </div>
      );
    }
  };

  showLocked = () => (
    this.props.isWorkshopAdmin
    || this.props.viewType === 'facilitator'
    || (this.props.viewType ==='teacher' && this.props.regionalPartnerGroup === 3)
  );

  renderEditMenu = (textAlign='left') => {
    return (
      <div style={styles.editMenuContainer}>
        <div style={styles.editMenu}>
          {this.renderStatusSelect()}
          {this.renderEditButtons()}
        </div>
        {
          this.showLocked() &&
          <div style={{...styles.lockedStatus, textAlign}}>
            <FontAwesome icon={this.state.locked ? 'lock' : 'unlock'}/>&nbsp;
            Application is&nbsp;
            {this.state.locked ? 'Locked' : 'Unlocked'}
          </div>
        }
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
          {this.props.applicationData.course === 'csp' &&
            <h4>
              <a target="_blank" href="https://docs.google.com/document/d/1ounHnw4fdihHiMwcNNjtQeK4avHz8Inw7W121PbDQRw/edit#heading=h.p1d568zb27s0">
                View CS Principles Rubric
              </a>
            </h4>
          }
          {this.props.applicationData.course === 'csd' &&
            <h4>
              <a target="_blank" href="https://docs.google.com/document/d/1Sjzd_6zjHyXLgzIUgHVp-AeRK2y3hZ1PUjg8lTtWsHs/edit#heading=h.fqiranmp717e">
                View CS Discoveries Rubric
              </a>
            </h4>
          }
        </div>

        <div id="DetailViewHeader" style={styles.detailViewHeader}>
          {this.renderEditMenu('right')}
        </div>
      </div>
    );
  };

  renderRegistrationLinks = () => {
    const registrationLinks = [];

    const buildRegistrationLink = (urlKey) => (
      <a href={`/pd/${urlKey}/${this.props.applicationData.application_guid}`}>
        {`${window.location.host}/pd/${urlKey}/${this.props.applicationData.application_guid}`}
      </a>
    );

    if (this.props.isWorkshopAdmin && this.props.applicationData.status === 'accepted' && this.props.applicationData.locked) {
      if (this.props.applicationData.attending_teachercon) {
        registrationLinks.push((
          <DetailViewResponse
            question="TeacherCon Registration Link"
            layout="lineItem"
            answer={buildRegistrationLink('teachercon_registration')}
          />
        ));
      }

      if (this.props.applicationData.fit_workshop_id) {
        registrationLinks.push((
          <DetailViewResponse
            question="FiT Weekend Registration Link"
            layout="lineItem"
            answer={buildRegistrationLink('fit_weekend_registration')}
          />
        ));
      }
    }

    return registrationLinks;
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

      <DetailViewWorkshopAssignmentResponse
        question="Summer Workshop"
        courseName={this.props.applicationData.course_name}
        subjectType="summer"
        assignedWorkshop={{
          id: this.state.pd_workshop_id,
          name: this.props.applicationData.pd_workshop_name,
          url: this.props.applicationData.pd_workshop_url
        }}
        editing={!!this.state.editing}
        onChange={this.handleSummerWorkshopChange}
      />

      {this.props.applicationData.application_type === 'Facilitator' &&
        <DetailViewWorkshopAssignmentResponse
          question="FIT Workshop"
          courseName={this.props.applicationData.course_name}
          subjectType="fit"
          assignedWorkshop={{
            id: this.state.fit_workshop_id,
            name: this.props.applicationData.fit_workshop_name,
            url: this.props.applicationData.fit_workshop_url
          }}
          editing={!!(this.state.editing && this.props.isWorkshopAdmin)}
          onChange={this.handleFitWorkshopChange}
        />
      }
      {this.props.isWorkshopAdmin && this.renderRegistrationLinks()}
      {this.props.isWorkshopAdmin && this.renderRegionalPartnerPanel()}
    </div>
  );

  renderQuestions = () => {
    return (
      <DetailViewApplicationSpecificQuestions
        formResponses={this.props.applicationData.form_data}
        applicationType={this.props.applicationData.application_type}
        editing={this.state.editing}
        scores={this.state.response_scores}
        handleScoreChange={this.handleScoreChange}
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
        <Row>
          <Col md={8}>
            <FormControl
              id="Notes"
              disabled={!this.state.editing}
              componentClass="textarea"
              value={this.state.notes || ''}
              onChange={this.handleNotesChange}
              style={styles.notes}
            />
          </Col>
        </Row>
        <br />
      </div>
    );
  };

  render() {
    if (this.state.hasOwnProperty('deleted')) {
      const message = this.state.deleted ? "This application has been deleted." : "This application could not be deleted.";
      return (
        <h4>{message}</h4>
      );
    }
    return (
      <div id="detail-view">
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
  regionalPartnerGroup: state.regionalPartnerGroup,
  regionalPartners: state.regionalPartners,
  canLock: state.permissions.lockApplication,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(DetailViewContents);
