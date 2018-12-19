import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Button,
  SplitButton,
  MenuItem,
  FormControl,
  InputGroup,
  Table,
  FormGroup
} from 'react-bootstrap';
import Select from "react-select";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';
import {
  RegionalPartnerDropdown,
  UNMATCHED_PARTNER_VALUE,
  UNMATCHED_PARTNER_LABEL
} from '../components/regional_partner_dropdown';
import ConfirmationDialog from '../components/confirmation_dialog';
import {
  LabelOverrides,
  PageLabels,
  SectionHeaders,
  ScoreableQuestions,
  MultiAnswerQuestionFields,
  ValidScores as TeacherValidScores,
  ScholarshipDropdownOptions
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import _ from 'lodash';
import {
  ApplicationStatuses,
  ApplicationFinalStatuses
} from './constants';
import PrincipalApprovalButtons from './principal_approval_buttons';
import DetailViewWorkshopAssignmentResponse from './detail_view_workshop_assignment_response';
import ChangeLog from './detail_view/change_log';

const styles = {
  notes: {
    height: '95px'
  },
  statusSelect: {
    width: 250, // wide enough for the widest status
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
    marginRight: 5,
    marginLeft: 5,
  },
  lockedStatus: {
    fontFamily: '"Gotham 7r"',
    marginTop: 10
  },
  caption: {
    color: "black"
  },
  detailViewTable: {
    width: '80%'
  },
  questionColumn: {
    width: '50%'
  },
  answerColumn: {
    width: '30%'
  },
  scoringColumn: {
    width: '20%'
  }
};

const NA = "N/A";

const DEFAULT_NOTES = "Google doc rubric completed: Y/N\nTotal points:\n(If interviewing) Interview notes completed: Y/N\nAdditional notes:";

export class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      course: PropTypes.oneOf(['csf', 'csd', 'csp']),
      course_name: PropTypes.string.isRequired,
      regional_partner_name: PropTypes.string,
      regional_partner_emails_sent_by_system: PropTypes.bool,
      regional_partner_id: PropTypes.number,
      locked: PropTypes.bool,
      notes: PropTypes.string,
      notes_2: PropTypes.string,
      notes_3: PropTypes.string,
      notes_4: PropTypes.string,
      notes_5: PropTypes.string,
      status: PropTypes.string.isRequired,
      school_name: PropTypes.string,
      district_name: PropTypes.string,
      email: PropTypes.string,
      form_data: PropTypes.object,
      application_year: PropTypes.string,
      application_type: PropTypes.oneOf(['Facilitator', 'Teacher']),
      response_scores: PropTypes.object,
      meets_criteria: PropTypes.string,
      meets_scholarship_criteria: PropTypes.string,
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
      attending_teachercon: PropTypes.bool,
      school_stats: PropTypes.object,
      status_change_log: PropTypes.arrayOf(PropTypes.object),
      scholarship_status: PropTypes.string,
      principal_approval_state: PropTypes.string
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
    // Principal Implementation is only scoreable in csd applications. It was the one
    // exception to the whole thing and not worth reimplimenting the consts file
    const bonusPoints = this.props.applicationData.course === 'csd' ? ScoreableQuestions['bonusPoints']
      : _.filter(ScoreableQuestions['bonusPoints'], (x) => x !== 'principal_implementation');

    return {
      editing: false,
      status: this.props.applicationData.status,
      locked: this.props.applicationData.locked,
      notes: this.props.applicationData.notes,
      notes_2: this.props.applicationData.notes_2,
      notes_3: this.props.applicationData.notes_3,
      notes_4: this.props.applicationData.notes_4,
      notes_5: this.props.applicationData.notes_5,
      response_scores: this.props.applicationData.response_scores,
      regional_partner_name: this.props.applicationData.regional_partner_name || UNMATCHED_PARTNER_LABEL,
      regional_partner_value: this.props.applicationData.regional_partner_id || UNMATCHED_PARTNER_VALUE,
      pd_workshop_id: this.props.applicationData.pd_workshop_id,
      fit_workshop_id: this.props.applicationData.fit_workshop_id,
      scholarship_status: this.props.applicationData.scholarship_status,
      bonus_point_questions: bonusPoints
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
    const workshopAssigned = this.props.applicationData.pd_workshop_id || this.props.applicationData.fit_workshop_id;
    if (this.props.applicationData.regional_partner_emails_sent_by_system && !workshopAssigned && ['accepted_no_cost_registration', 'registration_sent'].includes(event.target.value)) {
      this.setState({
        showCantSaveStatusDialog: true
      });
    } else {
      this.setState({
        status: event.target.value
      });
    }
  };

  handleCantSaveStatusOk = (event) => {
    this.setState({
      showCantSaveStatusDialog: false
    });
  };

  handleNotesChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
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
    // The format of the id is key-category. The format of the response scores is a hash
    // with keys like bonus points, scholarship criteria, etc. The category says which
    // section of the response scores to put the key in.
    const keyCategory = event.target.id.split('-');
    const key = keyCategory[0];
    const category = keyCategory[1];

    const responseScores = this.state.response_scores;
    responseScores[category][key] = event.target.value;
    this.setState({
      response_scores: responseScores,
    });
  };

  handleRegionalPartnerChange = (selected) => {
    const regional_partner_value = selected ? selected.value : UNMATCHED_PARTNER_VALUE;
    const regional_partner_name = selected ? selected.label : UNMATCHED_PARTNER_LABEL;
    this.setState({ regional_partner_name, regional_partner_value});
  };

  handleScholarshipStatusChange = (selection) => {
    this.setState({
      scholarship_status: selection ? selection.value : null
    });
  };

  handleSaveClick = () => {
    let stateValues = [
      'status',
      'locked',
      'notes',
      'notes_2',
      'notes_3',
      'notes_4',
      'notes_5',
      'regional_partner_value',
      'pd_workshop_id'
    ];

    if (this.props.applicationData.application_type === 'Facilitator') {
      stateValues.push('fit_workshop_id');
    }

    if (this.props.applicationData.application_type === 'Teacher') {
      stateValues.push('scholarship_status');
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

  renderWorkshopAnswer = () => {
    return (
      <DetailViewWorkshopAssignmentResponse
        question="Summer Workshop"
        courseName={this.props.applicationData.course_name}
        subjectType="summer"
        year={parseInt(this.props.applicationData.application_year.split('-')[0], 10)}
        assignedWorkshop={{
          id: this.state.pd_workshop_id,
          name: this.props.applicationData.pd_workshop_name,
          url: this.props.applicationData.pd_workshop_url
        }}
        editing={!!this.state.editing}
        onChange={this.handleSummerWorkshopChange}
      />
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

  renderScholarshipStatusAnswer = () => {
    if (this.state.editing && this.props.isWorkshopAdmin) {
      return (
        <FormGroup>
          <Select
            value={this.state.scholarship_status}
            onChange={this.handleScholarshipStatusChange}
            options={ScholarshipDropdownOptions}
          />
        </FormGroup>
      );
    }

    const option = ScholarshipDropdownOptions.find((option) => {
      return option.value === this.state.scholarship_status;
    });
    if (option) {
      return option.label;
    }
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
      <div>
        <FormControl
          componentClass="select"
          disabled={this.state.locked || !this.state.editing}
          title={this.state.locked && "The status of this application has been locked"}
          value={this.state.status}
          onChange={this.handleStatusChange}
          style={styles.statusSelect}
        >
          {
            Object.keys(this.statuses).map((status, i) => (
              <option value={status} key={i}>
                {this.statuses[status]}
              </option>
            ))
          }
        </FormControl>
        <ConfirmationDialog
          show={this.state.showCantSaveStatusDialog}
          onOk={this.handleCantSaveStatusOk}
          headerText="Cannot save applicant status"
          bodyText={
            `Please assign a summer workshop to this applicant before setting this
            applicant's status to "Accepted - No Cost Registration" or "Registration Sent".
            These statuses will trigger an automated email with a registration link to their
            assigned workshop.`
          }
          okText="OK"
        />
      </div>
    );

    if (this.props.canLock && this.props.applicationData.application_type === 'Facilitator') {
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

  showLocked = () => (this.props.viewType === 'facilitator');

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
            Meets scholarship requirements? {this.props.applicationData.meets_scholarship_criteria}
          </h4>
          <h4>
            Bonus Points: {this.props.applicationData.bonus_points}
          </h4>
          {this.props.applicationData.course === 'csp' &&
            <h4>
              <a target="_blank" href="https://drive.google.com/file/d/1_X_Tw3tVMSL2re_DcrSUC9Z5CH9js3Gd/view">
                View CS Principles Rubric
              </a>
            </h4>
          }
          {this.props.applicationData.course === 'csd' &&
            <h4>
              <a target="_blank" href="https://drive.google.com/file/d/12Ntxq7TV1XYsD2eaZJVt5DqSctqR2hUj/view">
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

  renderNotes = () => {
    let notesFields = [];
    [
      {label: 'Notes', id: 'notes', value: this.state.notes},
      {label: 'Notes 2', id: 'notes_2', value: this.state.notes_2},
      {label: 'Notes 3', id: 'notes_3', value: this.state.notes_3},
      {label: 'Notes 4', id: 'notes_4', value: this.state.notes_4},
      {label: 'Notes 5', id: 'notes_5', value: this.state.notes_5}
    ].forEach((field)=> {
      notesFields.push (
        <div key={field.id}>
          <h4>
            {field.label}
          </h4>
          <Row>
            <Col md={8}>
              <FormControl
                id={field.id}
                disabled={!this.state.editing}
                componentClass="textarea"
                value={field.value || ''}
                onChange={this.handleNotesChange}
                style={styles.notes}
              />
            </Col>
          </Row>
          <br />
        </div>
      );
    });
    return notesFields;
  };

  renderScoringSection = (key) => {
    const snakeCaseKey = _.snakeCase(key);

    if (this.props.viewType === 'facilitator') {
      return false;
    }

    let scoringDropdowns = [];
    if (ScoreableQuestions[`criteriaScoreQuestions${_.startCase(this.props.applicationData.course)}`].includes(snakeCaseKey)) {
      scoringDropdowns.push(
        <div key="meets_minimum_criteria_scores">
          Meets minimum requirements?
          {this.renderScoringDropdown(snakeCaseKey, 'meets_minimum_criteria_scores')}
        </div>
      );
    }
    if (this.state.bonus_point_questions.includes(snakeCaseKey)) {
      if (scoringDropdowns.length) {
        scoringDropdowns.push(<br key="bonus_points_br"/>);
      }
      scoringDropdowns.push(
        <div key="bonus_points_scores">
          Bonus Points?
          {this.renderScoringDropdown(snakeCaseKey, 'bonus_points_scores')}
        </div>
      );
    }
    if (ScoreableQuestions['scholarshipQuestions'].includes(snakeCaseKey)) {
      if (scoringDropdowns.length) {
        scoringDropdowns.push(<br key="meets_scholarship_criteria_br"/>);
      }
      scoringDropdowns.push(
        <div key="meets_scholarship_criteria_scores">
          Meets scholarship requirements?
          {this.renderScoringDropdown(snakeCaseKey, 'meets_scholarship_criteria_scores')}
        </div>
      );
    }

    return (
      <td style={styles.scoringColumn}>
        {scoringDropdowns}
      </td>
    );
  };

  renderScoringDropdown(key, category) {
    const scores = TeacherValidScores[_.camelCase(key)][_.camelCase(category)] || TeacherValidScores[_.camelCase(key)];

    return (
      <FormControl
        componentClass="select"
        value={this.state.response_scores[category][key]}
        id={`${key}-${category}-score`}
        onChange={this.handleScoreChange}
        disabled={!this.state.editing}
      >
        <option>--</option>
        {
          scores.map((score, i) => (
            <option value={score} key={i}>
              {score}
            </option>
          ))
        }
      </FormControl>
    );
  }

  showPrincipalApprovalTable = () => {
    return (this.props.applicationData.principal_approval_state || '').startsWith('Complete');
  };

  handlePrincipalApprovalChange = (_id, principalApproval) => {
    this.setState({principalApproval});
  };

  renderDetailViewTableLayout = () => {
    const sectionsToRemove = ['section5AdditionalDemographicInformation', 'section6Submission'];

    return (
      <div>
        {
          _.pull(Object.keys(SectionHeaders), ...sectionsToRemove).map((header, i) => (
            <div key={i}>
              <h3>
                {SectionHeaders[header]}
              </h3>
              <Table style={styles.detailViewTable} striped bordered>
                <tbody>
                {
                  Object.keys(PageLabels[header]).map((key, j) => {
                    return (this.props.applicationData.form_data[key] || header === 'schoolStatsAndPrincipalApprovalSection') && (
                      <tr key={j}>
                        <td style={styles.questionColumn}>
                          {LabelOverrides[key] || PageLabels[header][key]}
                        </td>
                        <td style={styles.answerColumn}>
                          {this.renderAnswer(key, this.props.applicationData.form_data[key])}
                        </td>
                        {this.renderScoringSection(key)}
                      </tr>
                    );
                  })
                }
                </tbody>
              </Table>
            </div>
          ))
        }
      </div>
    );
  };

  renderAnswer = (key, answer) => {
    if (MultiAnswerQuestionFields[key]) {
      return (
        <div>
          {MultiAnswerQuestionFields[key]['teacher'] && (<p>Teacher Response: {this.formatAnswer(key, this.props.applicationData.form_data[_.camelCase(MultiAnswerQuestionFields[key]['teacher'])])}</p>)}
          {MultiAnswerQuestionFields[key]['principal'] && (<p>Principal Response: {this.formatAnswer(key, this.props.applicationData.form_data[_.camelCase(MultiAnswerQuestionFields[key]['principal'])])}</p>)}
          {MultiAnswerQuestionFields[key]['stats'] && (<p>Data from NCES: {this.props.applicationData.school_stats[MultiAnswerQuestionFields[key]['stats']] || NA}</p>)}
        </div>
      );
    } else {
      return this.formatAnswer(key, answer);
    }
  };

  formatAnswer = (key, answer) => {
    if (Array.isArray(answer)) {
      return answer.sort().join(', ');
    } else {
      return answer || NA;
    }
  };

  renderResendOrUnrequirePrincipalApprovalSection = () => {
    if (!this.props.applicationData.principal_approval_state) {
      return (
        <div>
          <h3>Principal Approval</h3>
          <h4>Select option</h4>
          <PrincipalApprovalButtons
            applicationId={this.props.applicationId}
            showSendEmailButton={true}
            showNotRequiredButton={true}
            onChange={this.handlePrincipalApprovalChange}
          />
        </div>
      );
    } else if (this.props.applicationData.principal_approval_state === "Not required") {
      return (
        <div>
          <h3>Principal Approval</h3>
          <h4>Not required</h4>
          <p>
            If you would like to require principal approval for this teacher,
            please click “Send email” to the principal asking for approval.
          </p>
          <PrincipalApprovalButtons
            applicationId={this.props.applicationId}
            showSendEmailButton={true}
            onChange={this.handlePrincipalApprovalChange}
          />
        </div>
      );
    } else { // Approval sent but is not complete
      const principalApprovalUrl =
        `${window.location.origin}/pd/application/principal_approval/${this.props.applicationData.application_guid}`;

      return (
        <div>
          <h3>Principal Approval</h3>
          <h4>{this.props.applicationData.principal_approval_state}</h4>
          <p>
            Link to principal approval form:{' '}
            <a href={principalApprovalUrl} target="_blank">
              {principalApprovalUrl}
            </a>
          </p>
        </div>
      );
    }
  };

  renderTopTableLayout = () => {
    return (
      <Table style={styles.detailViewTable} striped bordered>
        <tbody>
          <tr>
            <td style={styles.questionColumn}>
              Email
            </td>
            <td style={styles.answerColumn}>
              {this.props.applicationData.email}
            </td>
            <td style={styles.scoringColumn}/>
          </tr>
          <tr>
            <td style={styles.questionColumn}>
              School Name
            </td>
            <td style={styles.answerColumn}>
              {this.renderSchoolTrait(this.props.applicationData.school_name, this.props.applicationData.form_data['principal_school'])}
            </td>
            <td style={styles.scoringColumn}/>
          </tr>
        <tr>
          <td style={styles.questionColumn}>
            School District
          </td>
          <td style={styles.answerColumn}>
            {this.renderSchoolTrait(this.props.applicationData.district_name, this.props.applicationData.form_data['principal_school_district'])}
          </td>
          <td style={styles.scoringColumn}/>
        </tr>
        <tr>
          <td style={styles.questionColumn}>
            Summer Workshop
          </td>
          <td style={styles.answerColumn}>
            {this.renderWorkshopAnswer()}
          </td>
          <td style={styles.scoringColumn}/>
        </tr>
        <tr>
          <td style={styles.questionColumn}>
            Regional Partner
          </td>
          <td style={styles.answerColumn}>
            {this.renderRegionalPartnerAnswer()}
          </td>
          {this.renderScoringSection('regionalPartnerName')}
        </tr>
        {this.props.applicationData.application_type === 'Teacher' &&
          <tr>
            <td style={styles.questionColumn}>
              Scholarship Teacher?
            </td>
            <td style={styles.answerColumn}>
              {this.renderScholarshipStatusAnswer()}
            </td>
            <td style={styles.scoringColumn}/>
          </tr>
        }
        </tbody>
      </Table>
    );
  };

  renderSchoolTrait = (teacher_response, principal_response) => {
    if (principal_response && principal_response !== teacher_response) {
      return (
        <div>
          <p>
            Teacher Response: {teacher_response}
          </p>
          <p>
            Principal Presponse: {principal_response}
          </p>
        </div>
      );
    } else {
      return teacher_response;
    }
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
        {this.renderTopTableLayout()}
        {this.renderDetailViewTableLayout()}
        {!this.showPrincipalApprovalTable() && this.renderResendOrUnrequirePrincipalApprovalSection()}
        {this.renderNotes()}
        {this.renderEditMenu()}
        {this.props.applicationData.status_change_log && (
          <ChangeLog
            changeLog={this.props.applicationData.status_change_log}
          />
        )}
      </div>
    );
  }
}

export default connect(state => ({
  regionalPartnerGroup: state.regionalPartners.regionalPartnerGroup,
  regionalPartners: state.regionalPartners.regionalPartners,
  canLock: state.applicationDashboard.permissions.lockApplication,
  isWorkshopAdmin: state.applicationDashboard.permissions.workshopAdmin,
}))(DetailViewContents);
