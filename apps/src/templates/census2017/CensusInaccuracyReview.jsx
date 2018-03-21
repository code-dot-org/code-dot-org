import React, { PropTypes, Component } from 'react';
import {Table} from 'reactabular';
import Button from '../Button';

export default class CensusInaccuracyReview extends Component {
  static propTypes = {
    authenticityToken: PropTypes.string,
    reportsToReview: PropTypes.array,
  };

  state = {
    toReview: undefined,
    notes: '',
    resolvedReports: [],
  };

  formatTeachesCs = (teachesCs) => {
    return (
      <div style={{textAlign: 'center', verticalAlign: 'middle'}}>
        {teachesCs}
      </div>
    );
  };

  formatComment = (comment) => {
    return (
      <div>
        {comment}
      </div>
    );
  };

  formatSchool = (school) => {
    return (
      <div>
        {school.name}
        <br />
        ({school.city}, {school.state})
      </div>
    );
  };

  beginReviewButton = (_value, data) => {
    if (this.state.resolvedReports.includes(data.rowData.id)) {
      return (
        <div style={{textAlign: 'center', verticalAlign: 'middle'}}>
          Review Completed
        </div>
      );
    } else {
      return (
        <Button
          onClick={() => {this.setState({toReview: data.rowData}); $('#report-header')[0].scrollIntoView();}}
          size="large"
          text="Review this School"
        />
      );
    }
  };

  showMainList = () => {
    this.setState({
      toReview: undefined,
      notes: ''
    });
    $('#report-header')[0].scrollIntoView();
  };

  render() {
    let display;
    if (this.state.toReview) {
      display = this.renderReview();
    } else {
      display = this.renderTable();
    }

    return (
      <div>
        <h1 id="report-header">
          Reported Access Report Inaccuracies
        </h1>
        {display}
      </div>
    );
  }

  stringForExplanationLabel = {
    offers_ap: "Offers AP CS?",
    offers_ib: "Offers IB CS?",
    consistent_teacher_surveys: "Consistent Teacher/Admin Surveys",
    state_offering: "Teaches per State Data?",
    consistent_non_teacher_surveys: "Consistent Non-Teacher/Admin Surveys",
    inconsistent_surveys: "Inconsistent Surveys",
    last_years_summary: "Last Year's Summary",
    two_years_agos_summary: "Two Years Ago's Summary",
  };

  renderReview = () => {
    const noData = 'No Data';
    const school = this.state.toReview.school;
    const auditData = this.state.toReview.summary_audit;
    const explanation = auditData.explanation;
    const highlightedStyle = {
      backgroundColor: "#8afc9b",
    };

    const inaccuracyReportColumns = [
      {
        property: 'label',
      },
      {
        property: 'value',
      },
    ];

    const inaccuracyReportRows = [
      {label: "Submitter name", value: this.state.toReview.submitter_name || 'No Name Submitted'},
      {label: "Submitter email address", value: this.state.toReview.submitter_email_address},
      {label: "Submitter Role", value: this.state.toReview.submitter_role},
      {label: "Comment", value: this.state.toReview.inaccuracy_comment},
      {label: "This Survey's Teaches CS Result", value: this.state.toReview.teaches_cs ? 'YES' : 'NO'},
      {label: "K8 School?", value: this.state.toReview.k8_school ? 'Yes' : 'No'},
      {label: "High School?", value: this.state.toReview.high_school ? 'Yes' : 'No'},
      {label: "How many 10 hours?", value: this.state.toReview.how_many_10_hours},
      {label: "How many 20 hours?", value: this.state.toReview.how_many_20_hours},
      {label: "Block programming", value: this.state.toReview.topic_blocks ? 'Yes' : 'No'},
      {label: "Text programming", value: this.state.toReview.topic_text ? 'Yes' : 'No'},
    ];

    const overrideText = `Create a ${this.state.toReview.teaches_cs ? 'YES' : 'NO'} override for this school.`;
    return (
      <div style={{maxWidth: 615}}>
        <h2>
          {school.name} ({school.city}, {school.state})
        </h2>
        <Button
          onClick={this.showMainList}
          size="large"
          text="Back to main list"
        />
        <br />
        <hr />
        <div>
          <h3>We currently classify this school as <b>{auditData.previous_years_results[0] || 'NULL'}</b> based on:</h3>
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
                 } else if (typeof(data.value) === "boolean") {
                   value = data.value ? 'Yes' : 'No';
                 } else {
                   value = data.value;
                 }

                 return (
                   <tr key={index}>
                     <td style={data.used ? highlightedStyle : null}>
                       {this.stringForExplanationLabel[data.label]}
                     </td>
                     <td style={data.used ? highlightedStyle : null}>
                       {value}
                     </td>
                   </tr>
                 );
              }
              )}
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
            <Table.Body
              rows={inaccuracyReportRows}
              rowKey="label"
            />
          </Table.Provider>
        </div>
        <br />
        <div>
          <p style={{width: '75%'}}>
            Explain why we should or should not override the data on this school to say
            that they <b>{this.state.toReview.teaches_cs ? 'DO' : 'DO NOT'}</b> offer Computer Science:
          </p>
          <br />
          <textarea type="text" style={{height: 100, width: '100%'}} onChange={(event) => {this.setState({notes: event.target.value});}} />
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

  submitInvestigation = (override) => {
    const reportId = this.state.toReview.id;
    $.ajax({
      url: "/census/review",
      type: "post",
      dataType: "json",
      data: {
        authenticity_token: this.props.authenticityToken,
        census_submission_id: reportId,
        override: override,
        notes: this.state.notes,
      },
    }).done(() => (this.handleSuccessfulInvestigationSubmittion(reportId))).fail(this.handleInvestigationSubmittionError);
  };

  submitInvestigationWithOverride = () => {
    this.submitInvestigation(this.state.toReview.teaches_cs ? 'Y' : 'N');
  };

  submitInvestigationWithoutOverride = () => {
    this.submitInvestigation(null);
  };

  handleSuccessfulInvestigationSubmittion = (reportId) => {
    this.setState((prevState) => ({
      resolvedReports: prevState.resolvedReports.concat([reportId]),
      toReview: undefined,
      notes: '',
      error: false,
    }));
    $('#report-header')[0].scrollIntoView();
  };

  handleInvestigationSubmittionError = (error) => {
    console.error(error.responseText);
    this.setState({error: true});
  };

  columns = [
    {
      property: 'school',
      header: {
        label: "School"
      },
      cell: {
        format: this.formatSchool,
      }
    },
    {
      property: 'current_summary',
      header: {
        label: "Current Summary"
      },
      cell: {
        format: this.formatTeachesCs,
      }
    },
    {
      property: 'inaccuracy_comment',
      header: {
        label: "Submitter's comment"
      },
      cell: {
        format: this.formatComment,
      }
    },
    {
      property: 'button',
      header: {
        label: "Action"
      },
      cell: {
        format: this.beginReviewButton,
      }
    }
  ];

  renderTable = () => {
    if (this.props.reportsToReview.length === 0) {
      return (
        <h3>
          No Reports to Review
        </h3>
      );
    }

    const rows = this.props.reportsToReview.map((row) => JSON.parse(row));
    const numReviewed = this.state.resolvedReports.length;
    const numToReview = this.props.reportsToReview.length - numReviewed;

    return (
      <div>
        <h3>
          {numToReview} {numToReview === 1 ? "report" : "reports"} remaining to review ({numReviewed} already reviewed)
        </h3>
        <Table.Provider
          className="table table-bordered table-striped"
          columns={this.columns}
        >
          <Table.Header />
          <Table.Body
            rows={rows}
            rowKey="id"
          />
        </Table.Provider>
      </div>
    );
  };
}
