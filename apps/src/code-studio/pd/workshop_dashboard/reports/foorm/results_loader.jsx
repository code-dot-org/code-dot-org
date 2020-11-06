import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import Spinner from '../../../components/spinner';
import Results from './results';
import color from '@cdo/apps/util/color';
import SubmissionsDownloadForm from './submissions_download_form';
import {Button} from 'react-bootstrap';
import {PermissionPropType, WorkshopAdmin} from '../../permission';
import {connect} from 'react-redux';

const styles = {
  errorContainer: {
    marginTop: 15,
    marginLeft: 15
  },
  errorDetailsBox: {
    backgroundColor: color.lightest_gray,
    padding: 20,
    maxWidth: 550,
    marginTop: 20
  },
  csvExportButton: {
    float: 'right'
  }
};

export class ResultsLoader extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string.isRequired
    }),
    permission: PermissionPropType.isRequired
  };

  state = {loading: true, hasErrors: false};

  componentDidMount() {
    this.load();
  }

  load() {
    const url = `/api/v1/pd/workshops/${
      this.props.params['workshopId']
    }/foorm/generic_survey_report`;

    this.loadRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.setState({
          loading: false,
          questions: data['questions'],
          facilitators: data['facilitators'],
          thisWorkshop: data['this_workshop'],
          workshopTabs: Object.keys(data['this_workshop']),
          courseName: data['course_name'],
          workshopRollups: data['workshop_rollups']
        });
      })
      .error(() => {
        this.setState({
          loading: false,
          hasErrors: true
        });
      });
  }

  renderErrors() {
    return (
      <div id="error_list" style={styles.errorContainer}>
        <h1>An error occurred</h1>
        <p>Unfortunately this request could not be processed.</p>
      </div>
    );
  }

  render() {
    const {loading, hasErrors, ...data} = this.state;

    if (loading) {
      return (
        <div>
          <Spinner />
        </div>
      );
    } else if (hasErrors) {
      return this.renderErrors();
    } else {
      return (
        <div>
          {this.props.permission.has(WorkshopAdmin) && (
            <SubmissionsDownloadForm
              workshopId={this.props.params['workshopId']}
              style={styles.csvExportButton}
            >
              <Button>Export Survey Results</Button>
            </SubmissionsDownloadForm>
          )}
          <Results {...data} />
        </div>
      );
    }
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission
}))(ResultsLoader);
