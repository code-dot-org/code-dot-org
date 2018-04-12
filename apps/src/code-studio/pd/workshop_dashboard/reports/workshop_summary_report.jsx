/**
 * Workshop Summary Report
 */
import React, {PropTypes} from "react";
import {connect} from 'react-redux';
import ReportTable from "./report_table";
import {
  PermissionPropType,
  WorkshopAdmin
} from '../permission';
import {
  Checkbox,
  Button
} from 'react-bootstrap';
import {QUERY_BY_VALUES, COURSE_VALUES} from './report_constants';
import Spinner from '../../components/spinner';

const FACILITATOR_DETAILS_COUNT = 6;
const ATTENDANCE_DAYS_COUNT = 5;
const QUERY_URL = "/api/v1/pd/workshop_summary_report";

const styles = {
  link: {cursor: 'pointer'}
};

export class WorkshopSummaryReport extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    queryBy: PropTypes.oneOf(QUERY_BY_VALUES).isRequired,
    course: PropTypes.oneOf(COURSE_VALUES)
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    rows: null,
    showFacilitatorDetails: false
  };

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.startDate !== this.props.startDate ||
      nextProps.endDate !== this.props.endDate ||
      nextProps.queryBy !== this.props.queryBy ||
      nextProps.course !== this.props.course
    ) {
      this.load(nextProps);
    }
  }

  formatQueryParams(props = this.props) {
    const {startDate, endDate, queryBy, course} = props;
    const course_param = course ? `&course=${course}` : "";
    return `start=${startDate}&end=${endDate}&query_by=${queryBy}${course_param}`;
  }

  load(props = this.props) {
    const url = `${QUERY_URL}?${this.formatQueryParams(props)}`;

    // Abort any existing load request.
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
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
  }

  formatWorkshopId = (workshop_id) => {
    const href = this.context.router.createHref(`/workshops/${workshop_id}`);
    return <a href={href} target="_blank" style={styles.link}>{workshop_id}</a>;
  };

  formatUrl = (url) => {
    return <a href={url} target="_blank" style={styles.link}>{url}</a>;
  };

  formatYesNo = (value) => {
    return value ? "YES" : "NO";
  };

  formatCurrency = (amount) => {
    return amount ? `$${Number(amount).toFixed(2)}` : null;
  };

  getColumns() {
    let columns = [{
      property: 'organizer_name',
      header: {label: 'Organizer Name'}
    }, {
      property: 'organizer_id',
      header: {label: 'Organizer Id'}
    }, {
      property: 'organizer_email',
      header: {label: 'Organizer Email'}
    }, {
      property: 'regional_partner_name',
      header: {label: 'Regional Partner'}
    }, {
      property: 'workshop_name',
      header: {label: 'Workshop Name'}
    }, {
      property: 'on_map',
      header: {label: 'Shown on Map'},
    }, {
      property: 'funded',
      header: {label: 'Funded'}
    }, {
      property: 'workshop_dates',
      header: {label: 'Dates'}
    }, {
      property: 'workshop_id',
      header: {label: 'Workshop Id'},
      cell: {format: this.formatWorkshopId}
    }, {
      property: 'course',
      header: {label: 'Course'}
    }, {
      property: 'subject',
      header: {label: 'Subject'}
    }, {
      property: 'attendance_url',
      header: {label: 'Attendance URL'},
      cell: {format: this.formatUrl}
    }, {
      property: 'facilitators',
      header: {label: 'Facilitators'}
    }, {
      property: 'num_facilitators',
      header: {label: 'Num Facilitators'}
    }];

    if (this.state.showFacilitatorDetails) {
      for (let i = 1; i <= FACILITATOR_DETAILS_COUNT; i++) {
        columns.push({
          property: `facilitator_name_${i}`,
          header: {label: `Facilitator Name ${i}`}
        }, {
          property: `facilitator_email_${i}`,
          header: {label: `Facilitator Email ${i}`}
        });
      }
    }

    columns.push({
      property: 'num_registered',
      header: {label: 'Num Registered'}
    }, {
      property: 'num_qualified_teachers',
      header: {label: 'Num Qualified Teachers'}
    }, {
      property: 'days',
      header: {label: 'Days'}
    });

    for (let i = 1; i <= ATTENDANCE_DAYS_COUNT; i++) {
      columns.push({
        property: `attendance_day_${i}`,
        header: {label: `Attendance Day ${i}`}
      });
    }

    if (this.props.permission.has(WorkshopAdmin)) {
      columns.push({
        property: `pay_period`,
        header: {label: `Pay Period`}
      }, {
        property: `payment_type`,
        header: {label: `Payment Type`}
      }, {
        property: `qualified`,
        header: {label: `Qualified`},
        cell: {format: this.formatYesNo}
      }, {
        property: `food_payment`,
        header: {label: `Food Payment`},
        cell: {format: this.formatCurrency}
      }, {
        property: `facilitator_payment`,
        header: {label: `Facilitator Payment`},
        cell: {format: this.formatCurrency}
      }, {
        property: `staffer_payment`,
        header: {label: `Staffer Payment`},
        cell: {format: this.formatCurrency}
      }, {
        property: `venue_payment`,
        header: {label: `Venue Payment`},
        cell: {format: this.formatCurrency}
      }, {
        property: `payment_total`,
        header: {label: `Payment Total`},
        cell: {format: this.formatCurrency}
      });
    }

    return columns;
  }

  handleDownloadCSVClick = () => {
    const downloadUrl = `${QUERY_URL}.csv?${this.formatQueryParams()}`;
    window.open(downloadUrl);
  };

  handleFacilitatorDetailsChange = (e) => {
    this.setState({showFacilitatorDetails: e.target.checked});
  };

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }

    return (
      <div>
        <Button
          onClick={this.handleDownloadCSVClick}
        >
          Download CSV
        </Button>
        <Checkbox
          checked={this.state.showFacilitatorDetails}
          onChange={this.handleFacilitatorDetailsChange}
        >
          Show Facilitator Details
        </Checkbox>
        <ReportTable
          columns={this.getColumns()}
          rows={this.state.rows}
        />
      </div>
    );
  }
}

export default connect(state => ({
  permission: state.permission
}))(WorkshopSummaryReport);
