import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import Button from '../Button';

export default class CensusInaccuracyReviewTable extends Component {
  static propTypes = {
    reportsToReview: PropTypes.array,
    resolvedReports: PropTypes.array,
    onStartReview: PropTypes.func
  };

  formatTeachesCs = teachesCs => {
    return (
      <div style={{textAlign: 'center', verticalAlign: 'middle'}}>
        {teachesCs}
      </div>
    );
  };

  formatComment = comment => {
    return <div>{comment}</div>;
  };

  formatSchool = school => {
    return (
      <div>
        {school.name}
        <br />({school.city}, {school.state})
      </div>
    );
  };

  beginReviewButton = (_value, data) => {
    if (this.props.resolvedReports.includes(data.rowData.id)) {
      return (
        <div style={{textAlign: 'center', verticalAlign: 'middle'}}>
          Review Completed
        </div>
      );
    } else {
      return (
        <Button
          onClick={() => {
            this.props.onStartReview(data.rowData);
          }}
          size="large"
          text="Review this School"
        />
      );
    }
  };

  columns = [
    {
      property: 'school',
      header: {
        label: 'School'
      },
      cell: {
        formatters: [this.formatSchool]
      }
    },
    {
      property: 'current_summary',
      header: {
        label: 'Current Summary'
      },
      cell: {
        formatters: [this.formatTeachesCs]
      }
    },
    {
      property: 'inaccuracy_comment',
      header: {
        label: "Submitter's comment"
      },
      cell: {
        formatters: [this.formatComment]
      }
    },
    {
      property: 'button',
      header: {
        label: 'Action'
      },
      cell: {
        formatters: [this.beginReviewButton]
      }
    }
  ];

  render = () => {
    if (this.props.reportsToReview.length === 0) {
      return <h3>No Reports to Review</h3>;
    }

    const rows = this.props.reportsToReview.map(row => JSON.parse(row));
    const numReviewed = this.props.resolvedReports.length;
    const numToReview = this.props.reportsToReview.length - numReviewed;

    return (
      <div>
        <h3>
          {numToReview} {numToReview === 1 ? 'report' : 'reports'} remaining to
          review ({numReviewed} already reviewed)
        </h3>
        <Table.Provider
          className="table table-bordered table-striped"
          columns={this.columns}
        >
          <Table.Header />
          <Table.Body rows={rows} rowKey="id" />
        </Table.Provider>
      </div>
    );
  };
}
