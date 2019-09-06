import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import Button from '../Button';
import color from '../../util/color';

export default class CensusInaccuracyReviewDetails extends Component {
  static propTypes = {
    authenticityToken: PropTypes.string,
    toReview: PropTypes.object,
    onReturnToMainList: PropTypes.func,
    onSuccessfulSubmission: PropTypes.func
  };

  state = {
    notes: '',
    error: false
  };

  returnToMainList = () => {
    this.setState({
      notes: '',
      error: false
    });
    this.props.onReturnToMainList();
  };

  submitInvestigation = override => {
    const reportId = this.props.toReview.id;
    $.ajax({
      url: '/census/review',
      type: 'post',
      dataType: 'json',
      data: {
        authenticity_token: this.props.authenticityToken,
        census_submission_id: reportId,
        override: override,
        notes: this.state.notes
      }
    })
      .done(() => this.handleSuccessfulInvestigationSubmittion(reportId))
      .fail(this.handleInvestigationSubmittionError);
  };

  submitInvestigationWithOverride = () => {
    this.submitInvestigation(this.props.toReview.teaches_cs ? 'Y' : 'N');
  };

  submitInvestigationWithoutOverride = () => {
    this.submitInvestigation(null);
  };

  handleSuccessfulInvestigationSubmittion = reportId => {
    this.setState({
      notes: '',
      error: false
    });
    this.props.onSuccessfulSubmission(reportId);
  };

  handleInvestigationSubmittionError = error => {
    console.error(error.responseText);
    this.setState({error: true});
  };

  stringForExplanationLabel = {
    overrides: 'Override',
    offers_ap: 'Offers AP CS?',
    offers_ib: 'Offers IB CS?',
    consistent_teacher_surveys: 'Consistent Teacher/Admin Surveys',
    state_offering: 'Teaches per State Data?',
    inconsistent_teacher_surveys: 'Inconsistent Teacher/Admin Surveys',
    consistent_non_teacher_surveys: 'Consistent Non-Teacher/Admin Surveys',
    inconsistent_surveys: 'Inconsistent Surveys',
    non_teacher_surveys: 'Non-Teacher/Admin Surveys',
    last_years_summary: "Last Year's Summary",
    two_years_agos_summary: "Two Years Ago's Summary"
  };

  render = () => {
    const noData = 'No Data';
    const school = this.props.toReview.school;
    const auditData = this.props.toReview.summary_audit;
    const explanation = auditData.explanation;
    const highlightedStyle = {
      backgroundColor: color.highlight_green
    };

    const inaccuracyReportColumns = [
      {
        property: 'label'
      },
      {
        property: 'value'
      }
    ];

    const inaccuracyReportRows = [
      {
        label: 'Submitter name',
        value: this.props.toReview.submitter_name || 'No Name Submitted'
      },
      {
        label: 'Submitter email address',
        value: this.props.toReview.submitter_email_address
      },
      {label: 'Submitter Role', value: this.props.toReview.submitter_role},
      {label: 'Comment', value: this.props.toReview.inaccuracy_comment},
      {
        label: "This Survey's Teaches CS Result",
        value: this.props.toReview.teaches_cs ? 'YES' : 'NO'
      },
      {
        label: 'K8 School?',
        value: this.props.toReview.k8_school ? 'Yes' : 'No'
      },
      {
        label: 'High School?',
        value: this.props.toReview.high_school ? 'Yes' : 'No'
      },
      {
        label: 'How many 10 hours?',
        value: this.props.toReview.how_many_10_hours
      },
      {
        label: 'How many 20 hours?',
        value: this.props.toReview.how_many_20_hours
      },
      {
        label: 'Block programming',
        value: this.props.toReview.topic_blocks ? 'Yes' : 'No'
      },
      {
        label: 'Text programming',
        value: this.props.toReview.topic_text ? 'Yes' : 'No'
      }
    ];

    const overrideText = `Create a ${
      this.props.toReview.teaches_cs ? 'YES' : 'NO'
    } override for this school.`;
    return (
      <div style={{maxWidth: 615}}>
        <h2>
          {school.name} ({school.city}, {school.state})
        </h2>
        <Button
          onClick={this.returnToMainList}
          size="large"
          text="Back to main list"
        />
        <br />
        <hr />
        <div>
          <h3>
            We currently classify this school as{' '}
            <b>{auditData.previous_years_results[0] || 'NULL'}</b> based on:
          </h3>
          <table className="table table-bordered table-striped">
            <tbody>
              {explanation.map((data, index) => {
                let value;
                if (data.value === null) {
                  value = noData;
                } else if (data.value instanceof Object) {
                  if (data.value.yes === 0 && data.value.no === 0) {
                    value = noData;
                  } else {
                    value = `${data.value.yes} Yes / ${data.value.no} No`;
                  }
                } else if (typeof data.value === 'boolean') {
                  value = data.value ? 'Yes' : 'No';
                } else {
                  value = data.value;
                }

                return (
                  <tr key={index}>
                    <td style={data.used ? highlightedStyle : null}>
                      {this.stringForExplanationLabel[data.label]}
                    </td>
                    <td style={data.used ? highlightedStyle : null}>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          The highlighted row was used to determine if this school teaches CS.
        </div>
        <br />
        <hr />
        <div>
          <h3>Inaccuracy Report Data:</h3>
          <Table.Provider
            className="table table-bordered table-striped"
            columns={inaccuracyReportColumns}
          >
            <Table.Body rows={inaccuracyReportRows} rowKey="label" />
          </Table.Provider>
        </div>
        <br />
        <div>
          <p style={{width: '75%'}}>
            Explain why we should or should not override the data on this school
            to say that they{' '}
            <b>{this.props.toReview.teaches_cs ? 'DO' : 'DO NOT'}</b> offer
            Computer Science:
          </p>
          <br />
          <textarea
            type="text"
            style={{height: 100, width: '100%'}}
            onChange={event => {
              this.setState({notes: event.target.value});
            }}
          />
          <br />
          {this.state.error && (
            <p>There was an error submitting the form. Please try again.</p>
          )}
          {this.state.notes && (
            <div>
              <Button
                onClick={this.submitInvestigationWithOverride}
                size="large"
                text={overrideText}
              />
              <br />
              <Button
                onClick={this.submitInvestigationWithoutOverride}
                size="large"
                text="Resolve without override"
                style={{marginTop: 5}}
              />
            </div>
          )}
        </div>
      </div>
    );
  };
}
