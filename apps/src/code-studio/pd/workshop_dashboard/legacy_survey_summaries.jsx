import PropTypes from 'prop-types';
import React from 'react';
import Spinner from '../components/spinner';

class LegacySurveySummaryTable extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.object
  };

  render() {
    return (
      <div>
        <h3>{this.props.title}</h3>
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.props.data).map((key, index) => (
              <tr key={index}>
                <td>{key}</td>
                <td>{this.props.data[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default class LegacySurveySummaries extends React.Component {
  state = {
    loading: true,
    data: null
  };

  componentDidMount() {
    this.load();
  }

  load = () => {
    this.setState({loading: true});

    const queryUrl = '/api/v1/pd/legacy_survey_summaries';

    this.loadRequest = $.ajax({
      method: 'GET',
      url: queryUrl,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        data: data
      });
    });
  };

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Spinner />
        </div>
      );
    }

    const {
      csf_intro_post_workshop_from_pegasus,
      csf_intro_post_workshop_from_pegasus_for_all_workshops,
      csd_summer_workshops_from_jotform,
      csp_summer_workshops_from_jotform
    } = this.state.data;

    return (
      <div>
        {Object.keys(csf_intro_post_workshop_from_pegasus).length > 0 && (
          <div>
            <LegacySurveySummaryTable
              title="CSF Intro - my workshops"
              data={csf_intro_post_workshop_from_pegasus}
            />
            <LegacySurveySummaryTable
              title="CSF Intro - all workshops"
              data={csf_intro_post_workshop_from_pegasus_for_all_workshops}
            />
          </div>
        )}

        {Object.keys(csd_summer_workshops_from_jotform).length > 0 && (
          <LegacySurveySummaryTable
            title="CSD summer - my workshops"
            data={csd_summer_workshops_from_jotform}
          />
        )}

        {Object.keys(csp_summer_workshops_from_jotform).length > 0 && (
          <LegacySurveySummaryTable
            title="CSP summer - my workshops"
            data={csp_summer_workshops_from_jotform}
          />
        )}
      </div>
    );
  }
}
