import cookies from 'js-cookie';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import msg from '@cdo/locale';
import {getChannelIdFromUrl} from '@cdo/apps/reportAbuse';
import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */

const INPUT_WIDTH = 500;
// dropdown width is wider so that it still lines up with inputs (which have
// padding)
const DROPDOWN_WIDTH = 514;

const alert = window.alert;

export default class ReportAbuseForm extends React.Component {
  static propTypes = {
    abuseUrl: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  /**
   * Extracts a channel id from the given abuse url
   * @returns {string} Channel id, or undefined if we can't get one.
   */
  getChannelId() {
    const abuseUrl = this.props.abuseUrl;
    return getChannelIdFromUrl(abuseUrl);
  }

  writeCookie() {
    if (cookies.get('reported_abuse')) {
      const reportedProjectIds = JSON.parse(cookies.get('reported_abuse'));
      reportedProjectIds.push(this.getChannelId());
      cookies.set('reported_abuse', _.uniq(reportedProjectIds));
    } else {
      cookies.set('reported_abuse', [this.getChannelId()]);
    }
  }

  handleSubmit = event => {
    if (this.refs.email.value === '') {
      alert(msg.provideEmail());
      event.preventDefault();
      return;
    }

    if (ReactDOM.findDOMNode(this.refs.age).value === '') {
      alert(msg.provideAgeReportAbuse());
      event.preventDefault();
      return;
    }

    if (this.refs.abuse_type.value === '') {
      alert(msg.abuseType());
      event.preventDefault();
      return;
    }

    if (this.refs.abuse_detail.value === '') {
      alert(msg.abuseDetail());
      event.preventDefault();
      return;
    }
    this.writeCookie();
  };

  render() {
    return (
      <div style={{width: DROPDOWN_WIDTH}}>
        <h2>{msg.reportAbuse()}</h2>
        <p>{msg.reportAbuseIntro()}</p>
        <br />
        <form action="/report_abuse" method="post">
          <RailsAuthenticityToken />
          <input
            type="hidden"
            name="channel_id"
            defaultValue={this.getChannelId()}
          />
          <input type="hidden" name="name" defaultValue={this.props.name} />
          <div style={{display: this.props.email ? 'none' : 'block'}}>
            <div>{msg.email()}</div>
            <input
              type="text"
              style={{width: INPUT_WIDTH}}
              defaultValue={this.props.email}
              name="email"
              ref="email"
              id="uitest-email"
            />
          </div>

          <div style={{display: this.props.age ? 'none' : 'block'}}>
            <div>{msg.age()}</div>
            <AgeDropdown
              style={{width: DROPDOWN_WIDTH}}
              ref="age"
              age={this.props.age}
            />
          </div>

          <div>{msg.abusiveUrl()}</div>
          <input
            type="text"
            readOnly={!!this.props.abuseUrl}
            style={{width: INPUT_WIDTH}}
            defaultValue={this.props.abuseUrl}
            name="abuse_url"
          />

          <div>
            <SafeMarkdown
              markdown={msg.abuseTypeQuestion({
                url: 'https://code.org/tos'
              })}
            />
          </div>
          <select
            style={{width: DROPDOWN_WIDTH}}
            name="abuse_type"
            ref="abuse_type"
            id="uitest-abuse-type"
          >
            <option value="" />
            <option value="harassment">{msg.abuseTypeHarassment()}</option>
            <option value="offensive">{msg.abuseTypeOffensive()}</option>
            <option value="infringement">{msg.abuseTypeInfringement()}</option>
            <option value="other">{msg.abuseTypeOther()}</option>
          </select>

          <div>{msg.abuseFormDetail()}</div>
          <textarea
            style={{width: INPUT_WIDTH, height: 100}}
            name="abuse_detail"
            ref="abuse_detail"
            id="uitest-abuse-detail"
          />

          <div>
            <SafeMarkdown
              markdown={msg.abuseFormAcknowledge({
                privacy_url: 'https://code.org/privacy',
                tos_url: 'https://code.org/tos'
              })}
            />
          </div>
          <button
            type="submit"
            onClick={this.handleSubmit}
            id="uitest-submit-report-abuse"
          >
            {msg.submit()}
          </button>
        </form>
      </div>
    );
  }
}
