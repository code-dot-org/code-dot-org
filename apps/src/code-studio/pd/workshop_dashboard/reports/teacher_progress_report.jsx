/**
 * Teacher Progress Report
 */
import React from "react";
import ReportTable from "./report_table";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {Button} from 'react-bootstrap';
import {QUERY_BY_VALUES} from './report_constants';

const QUERY_URL = "/api/v1/pd/teacher_progress_report";

const styles = {
  link: {cursor: 'pointer'}
};

const TeacherProgressReport = React.createClass({
  propTypes: {
    startDate: React.PropTypes.string.isRequired,
    endDate: React.PropTypes.string.isRequired,
    queryBy: React.PropTypes.oneOf(QUERY_BY_VALUES).isRequired
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      loading: true,
      rows: null,
      showFacilitatorDetails: false
    };
  },

  componentDidMount() {
    this.load();
  },

  componentWillUnmount() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.startDate !== this.props.startDate ||
      nextProps.endDate !== this.props.endDate ||
      nextProps.queryBy !== this.props.queryBy
    ) {
      this.load();
    }
  },

  formatQueryParams() {
    const {startDate, endDate, queryBy} = this.props;
    return `start=${startDate}&end=${endDate}&query_by=${queryBy}`;
  },

  load() {
    const url = `${QUERY_URL}?${this.formatQueryParams()}`;

    this.setState({loading: true});
    this.loadRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        rows: data
      });
    });
  },

  formatWorkshopId(workshop_id) {
    const href = this.context.router.createHref(`/workshops/${workshop_id}`);
    return <a href={href} target="_blank" style={styles.link}>{workshop_id}</a>;
  },

  formatUrl(url) {
    return <a href={url} target="_blank" style={styles.link}>{url}</a>;
  },

  formatYesNo(value) {
    return value ? "YES" : "NO";
  },

  formatCurrency(amount) {
    return amount ? `$${Number(amount).toFixed(2)}` : null;
  },

  isAdmin() {
    return window.dashboard.workshop.permission === 'admin';
  },

  getColumns() {
    let columns = [{
      property: 'teacher_name',
      header: {label: 'Teacher Name'}
    }, {
      property: 'teacher_id',
      header: {label: 'Teacher Id'}
    }, {
      property: 'teacher_email',
      header: {label: 'Teacher Email'}
    }, {
      property: 'plp_name',
      header: {label: 'PLP Name'}
    }, {
      property: 'state',
      header: {label: 'State'}
    }, {
      property: 'district_name',
      header: {label: 'District Name'},
    }, {
      property: 'district_id',
      header: {label: 'District Id'},
    }, {
      property: 'school',
      header: {label: 'School'},
    }, {
      property: 'course',
      header: {label: 'Course'},
    }, {
      property: 'subject',
      header: {label: 'Subject'},
    }, {
      property: 'workshop_id',
      header: {label: 'Workshop Id'},
      cell: {format: this.formatWorkshopId}
    }, {
      property: 'workshop_dates',
      header: {label: 'Workshop Dates'},
    }, {
      property: 'workshop_name',
      header: {label: 'Workshop Name'},
    }, {
      property: 'workshop_type',
      header: {label: 'Workshop Type'},
    }, {
      property: 'organizer_name',
      header: {label: 'Organizer Name'},
    }, {
      property: 'organizer_email',
      header: {label: 'Organizer Email'},
    }, {
      property: 'year',
      header: {label: 'Year'},
    }, {
      property: 'hours',
      header: {label: 'Hours'},
    }, {
      property: 'days',
      header: {label: 'Days'}
    }];

    if (this.isAdmin()) {
      columns.push({
        property: `pay_period`,
        header: {label: `Pay Period`}
      }, {
        property: `payment_type`,
        header: {label: `Payment Type`}
      }, {
        property: `payment_rate`,
        header: {label: `Payment Rate`}
      }, {
        property: `qualified`,
        header: {label: `Qualified`},
        cell: {format: this.formatYesNo}
      }, {
        property: `payment_amount`,
        header: {label: `Payment Amount`},
        cell: {format: this.formatCurrency}
      });
    }

    return columns;
  },

  handleDownloadCSVClick() {
    const downloadUrl = `${QUERY_URL}.csv?${this.formatQueryParams()}`;
    window.open(downloadUrl);
  },

  handleFacilitatorDetailsChange(e) {
    this.setState({showFacilitatorDetails: e.target.checked});
  },

  render() {
    if (this.state.loading) {
      return <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>;
    }

    return (
      <div>
        <Button
          style={{marginBottom: 20}}
          onClick={this.handleDownloadCSVClick}
        >
          Download CSV
        </Button>
        <ReportTable
          columns={this.getColumns()}
          rows={this.state.rows}
        />
      </div>
    );
  },
});
export default TeacherProgressReport;
