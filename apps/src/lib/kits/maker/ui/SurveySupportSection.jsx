import React, {PropTypes} from 'react';

export default class SurveySupportSection extends React.Component {
  static propTypes = {
    surveyUrl: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div>
        <h2>Survey / Support</h2>
        <div>
          <p>Did it work? Having trouble?</p>

          <a
            href={this.props.surveyUrl}
            style={{'fontSize': '20px', marginBottom: 14, marginTop: 12, display: 'block'}}
          >
            Submit our quick survey&nbsp;
            <i className="fa fa-arrow-circle-o-right" />
          </a>
          <p>Results of setup status detection and browser/platform information will be pre-filled in the survey through the link above.</p>
        </div>
      </div>
    );
  }
}
