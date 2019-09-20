import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import Spinner from '../../../components/spinner';
import Results from './results';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';

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
  }
};

export class ResultsLoader extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string.isRequired
    })
  };

  state = {loading: true, errors: null};

  componentDidMount() {
    this.load();
  }

  load() {
    const inExperiment = experiments.isEnabled(
      experiments.ROLLUP_SURVEY_REPORT
    );

    const url = inExperiment
      ? `/api/v1/pd/workshops/${
          this.props.params['workshopId']
        }/experiment_survey_report`
      : `/api/v1/pd/workshops/${
          this.props.params['workshopId']
        }/generic_survey_report`;

    this.loadRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.setState({
          loading: false,
          questions: data['questions'],
          thisWorkshop: data['this_workshop'],
          sessions: Object.keys(data['this_workshop']),
          facilitators: data['facilitators'],
          facilitatorAverages: data['facilitator_averages'],
          facilitatorResponseCounts: data['facilitator_response_counts'],
          courseName: data['course_name']
        });

        if (inExperiment) {
          this.setState({
            workshopRollups: data['workshop_rollups'],
            facilitatorRollups: data['facilitator_rollups']
          });
        }
      })
      .fail(jqXHR => {
        this.setState({
          loading: false,
          errors: (jqXHR.responseJSON || {}).errors
        });
      });
  }

  renderErrors() {
    return (
      <div id="error_list" style={styles.errorContainer}>
        <h1>An error occurred</h1>
        <p>
          Unfortunately this request could not be processed. Our team has been
          notified.
        </p>
        <div style={styles.errorDetailsBox}>
          Error details:
          <ul>
            {this.state.errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    const {loading, errors, ...data} = this.state;

    if (loading) {
      return (
        <div>
          <Spinner />
        </div>
      );
    } else if (errors) {
      return this.renderErrors();
    } else {
      return <Results {...data} />;
    }
  }
}
