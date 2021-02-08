import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {
  Row,
  Col,
  Button,
  SplitButton,
  MenuItem,
  FormControl,
  InputGroup,
  Table
} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';
import {
  RegionalPartnerDropdown,
  UNMATCHED_PARTNER_VALUE,
  UNMATCHED_PARTNER_LABEL
} from '../components/regional_partner_dropdown';
import ConfirmationDialog from '../components/confirmation_dialog';
import {ScholarshipDropdown} from '../components/scholarshipDropdown';
import {
  LabelOverrides as TeacherLabelOverrides,
  PageLabels as TeacherPageLabelsOverrides,
  SectionHeaders as TeacherSectionHeaders,
  ScoreableQuestions as TeacherScoreableQuestions,
  MultiAnswerQuestionFields as TeacherMultiAnswerQuestionFields,
  ValidScores as TeacherValidScores
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {
  InterviewQuestions,
  LabelOverrides as FacilitatorLabelOverrides,
  PageLabels as FacilitatorPageLabelsOverrides,
  SectionHeaders as FacilitatorSectionHeaders,
  ScoreableQuestions as FacilitatorScoreableQuestions,
  ValidScores as FacilitatorValidScores
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';
import {CourseSpecificScholarshipDropdownOptions} from '@cdo/apps/generated/pd/scholarshipInfoConstants';
import _ from 'lodash';
import {
  getApplicationStatuses,
  ApplicationFinalStatuses,
  ApplicationTypes,
  ScholarshipStatusRequiredStatuses
} from './constants';
import {FacilitatorScoringFields} from './detail_view/facilitator_scoring_fields';
import PrincipalApprovalButtons from './principal_approval_buttons';
import DetailViewWorkshopAssignmentResponse from './detail_view_workshop_assignment_response';
import ChangeLog from './detail_view/change_log';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';

const styles = {
  notes: {
    height: '95px'
  },
  statusSelect: {
    width: 250 // wide enough for the widest status
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
    marginLeft: 5
  },
  editButton: {
    width: 'auto'
  },
  lockedStatus: {
    fontFamily: '"Gotham 7r"',
    marginTop: 10
  },
  caption: {
    color: 'black'
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
  },
  scoringDropdown: {
    marginTop: '10px',
    marginBottom: '10px'
  },
  scoreBreakdown: {
    marginLeft: '30px'
  }
};

const NA = 'N/A';

const DEFAULT_NOTES =
  'Strengths:\nWeaknesses:\nPotential red flags to follow-up on:\nOther notes:';

const WORKSHOP_REQUIRED = `Please assign a summer workshop to this applicant before setting this
                          applicant's status to "Accepted - No Cost Registration" or "Registration Sent".
                          These statuses will trigger an automated email with a registration link to their
                          assigned workshop.`;

export class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      course: PropTypes.oneOf(['csf', 'csd', 'csp']),
      course_name: PropTypes.string.isRequired,
      regional_partner_name: PropTypes.string,
      update_emails_sent_by_system: PropTypes.bool,
      regional_partner_id: PropTypes.number,
      locked: PropTypes.bool,
      notes: PropTypes.string,
      notes_2: PropTypes.string,
      notes_3: PropTypes.string,
      notes_4: PropTypes.string,
      notes_5: PropTypes.string,
      question_1: PropTypes.string,
      question_2: PropTypes.string,
      question_3: PropTypes.string,
      question_4: PropTypes.string,
      question_5: PropTypes.string,
      question_6: PropTypes.string,
      question_7: PropTypes.string,
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
      all_scores: PropTypes.object,
      total_scores: PropTypes.number,
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
      principal_approval_state: PropTypes.string,
      allow_sending_principal_email: PropTypes.bool
    }).isRequired,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
    onUpdate: PropTypes.func,
    isWorkshopAdmin: PropTypes.bool,
    regionalPartnerGroup: PropTypes.number,
    regionalPartners: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    )
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    if (
      this.props.applicationData.application_type === ApplicationTypes.teacher
    ) {
      this.labelOverrides = TeacherLabelOverrides;
      this.pageLabels = TeacherPageLabelsOverrides;
      this.sectionHeaders = TeacherSectionHeaders;
      this.scoreableQuestions = TeacherScoreableQuestions;
      this.multiAnswerQuestionFields = TeacherMultiAnswerQuestionFields;
      this.validScores = TeacherValidScores;
    } else {
      this.labelOverrides = FacilitatorLabelOverrides;
      this.pageLabels = FacilitatorPageLabelsOverrides;
      this.sectionHeaders = FacilitatorSectionHeaders;
      this.scoreableQuestions = FacilitatorScoreableQuestions;
      this.multiAnswerQuestionFields = {};
      this.validScores = FacilitatorValidScores;
    }

    this.state = this.getOriginalState();
  }

  getOriginalState() {
    return {
      editing: false,
      status: this.props.applicationData.status,
      locked: this.props.applicationData.locked,
      notes: this.props.applicationData.notes,
      notes_2: this.props.applicationData.notes_2,
      notes_3: this.props.applicationData.notes_3,
      notes_4: this.props.applicationData.notes_4,
      notes_5: this.props.applicationData.notes_5,
      question_1: this.props.applicationData.question_1,
      question_2: this.props.applicationData.question_2,
      question_3: this.props.applicationData.question_3,
      question_4: this.props.applicationData.question_4,
      question_5: this.props.applicationData.question_5,
      question_6: this.props.applicationData.question_6,
      question_7: this.props.applicationData.question_7,
      response_scores: this.props.applicationData.response_scores,
      regional_partner_name:
        this.props.applicationData.regional_partner_name ||
        UNMATCHED_PARTNER_LABEL,
      regional_partner_value:
        this.props.applicationData.regional_partner_id ||
        UNMATCHED_PARTNER_VALUE,
      pd_workshop_id: this.props.applicationData.pd_workshop_id,
      fit_workshop_id: this.props.applicationData.fit_workshop_id,
      scholarship_status: this.props.applicationData.scholarship_status,
      bonus_point_questions: this.scoreableQuestions['bonusPoints'],
      cantSaveStatusReason: ''
    };
  }

  componentWillMount() {
    if (
      this.props.applicationData.application_type ===
        ApplicationTypes.facilitator &&
      !this.props.applicationData.notes
    ) {
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
      locked: !this.state.locked
    });
  };

  handleStatusChange = event => {
    const workshopAssigned =
      this.props.applicationData.pd_workshop_id ||
      this.props.applicationData.fit_workshop_id;
    if (
      this.props.applicationData.application_type ===
        ApplicationTypes.teacher &&
      !this.state.scholarship_status &&
      ScholarshipStatusRequiredStatuses.includes(event.target.value)
    ) {
      this.setState({
        cantSaveStatusReason: `Please assign a scholarship status to this applicant before setting this
                              applicant's status to ${
                                getApplicationStatuses(
                                  this.props.viewType,
                                  this.props.applicationData
                                    .update_emails_sent_by_system
                                )[event.target.value]
                              }.`,
        showCantSaveStatusDialog: true
      });
    } else if (
      this.props.applicationData.regional_partner_id &&
      this.props.applicationData.update_emails_sent_by_system &&
      !workshopAssigned &&
      ['accepted_no_cost_registration', 'registration_sent'].includes(
        event.target.value
      )
    ) {
      this.setState({
        cantSaveStatusReason: WORKSHOP_REQUIRED,
        showCantSaveStatusDialog: true
      });
    } else {
      this.setState({
        status: event.target.value
      });
    }
  };

  handleCantSaveStatusOk = event => {
    this.setState({
      cantSaveStatusReason: '',
      showCantSaveStatusDialog: false
    });
  };

  handleInterviewNotesChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleNotesChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSummerWorkshopChange = selection => {
    this.setState({
      pd_workshop_id: selection ? selection.value : null
    });
  };

  handleFitWorkshopChange = selection => {
    this.setState({
      fit_workshop_id: selection ? selection.value : null
    });
  };

  handleScoreChange = event => {
    // The format of the id is key-category. The format of the response scores is a hash
    // with keys like bonus points, scholarship criteria, etc. The category says which
    // section of the response scores to put the key in.
    const keyCategory = event.target.id.split('-');
    const key = keyCategory[0];
    const category = keyCategory[1];

    const responseScores = this.state.response_scores;
    responseScores[category][key] = event.target.value;
    this.setState({
      response_scores: responseScores
    });
  };

  handleRegionalPartnerChange = selected => {
    const regional_partner_value = selected
      ? selected.value
      : UNMATCHED_PARTNER_VALUE;
    const regional_partner_name = selected
      ? selected.label
      : UNMATCHED_PARTNER_LABEL;
    this.setState({regional_partner_name, regional_partner_value});
  };

  handleScholarshipStatusChange = selection => {
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

    if (
      this.props.applicationData.application_type ===
      ApplicationTypes.facilitator
    ) {
      stateValues.push('fit_workshop_id');
      stateValues.push('question_1');
      stateValues.push('question_2');
      stateValues.push('question_3');
      stateValues.push('question_4');
      stateValues.push('question_5');
      stateValues.push('question_6');
      stateValues.push('question_7');
    }

    if (
      this.props.applicationData.application_type === ApplicationTypes.teacher
    ) {
      stateValues.push('scholarship_status');
    }

    const data = {
      ..._.pick(this.state, stateValues),
      response_scores: JSON.stringify(this.state.response_scores)
    };
    $.ajax({
      method: 'PATCH',
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(applicationData => {
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
      method: 'DELETE',
      url: `/api/v1/pd/applications/${this.props.applicationId}`
    })
      .done(() => {
        this.setState({
          deleted: true,
          showDeleteApplicationConfirmation: false
        });
      })
      .fail(() => {
        this.setState({
          deleted: false,
          showDeleteApplicationConfirmation: false
        });
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
      method: 'DELETE',
      url: `/pd/fit_weekend_registration/${
        this.props.applicationData.application_guid
      }`
    })
      .done(() => {
        this.setState({showDeleteFitWeekendRegistrationConfirmation: false});
        if (this.props.onUpdate) {
          this.props.onUpdate({
            ...this.props.applicationData,
            registered_fit_weekend: false
          });
        }
      })
      .fail(() => {
        this.setState({showDeleteFitWeekendRegistrationConfirmation: false});
      });
  };

  renderLockButton = () => {
    const statusIsLockable = ApplicationFinalStatuses.includes(
      this.state.status
    );
    return (
      <Button
        title={
          !statusIsLockable
            ? `Can only lock if status is one of ${ApplicationFinalStatuses.join(
                ', '
              )}`
            : undefined
        }
        disabled={!(this.state.editing && statusIsLockable)}
        onClick={this.handleLockClick}
      >
        {this.state.locked ? 'Unlock' : 'Lock'}
      </Button>
    );
  };

  renderWorkshopAnswer = () => {
    return (
      <DetailViewWorkshopAssignmentResponse
        question="Summer Workshop"
        courseName={this.props.applicationData.course_name}
        subjectType="summer"
        year={parseInt(
          this.props.applicationData.application_year.split('-')[0],
          10
        )}
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

  renderFitWeekendAnswer = () => {
    return (
      <DetailViewWorkshopAssignmentResponse
        question="FIT Workshop"
        courseName={this.props.applicationData.course_name}
        subjectType="fit"
        year={parseInt(
          this.props.applicationData.application_year.split('-')[0],
          10
        )}
        assignedWorkshop={{
          id: this.state.fit_workshop_id,
          name: this.props.applicationData.fit_workshop_name,
          url: this.props.applicationData.fit_workshop_url
        }}
        editing={!!(this.state.editing && this.props.isWorkshopAdmin)}
        onChange={this.handleFitWorkshopChange}
      />
    );
  };

  renderRegionalPartnerAnswer = () => {
    if (this.state.editing && this.props.isWorkshopAdmin) {
      return (
        <RegionalPartnerDropdown
          onChange={this.handleRegionalPartnerChange}
          regionalPartnerFilter={{
            value: this.state.regional_partner_value,
            label: this.state.regional_partner_name
          }}
          regionalPartners={this.props.regionalPartners}
          additionalOptions={[
            {label: UNMATCHED_PARTNER_LABEL, value: UNMATCHED_PARTNER_VALUE}
          ]}
        />
      );
    }
    return this.state.regional_partner_name;
  };

  renderScholarshipStatusAnswer = () => {
    return (
      <ScholarshipDropdown
        scholarshipStatus={this.state.scholarship_status}
        dropdownOptions={
          CourseSpecificScholarshipDropdownOptions[
            this.props.applicationData.course
          ]
        }
        onChange={this.handleScholarshipStatusChange}
        disabled={!this.state.editing}
        isWorkshopAdmin={this.props.isWorkshopAdmin}
      />
    );
  };

  renderEditButtons = () => {
    if (this.state.editing) {
      return [
        <Button
          onClick={this.handleSaveClick}
          bsStyle="primary"
          key="save"
          style={styles.saveButton}
        >
          Save
        </Button>,
        <Button onClick={this.handleCancelEditClick} key="cancel">
          Cancel
        </Button>
      ];
    } else if (this.props.isWorkshopAdmin) {
      return (
        <div style={styles.flexSplitButtonContainer}>
          <SplitButton
            id="admin-edit"
            pullRight
            title="Edit"
            onClick={this.handleEditClick}
          >
            <MenuItem onSelect={this.handleAdminEditClick}>
              (Admin) Edit Form Data
            </MenuItem>
            <MenuItem
              style={styles.delete}
              onSelect={this.handleDeleteApplicationClick}
            >
              Delete Application
            </MenuItem>
            {this.props.applicationData.registered_fit_weekend && (
              <MenuItem
                style={styles.delete}
                onSelect={this.handleDeleteFitWeekendRegistrationClick}
              >
                Delete FiT Weekend Registration
              </MenuItem>
            )}
            {this.props.applicationData.registered_fit_weekend && (
              <ConfirmationDialog
                show={this.state.showDeleteFitWeekendRegistrationConfirmation}
                onOk={this.handleDeleteFitWeekendRegistrationConfirmed}
                onCancel={this.handleDeleteFitWeekendRegistrationCancel}
                headerText="Delete FiT Weekend Registration"
                bodyText="Are you sure you want to delete this FiT Weekend registration? You will not be able to undo this."
                okText="Delete"
              />
            )}
          </SplitButton>
        </div>
      );
    } else {
      return [
        <Button id="edit" key="edit" onClick={this.handleEditClick}>
          Edit
        </Button>,
        <Button
          id="delete"
          key="delete"
          onClick={this.handleDeleteApplicationClick}
        >
          Delete
        </Button>
      ];
    }
  };

  renderStatusSelect = () => {
    const statuses = getApplicationStatuses(
      this.props.viewType,
      this.props.applicationData.update_emails_sent_by_system
    );
    const selectControl = (
      <div>
        <FormControl
          componentClass="select"
          disabled={this.state.locked || !this.state.editing}
          title={
            this.state.locked
              ? 'The status of this application has been locked'
              : undefined
          }
          value={this.state.status}
          onChange={this.handleStatusChange}
          style={styles.statusSelect}
        >
          {Object.keys(statuses).map((status, i) => (
            <option value={status} key={i}>
              {statuses[status]}
            </option>
          ))}
        </FormControl>
        <ConfirmationDialog
          show={this.state.showCantSaveStatusDialog}
          onOk={this.handleCantSaveStatusOk}
          headerText="Cannot save applicant status"
          bodyText={this.state.cantSaveStatusReason}
          okText="OK"
        />
      </div>
    );

    // Render the select with the lock button in a fancy InputGroup
    return (
      <InputGroup style={styles.statusSelectGroup}>
        {this.props.canLock &&
          this.props.applicationData.application_type ===
            ApplicationTypes.facilitator && (
            <InputGroup.Button style={styles.editButton}>
              {this.renderLockButton()}
            </InputGroup.Button>
          )}
        {selectControl}
        <InputGroup.Button style={styles.editButton}>
          {this.renderEditButtons()}
          <ConfirmationDialog
            show={this.state.showDeleteApplicationConfirmation}
            onOk={this.handleDeleteApplicationConfirmed}
            onCancel={this.handleDeleteApplicationCancel}
            headerText="Delete Application"
            bodyText="Are you sure you want to delete this application? You will not be able to undo this."
            okText="Delete"
          />
        </InputGroup.Button>
      </InputGroup>
    );
  };

  showLocked = () =>
    this.props.applicationData.application_type ===
    ApplicationTypes.facilitator;

  renderEditMenu = (textAlign = 'left') => {
    return (
      <div>
        <div>{this.renderStatusSelect()}</div>
        {this.showLocked() && (
          <div style={{...styles.lockedStatus, textAlign}}>
            <FontAwesome icon={this.state.locked ? 'lock' : 'unlock'} />
            &nbsp; Application is&nbsp;
            {this.state.locked ? 'Locked' : 'Unlocked'}
          </div>
        )}
      </div>
    );
  };

  renderHeader = () => {
    const rubricURL =
      this.props.applicationData.application_type === ApplicationTypes.teacher
        ? 'https://drive.google.com/file/d/1UAlJ8zuM8pPza1OPewFrWpnvRo3h8k5W/view'
        : 'https://docs.google.com/document/u/1/d/e/2PACX-1vTqUgsTTGeGMH0N1FTH2qPzQs1pVb8OWPf3lr1A0hzO9LyGLa27J9_Fsg4RG43ok1xbrCfQqKxBjNsk/pub';

    return (
      <div style={styles.headerWrapper}>
        <div>
          <h1>
            {`${this.props.applicationData.form_data.firstName} ${
              this.props.applicationData.form_data.lastName
            }`}
          </h1>
          <h4>Meets Guidelines? {this.props.applicationData.meets_criteria}</h4>
          {this.props.applicationData.application_type ===
            ApplicationTypes.teacher && (
            <h4>
              Meets scholarship requirements?{' '}
              {this.props.applicationData.meets_scholarship_criteria}
            </h4>
          )}

          {this.renderPointsSection()}

          <h4>
            <a target="_blank" rel="noopener noreferrer" href={rubricURL}>
              View Rubric
            </a>
          </h4>
        </div>

        <div id="DetailViewHeader" style={styles.detailViewHeader}>
          {this.renderEditMenu('right')}
        </div>
      </div>
    );
  };

  renderPointsSection = () => {
    if (
      this.props.applicationData.application_type ===
        ApplicationTypes.facilitator &&
      this.props.applicationData.all_scores
    ) {
      return (
        <div>
          <h4>
            Total Score: {this.props.applicationData.all_scores['total_score']}
          </h4>
          <div style={styles.scoreBreakdown}>
            <p>
              Application Score:{' '}
              {this.props.applicationData.all_scores['application_score']}
            </p>
            <p>
              Interview Score:{' '}
              {this.props.applicationData.all_scores['interview_score']}
            </p>
            <br />
            <p>
              Teacher Experience Score:{' '}
              {
                this.props.applicationData.all_scores[
                  'teaching_experience_score'
                ]
              }
            </p>
            <p>
              Leadership Score:{' '}
              {this.props.applicationData.all_scores['leadership_score']}
            </p>
            <p>
              Champion for CS Score:{' '}
              {this.props.applicationData.all_scores['champion_for_cs_score']}
            </p>
            <p>
              Equity Score:{' '}
              {this.props.applicationData.all_scores['equity_score']}
            </p>
            <p>
              Growth Mindset Score:{' '}
              {this.props.applicationData.all_scores['growth_minded_score']}
            </p>
            <p>
              Content Knowledge Score:{' '}
              {this.props.applicationData.all_scores['content_knowledge_score']}
            </p>
            <p>
              Program Commitment Score:{' '}
              {
                this.props.applicationData.all_scores[
                  'program_commitment_score'
                ]
              }
            </p>
          </div>
        </div>
      );
    }
  };

  renderRegistrationLinks = () => {
    const registrationLinks = [];

    const buildRegistrationLink = urlKey => (
      <a href={`/pd/${urlKey}/${this.props.applicationData.application_guid}`}>
        {`${window.location.host}/pd/${urlKey}/${
          this.props.applicationData.application_guid
        }`}
      </a>
    );

    if (
      this.props.isWorkshopAdmin &&
      this.props.applicationData.status === 'accepted' &&
      this.props.applicationData.locked
    ) {
      if (this.props.applicationData.fit_workshop_id) {
        registrationLinks.push(
          <DetailViewResponse
            question="FiT Weekend Registration Link"
            layout="lineItem"
            answer={buildRegistrationLink('fit_weekend_registration')}
          />
        );
      }
    }

    return registrationLinks;
  };

  renderInterview = () => {
    let interviewFields = [];
    [
      {label: 'question1', id: 'question_1', value: this.state.question_1},
      {label: 'question2', id: 'question_2', value: this.state.question_2},
      {label: 'question3', id: 'question_3', value: this.state.question_3},
      {label: 'question4', id: 'question_4', value: this.state.question_4},
      {label: 'question5', id: 'question_5', value: this.state.question_5},
      {label: 'question6', id: 'question_6', value: this.state.question_6},
      {label: 'question7', id: 'question_7', value: this.state.question_7}
    ].forEach((field, i) => {
      interviewFields.push(
        <tr key={i}>
          <td style={styles.questionColumn}>
            {InterviewQuestions[field.label]}
          </td>
          <td>
            <FormControl
              id={field.id}
              disabled={!this.state.editing}
              componentClass="textarea"
              value={field.value || ''}
              onChange={this.handleInterviewNotesChange}
              style={styles.notes}
            />
          </td>
          {this.renderScoringSection(field.id) ? (
            this.renderScoringSection(field.id)
          ) : (
            <td />
          )}
        </tr>
      );
    });

    return (
      <div>
        <h3>Interview Questions</h3>
        <Table style={styles.detailViewTable} striped bordered>
          <tbody>{interviewFields}</tbody>
        </Table>
      </div>
    );
  };

  renderNotes = () => {
    let notesFields = [];
    [
      {label: 'General Notes', id: 'notes', value: this.state.notes},
      {label: 'Notes 2', id: 'notes_2', value: this.state.notes_2},
      {label: 'Notes 3', id: 'notes_3', value: this.state.notes_3},
      {label: 'Notes 4', id: 'notes_4', value: this.state.notes_4},
      {label: 'Notes 5', id: 'notes_5', value: this.state.notes_5}
    ].forEach(field => {
      notesFields.push(
        <div key={field.id}>
          <h4>{field.label}</h4>
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

  renderScoringSection = key => {
    const snakeCaseKey = _.snakeCase(key);

    let scoringDropdowns = [];
    if (
      this.scoreableQuestions[
        `criteriaScoreQuestions${_.startCase(
          this.props.applicationData.course
        )}`
      ].includes(snakeCaseKey)
    ) {
      scoringDropdowns.push(
        <div key="meets_minimum_criteria_scores">
          Meets Guidelines?
          {this.renderScoringDropdown(
            snakeCaseKey,
            'meets_minimum_criteria_scores'
          )}
        </div>
      );
    }

    if (
      this.props.applicationData.application_type === 'Facilitator' &&
      this.state.bonus_point_questions.includes(snakeCaseKey)
    ) {
      if (scoringDropdowns.length) {
        scoringDropdowns.push(<br key="bonus_points_br" />);
      }

      scoringDropdowns.push(
        <div key="bonus_points_scores">
          {FacilitatorScoringFields[key]
            ? FacilitatorScoringFields[key]['title']
            : 'Bonus Points'}
          {this.renderScoringDropdown(snakeCaseKey, 'bonus_points_scores')}
          {FacilitatorScoringFields[key] &&
            FacilitatorScoringFields[key]['rubric']}
        </div>
      );
    }
    if (
      this.props.applicationData.application_type === 'Teacher' &&
      this.scoreableQuestions['scholarshipQuestions'].includes(snakeCaseKey)
    ) {
      if (scoringDropdowns.length) {
        scoringDropdowns.push(<br key="meets_scholarship_criteria_br" />);
      }
      scoringDropdowns.push(
        <div key="meets_scholarship_criteria_scores">
          Meets scholarship requirements?
          {this.renderScoringDropdown(
            snakeCaseKey,
            'meets_scholarship_criteria_scores'
          )}
        </div>
      );
    }

    return <td style={styles.scoringColumn}>{scoringDropdowns}</td>;
  };

  renderScoringDropdown(key, category) {
    const scores =
      this.validScores[_.camelCase(key)][_.camelCase(category)] ||
      this.validScores[_.camelCase(key)];

    return (
      <FormControl
        componentClass="select"
        value={this.state.response_scores[category][key]}
        id={`${key}-${category}-score`}
        onChange={this.handleScoreChange}
        disabled={!this.state.editing}
        style={styles.scoringDropdown}
      >
        <option>--</option>
        {scores.map((score, i) => (
          <option value={score} key={i}>
            {score}
          </option>
        ))}
      </FormControl>
    );
  }

  showPrincipalApprovalTable = () => {
    return (
      this.props.applicationData.principal_approval_state || ''
    ).startsWith('Complete');
  };

  handlePrincipalApprovalChange = (_id, principalApproval) => {
    this.setState({principalApproval});
  };

  renderDetailViewTableLayout = () => {
    const sectionsToRemove =
      this.props.applicationData.application_type === ApplicationTypes.teacher
        ? ['additionalDemographicInformation']
        : ['submission'];

    return (
      <div>
        {_.pull(Object.keys(this.sectionHeaders), ...sectionsToRemove).map(
          (header, i) => (
            <div key={i}>
              <h3>{this.sectionHeaders[header]}</h3>
              <Table style={styles.detailViewTable} striped bordered>
                <tbody>
                  {Object.keys(this.pageLabels[header]).map((key, j) => {
                    return (
                      // For most fields, render them only when they have values.
                      // For explicitly listed fields, render them regardless of their values.
                      (this.props.applicationData.form_data[key] ||
                        key === 'csTotalCourseHours' ||
                        key === 'alternateEmail' ||
                        header ===
                          'schoolStatsAndPrincipalApprovalSection') && (
                        <tr key={j}>
                          <td style={styles.questionColumn}>
                            <InlineMarkdown
                              markdown={
                                this.labelOverrides[key] ||
                                this.pageLabels[header][key]
                              }
                            />
                          </td>
                          <td style={styles.answerColumn}>
                            {this.renderAnswer(
                              key,
                              this.props.applicationData.form_data[key]
                            )}
                          </td>
                          {this.renderScoringSection(key)}
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )
        )}
      </div>
    );
  };

  renderAnswer = (key, answer) => {
    if (this.multiAnswerQuestionFields[key]) {
      return (
        <div>
          {this.multiAnswerQuestionFields[key]['teacher'] && (
            <p>
              Teacher Response:{' '}
              {this.formatAnswer(
                key,
                this.props.applicationData.form_data[
                  _.camelCase(this.multiAnswerQuestionFields[key]['teacher'])
                ]
              )}
            </p>
          )}
          {this.multiAnswerQuestionFields[key]['principal'] && (
            <p>
              Principal Response:{' '}
              {this.formatAnswer(
                key,
                this.props.applicationData.form_data[
                  _.camelCase(this.multiAnswerQuestionFields[key]['principal'])
                ]
              )}
            </p>
          )}
          {this.multiAnswerQuestionFields[key]['stats'] && (
            <p>
              Data from NCES:{' '}
              {this.props.applicationData.school_stats[
                this.multiAnswerQuestionFields[key]['stats']
              ] || NA}
            </p>
          )}
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
    } else if (
      this.props.applicationData.principal_approval_state === 'Not required'
    ) {
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
    } else {
      // Approval sent but is not complete
      const principalApprovalUrl = `${
        window.location.origin
      }/pd/application/principal_approval/${
        this.props.applicationData.application_guid
      }`;

      return (
        <div>
          <h3>Principal Approval</h3>
          <h4>{this.props.applicationData.principal_approval_state}</h4>
          <p>
            Link to principal approval form:{' '}
            <a
              href={principalApprovalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {principalApprovalUrl}
            </a>
          </p>
          <PrincipalApprovalButtons
            applicationId={this.props.applicationId}
            showResendEmailButton={
              this.props.applicationData.allow_sending_principal_email
            }
            onChange={this.handlePrincipalApprovalChange}
          />
        </div>
      );
    }
  };

  renderTopTableLayout = () => {
    return (
      <Table style={styles.detailViewTable} striped bordered>
        <tbody>
          <tr>
            <td style={styles.questionColumn}>Email</td>
            <td style={styles.answerColumn}>
              {this.props.applicationData.email}
            </td>
            <td style={styles.scoringColumn} />
          </tr>
          {this.props.applicationData.application_type ===
            ApplicationTypes.teacher && (
            <tr>
              <td style={styles.questionColumn}>School Name</td>
              <td style={styles.answerColumn}>
                {this.renderSchoolTrait(
                  this.props.applicationData.school_name,
                  this.props.applicationData.form_data['principal_school']
                )}
              </td>
              <td style={styles.scoringColumn} />
            </tr>
          )}
          {this.props.applicationData.application_type ===
            ApplicationTypes.teacher && (
            <tr>
              <td style={styles.questionColumn}>School District</td>
              <td style={styles.answerColumn}>
                {this.renderSchoolTrait(
                  this.props.applicationData.district_name,
                  this.props.applicationData.form_data[
                    'principal_school_district'
                  ]
                )}
              </td>
              <td style={styles.scoringColumn} />
            </tr>
          )}
          {!(this.props.applicationData.course === 'csf') && (
            <tr>
              <td style={styles.questionColumn}>Summer Workshop</td>
              <td style={styles.answerColumn}>{this.renderWorkshopAnswer()}</td>
              <td style={styles.scoringColumn} />
            </tr>
          )}
          {this.props.applicationData.application_type ===
            ApplicationTypes.facilitator && (
            <tr>
              <td style={styles.questionColumn}>FiT Workshop</td>
              <td style={styles.answerColumn}>
                {this.renderFitWeekendAnswer()}
              </td>
              <td style={styles.scoringColumn} />
            </tr>
          )}
          <tr>
            <td style={styles.questionColumn}>Regional Partner</td>
            <td style={styles.answerColumn}>
              {this.renderRegionalPartnerAnswer()}
            </td>
            <td style={styles.scoringColumn} />
          </tr>
          {this.props.applicationData.application_type ===
            ApplicationTypes.teacher && (
            <tr>
              <td style={styles.questionColumn}>Scholarship Teacher?</td>
              <td style={styles.answerColumn}>
                {this.renderScholarshipStatusAnswer()}
              </td>
              <td style={styles.scoringColumn} />
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  renderSchoolTrait = (teacher_response, principal_response) => {
    if (principal_response && principal_response !== teacher_response) {
      return (
        <div>
          <p>Teacher Response: {teacher_response}</p>
          <p>Principal Presponse: {principal_response}</p>
        </div>
      );
    } else {
      return teacher_response;
    }
  };

  render() {
    if (this.state.hasOwnProperty('deleted')) {
      const message = this.state.deleted
        ? 'This application has been deleted.'
        : 'This application could not be deleted.';
      return <h4>{message}</h4>;
    }
    return (
      <div id="detail-view">
        {this.renderHeader()}
        <br />
        {this.renderTopTableLayout()}
        {this.renderDetailViewTableLayout()}
        {this.props.applicationData.application_type ===
          ApplicationTypes.teacher &&
          !this.showPrincipalApprovalTable() &&
          this.renderResendOrUnrequirePrincipalApprovalSection()}
        {this.props.applicationData.application_type ===
          ApplicationTypes.facilitator && this.renderInterview()}
        {this.renderNotes()}
        {this.renderEditMenu()}
        {this.props.applicationData.status_change_log && (
          <ChangeLog changeLog={this.props.applicationData.status_change_log} />
        )}
      </div>
    );
  }
}

export default connect(state => ({
  regionalPartnerGroup: state.regionalPartners.regionalPartnerGroup,
  regionalPartners: state.regionalPartners.regionalPartners,
  canLock: state.applicationDashboard.permissions.lockApplication,
  isWorkshopAdmin: state.applicationDashboard.permissions.workshopAdmin
}))(DetailViewContents);
