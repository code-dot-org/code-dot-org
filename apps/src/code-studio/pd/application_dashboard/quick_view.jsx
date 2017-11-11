/**
 * Application Dashboard quick view.
 * Route: /csd_teachers
 *        /csp_teachers
 *        /csf_facilitators
 *        /csd_facilitators
 *        /csp_facilitators
 */
import React, {PropTypes} from 'react';
import Select from "react-select";
import "react-select/dist/react-select.css";
import QuickViewTable from './quick_view_table';
import Spinner from '../components/spinner';
import $ from 'jquery';
import {TeacherApplicationStatuses, FacilitatorApplicationStatuses} from './constants';
import {
  Button,
  FormGroup,
  ControlLabel,
  Row,
  Col
} from 'react-bootstrap';

// Default max height for the React-Select menu popup, as defined in the imported react-select.css,
// is 200px for the container, and 198 for the actual menu (to accommodate 2px for the border).
// React-Select has props for overriding these default css styles. Increase the max height here:
const selectMenuMaxHeight = 400;
const selectStyleProps = {
  menuContainerStyle: {
    maxHeight: selectMenuMaxHeight
  },
  menuStyle: {
    maxHeight: selectMenuMaxHeight - 2
  }
};

const styles = {
  button: {
    margin: '20px auto'
  },
  select: {
    width: '200px'
  }
};

export default class QuickView extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      regionalPartnerName: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      applicationType: PropTypes.string.isRequired,
      viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null,
    filter: null
  };

  getApiUrl = (format = '') => `/api/v1/pd/applications/quick_view${format}?role=${this.props.route.path}`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => this.getApiUrl('.csv');

  componentWillMount() {
    $.ajax({
      method: 'GET',
      url: this.getJsonUrl(),
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });

    const statusList = (this.props.route.viewType === 'facilitator') ? FacilitatorApplicationStatuses : TeacherApplicationStatuses;
    this.statuses = statusList.map(v => ({value: v.toLowerCase(), label: v}));
    this.statuses.unshift({value: null, label: "\u00A0"});
  }

  handleDownloadCsvClick = event => {
    window.open(this.getCsvUrl());
  };

  handleStateChange = (selected) => {
    const filter = selected ? selected.value : null;
    this.setState({filter: filter});
  };

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }

    return (
      <div>
        <Row>
          <h1>{this.props.route.regionalPartnerName}</h1>
          <h2>{this.props.route.applicationType}</h2>
          <Col md={6} sm={6}>
            <Button
              style={styles.button}
              onClick={this.handleDownloadCsvClick}
            >
              Download CSV
            </Button>
          </Col>
          <Col md={6} sm={6}>
            <FormGroup className="pull-right">
              <ControlLabel>Filter by Status</ControlLabel>
              <Select
                value={this.state.filter}
                onChange={this.handleStateChange}
                placeholder={null}
                options={this.statuses}
                style={styles.select}
                {...selectStyleProps}
              />
            </FormGroup>
          </Col>
        </Row>
        <QuickViewTable
          path={this.props.route.path}
          data={this.state.applications}
          statusFilter={this.state.filter}
        />
      </div>
    );
  }
}
