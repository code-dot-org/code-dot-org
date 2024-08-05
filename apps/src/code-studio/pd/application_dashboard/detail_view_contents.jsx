import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
/* eslint-disable no-restricted-imports */
import {
  Row,
  Col,
  Button,
  SplitButton,
  MenuItem,
  FormControl,
  InputGroup,
  Table,
} from 'react-bootstrap';
/* eslint-enable no-restricted-imports */
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import {CourseSpecificScholarshipDropdownOptions} from '@cdo/apps/generated/pd/scholarshipInfoConstants';
import {CourseKeyMap} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {
  LabelOverrides as TeacherLabelOverrides,
  PageLabels as TeacherPageLabelsOverrides,
  SectionHeaders as TeacherSectionHeaders,
  ScoreableQuestions as TeacherScoreableQuestions,
  MultiAnswerQuestionFields as TeacherMultiAnswerQuestionFields,
  ValidScores as TeacherValidScores,
  PrincipalApprovalState,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';

import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA,
  getProgramInfo,
} from '../application/teacher/TeacherApplicationConstants';
import ConfirmationDialog from '../components/confirmation_dialog';
import {
  RegionalPartnerDropdown,
  UNMATCHED_PARTNER_VALUE,
  UNMATCHED_PARTNER_LABEL,
} from '../components/regional_partner_dropdown';
import ScholarshipDropdown from '../components/scholarshipDropdown';

import {
  getApplicationStatuses,
  ApplicationFinalStatuses,
  ScholarshipStatusRequiredStatuses,
} from './constants';
import ChangeLog from './detail_view/change_log';
import DetailViewWorkshopAssignmentResponse from './detail_view_workshop_assignment_response';
import PrincipalApprovalButtons from './principal_approval_buttons';

const NA = 'N/A';

const WORKSHOP_REQUIRED = `Please assign a summer workshop to this applicant before setting this
                          applicant's status to "Accepted". This status will trigger an automated
                          email with a registration link to their assigned workshop.`;

const PROGRAM_MAP = {
  csd: PROGRAM_CSD,
  csp: PROGRAM_CSP,
  csa: PROGRAM_CSA,
};

export class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      course: PropTypes.oneOf(Object.values(CourseKeyMap)),
      course_name: PropTypes.string,
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
      response_scores: PropTypes.object,
      meets_criteria: PropTypes.string,
      meets_scholarship_criteria: PropTypes.string,
      bonus_points: PropTypes.number,
      all_scores: PropTypes.object,
      total_scores: PropTypes.number,
      pd_workshop_id: PropTypes.number,
      pd_workshop_name: PropTypes.string,
      pd_workshop_url: PropTypes.string,
      application_guid: PropTypes.string,
      school_stats: PropTypes.object,
      status_change_log: PropTypes.arrayOf(PropTypes.object),
      scholarship_status: PropTypes.string,
      principal_approval_state: PropTypes.string,
      principal_approval_not_required: PropTypes.bool,
      allow_sending_principal_email: PropTypes.bool,
    }).isRequired,
    onUpdate: PropTypes.func,
    isWorkshopAdmin: PropTypes.bool,
    regionalPartnerGroup: PropTypes.number,
    regionalPartners: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.labelOverrides = TeacherLabelOverrides;
    this.pageLabels = TeacherPageLabelsOverrides;
    this.sectionHeaders = TeacherSectionHeaders;
    this.scoreableQuestions = TeacherScoreableQuestions;
    this.multiAnswerQuestionFields = TeacherMultiAnswerQuestionFields;
    this.validScores = TeacherValidScores;

    this.state = this.getOriginalState();
  }

  getOriginalState() {
    return {
      editing: false,
      status: this.props.applicationData.status,
      last_logged_status: this.props.applicationData.status,
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
      scholarship_status: this.props.applicationData.scholarship_status,
      bonus_point_questions: this.scoreableQuestions['bonusPoints'],
      cantSaveStatusReason: '',
      principalApprovalIsRequired:
        !this.props.applicationData.principal_approval_not_required,
    };
  }

  handleCancelEditClick = () => {
    this.setState(this.getOriginalState());
  };

  handleEditClick = () => {
    this.setState({
      editing: true,
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

  handleStatusChange = event => {
    const workshopAssigned = this.props.applicationData.pd_workshop_id;
    if (
      !this.state.scholarship_status &&
      ScholarshipStatusRequiredStatuses.includes(event.target.value)
    ) {
      this.setState({
        cantSaveStatusReason: `Please assign a scholarship status to this applicant before setting this
                              applicant's status to ${
                                getApplicationStatuses(
                                  this.props.applicationData
                                    .update_emails_sent_by_system
                                )[event.target.value]
                              }.`,
        showCantSaveStatusDialog: true,
      });
    } else if (
      this.props.applicationData.regional_partner_id &&
      this.props.applicationData.update_emails_sent_by_system &&
      !workshopAssigned &&
      'accepted' === event.target.value
    ) {
      this.setState({
        cantSaveStatusReason: WORKSHOP_REQUIRED,
        showCantSaveStatusDialog: true,
      });
    } else {
      this.setState({
        status: event.target.value,
      });
    }
  };

  handleCantSaveStatusOk = event => {
    this.setState({
      cantSaveStatusReason: '',
      showCantSaveStatusDialog: false,
    });
  };

  handleInterviewNotesChange = event => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  handleNotesChange = event => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  handleSummerWorkshopChange = selection => {
    this.setState({
      pd_workshop_id: selection ? selection.value : null,
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
      response_scores: responseScores,
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
      scholarship_status: selection ? selection.value : null,
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
      'pd_workshop_id',
    ];

    stateValues.push('scholarship_status');

    const data = {
      ..._.pick(this.state, stateValues),
      response_scores: JSON.stringify(this.state.response_scores),
    };
    $.ajax({
      method: 'PATCH',
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
    }).done(applicationData => {
      this.setState({
        editing: false,
      });

      // Notify the parent of the updated data.
      // The parent is responsible for passing it back in as props.
      if (this.props.onUpdate) {
        this.props.onUpdate(applicationData);
      }

      // Log if the application status changed
      if (this.state.status !== this.state.last_logged_status) {
        analyticsReporter.sendEvent(EVENTS.APP_STATUS_CHANGE_EVENT, {
          'application id': this.props.applicationId,
          'application status': this.state.status,
        });
        this.setState({
          last_logged_status: this.state.status,
        });
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
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
    })
      .done(() => {
        this.setState({
          deleted: true,
          showDeleteApplicationConfirmation: false,
        });
      })
      .fail(() => {
        this.setState({
          deleted: false,
          showDeleteApplicationConfirmation: false,
        });
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
        courseName={
          this.props.applicationData.course_name ||
          'Course TBD (Incomplete Application)'
        }
        subjectType="summer"
        year={parseInt(
          this.props.applicationData.application_year.split('-')[0],
          10
        )}
        assignedWorkshop={{
          id: this.state.pd_workshop_id,
          name: this.props.applicationData.pd_workshop_name,
          url: this.props.applicationData.pd_workshop_url,
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
          regionalPartnerFilter={{
            value: this.state.regional_partner_value,
            label: this.state.regional_partner_name,
          }}
          regionalPartners={this.props.regionalPartners}
          additionalOptions={[
            {label: UNMATCHED_PARTNER_LABEL, value: UNMATCHED_PARTNER_VALUE},
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
        </Button>,
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
        </Button>,
      ];
    }
  };

  renderStatusSelect = () => {
    let statusesToHide = ['enrolled'];
    // Hide "Awaiting Admin Approval" status if it is not currently "awaiting_admin_approval"
    if (this.state.status !== 'awaiting_admin_approval') {
      statusesToHide.push('awaiting_admin_approval');
    }
    // Hide "Incomplete" if it is not currently "Incomplete"
    if (this.state.status !== 'incomplete') {
      statusesToHide.push('incomplete');
    }

    const statuses = _.omit(
      getApplicationStatuses(
        this.props.applicationData.update_emails_sent_by_system
      ),
      statusesToHide
    );
    const selectControl = (
      <div>
        <FormControl
          componentClass="select"
          disabled={
            this.state.locked ||
            !this.state.editing ||
            this.state.status === 'awaiting_admin_approval'
          }
          title={
            this.state.locked
              ? 'The status of this application has been locked'
              : this.state.status === 'awaiting_admin_approval'
              ? 'No status updates can be made while awaiting admin approval'
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

  showLocked = () => false;

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
      'https://docs.google.com/document/d/19oolyeensn9oX8JAnIeT2M6HbNZQkZqlPhwcaIDx-Us/view';

    return (
      <div style={styles.headerWrapper}>
        <div>
          <h1>
            {`${this.props.applicationData.form_data.firstName} ${this.props.applicationData.form_data.lastName}`}
          </h1>
          <h4>Meets Guidelines? {this.props.applicationData.meets_criteria}</h4>
          <h4>
            Meets scholarship requirements?{' '}
            {this.props.applicationData.meets_scholarship_criteria}
          </h4>

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

  renderNotes = () => {
    let notesFields = [];
    [
      {label: 'General Notes', id: 'notes', value: this.state.notes},
      {label: 'Notes 2', id: 'notes_2', value: this.state.notes_2},
      {label: 'Notes 3', id: 'notes_3', value: this.state.notes_3},
      {label: 'Notes 4', id: 'notes_4', value: this.state.notes_4},
      {label: 'Notes 5', id: 'notes_5', value: this.state.notes_5},
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
      this.props.applicationData.course &&
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

  handlePrincipalApprovalChange = (_id, principalApproval) => {
    this.setState({principalApproval});
    this.setState({
      principalApprovalIsRequired: !this.state.principalApprovalIsRequired,
    });
    analyticsReporter.sendEvent(EVENTS.APP_STATUS_CHANGE_EVENT, {
      'application id': this.props.applicationId,
      'application status': this.state.principalApprovalIsRequired
        ? 'awaiting_admin_approval'
        : 'unreviewed',
    });
  };

  renderDetailViewTableLayout = () => {
    const questionsToRemove = ['genderIdentity', 'race'];

    return (
      <div>
        {Object.keys(this.sectionHeaders).map((header, i) => (
          <div key={i}>
            <h3>{this.sectionHeaders[header]}</h3>
            {header === 'administratorInformation' &&
              this.renderModifyPrincipalApprovalSection()}
            <Table style={styles.detailViewTable} striped bordered>
              <tbody>
                {_.pull(
                  Object.keys(this.pageLabels[header]),
                  ...questionsToRemove
                ).map((key, j) => {
                  // If the enoughCourseHours question, insert variable values.
                  // Otherwise, just show the question's label.
                  const questionLabel =
                    key === 'enoughCourseHours'
                      ? this.labelOverrides[key]
                          .replace(
                            '{{CS program}}',
                            getProgramInfo(
                              PROGRAM_MAP[this.props.applicationData.course]
                            ).name
                          )
                          .replace(
                            '{{min hours}}',
                            getProgramInfo(
                              PROGRAM_MAP[this.props.applicationData.course]
                            ).minCourseHours
                          )
                      : this.labelOverrides[key] ||
                        this.pageLabels[header][key];
                  return (
                    // For most fields, render them only when they have values.
                    // For explicitly listed fields, render them regardless of their values.
                    (this.props.applicationData.form_data[key] ||
                      key === 'alternateEmail' ||
                      header === 'schoolStatsAndPrincipalApprovalSection') && (
                      <tr key={j}>
                        <td style={styles.questionColumn}>
                          <InlineMarkdown markdown={questionLabel} />
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
        ))}
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
              Administrator Response:{' '}
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
          {this.multiAnswerQuestionFields[key]['census'] && (
            <p>
              Data from Census:{' '}
              {this.props.applicationData.school_stats[
                this.multiAnswerQuestionFields[key]['census']
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

  renderModifyPrincipalApprovalSection = () => {
    // principal_approval_state can be 'Not required', 'Incomplete - Admin email sent on ...', or 'Complete - ...'
    // If 'Incomplete' or 'Complete', we show a link to the application and a button to re-send the request,
    // and a button to change the principal approval requirement.
    // If 'Not required', we show a button to make the principal approval required.

    const principalApprovalStartsWith = state =>
      this.props.applicationData.principal_approval_state?.startsWith(state);

    if (
      principalApprovalStartsWith(PrincipalApprovalState.inProgress) ||
      principalApprovalStartsWith(PrincipalApprovalState.complete)
    ) {
      const principalApprovalUrl = `${window.location.origin}/pd/application/principal_approval/${this.props.applicationData.application_guid}`;

      return (
        <div>
          <h4>{this.props.applicationData.principal_approval_state}</h4>
          {principalApprovalStartsWith(PrincipalApprovalState.inProgress) && (
            <>
              <p id="principal-approval-link">
                Link to administrator approval form:{' '}
                <a
                  id="principal-approval-url"
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
                showChangeRequirementButton={true}
                applicationStatus={this.props.applicationData.status}
                approvalRequired={this.state.principalApprovalIsRequired}
              />
            </>
          )}
        </div>
      );
    } else {
      return (
        <div>
          {!this.state.principalApprovalIsRequired && (
            <p>
              If you would like to require administrator approval for this
              teacher, please click “Make required." If this application is
              Unreviewed, Pending, or Pending Space Availability, then clicking
              this button will also send an email to the administrator asking
              for approval, given one hasn't been sent in the past 5 days.
            </p>
          )}
          <PrincipalApprovalButtons
            applicationId={this.props.applicationId}
            showChangeRequirementButton={true}
            onChange={this.handlePrincipalApprovalChange}
            applicationStatus={this.props.applicationData.status}
            approvalRequired={this.state.principalApprovalIsRequired}
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
          {!(this.props.applicationData.course === 'csf') && (
            <tr>
              <td style={styles.questionColumn}>Summer Workshop</td>
              <td style={styles.answerColumn}>{this.renderWorkshopAnswer()}</td>
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
          <tr>
            <td style={styles.questionColumn}>Scholarship Teacher?</td>
            <td style={styles.answerColumn}>
              {this.renderScholarshipStatusAnswer()}
            </td>
            <td style={styles.scoringColumn} />
          </tr>
        </tbody>
      </Table>
    );
  };

  renderSchoolTrait = (teacher_response, principal_response) => {
    if (principal_response && principal_response !== teacher_response) {
      return (
        <div>
          <p>Teacher Response: {teacher_response}</p>
          <p>Administrator Presponse: {principal_response}</p>
        </div>
      );
    } else {
      return teacher_response;
    }
  };

  render() {
    if (Object.prototype.hasOwnProperty.call(this.state, 'deleted')) {
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
        {this.renderNotes()}
        {this.renderEditMenu()}
        {this.props.applicationData.status_change_log && (
          <ChangeLog changeLog={this.props.applicationData.status_change_log} />
        )}
      </div>
    );
  }
}

const styles = {
  notes: {
    height: '95px',
  },
  statusSelect: {
    width: 250, // wide enough for the widest status
  },
  editMenuContainer: {
    display: 'inline-block', // fit contents
  },
  editMenu: {
    display: 'flex',
  },
  // React-Bootstrap components don't play well inside a flex box,
  // so this is required to get the contained split button to stay together.
  flexSplitButtonContainer: {
    flex: '0 0 auto',
  },
  detailViewHeader: {
    marginLeft: 'auto',
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'baseline',
  },
  saveButton: {
    marginRight: '5px',
  },
  statusSelectGroup: {
    marginRight: 5,
    marginLeft: 5,
  },
  editButton: {
    width: 'auto',
  },
  lockedStatus: {
    ...fontConstants['main-font-bold'],
    marginTop: 10,
  },
  caption: {
    color: 'black',
  },
  detailViewTable: {
    width: '80%',
  },
  questionColumn: {
    width: '50%',
  },
  answerColumn: {
    width: '30%',
  },
  scoringColumn: {
    width: '20%',
  },
  scoringDropdown: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  scoreBreakdown: {
    marginLeft: '30px',
  },
};

export default connect(state => ({
  regionalPartnerGroup: state.regionalPartners.regionalPartnerGroup,
  regionalPartners: state.regionalPartners.regionalPartners,
  canLock: state.applicationDashboard.permissions.lockApplication,
  isWorkshopAdmin: state.applicationDashboard.permissions.workshopAdmin,
}))(DetailViewContents);
