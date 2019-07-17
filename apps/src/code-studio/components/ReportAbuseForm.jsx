import cookies from 'js-cookie';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

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

/**
 * Extracts a channel id from the given abuse url
 * @returns {string} Channel id, or undefined if we can't get one.
 */
export const getChannelIdFromUrl = function(abuseUrl) {
  let match;
  if (abuseUrl.indexOf('codeprojects') >= 0) {
    match = /.*codeprojects.*[^\/]+\/([^\/]+)/.exec(abuseUrl);
  } else {
    match = /.*\/projects\/[^\/]+\/([^\/]+)/.exec(abuseUrl);
  }
  return match && match[1];
};

export default class ReportAbuseForm extends React.Component {
  static propTypes = {
    i18n: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired,
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
    const i18n = this.props.i18n;
    if (this.refs.email.value === '') {
      alert(i18n.t('project.abuse.report_abuse_form.validation.email'));
      event.preventDefault();
      return;
    }

    if (ReactDOM.findDOMNode(this.refs.age).value === '') {
      alert(i18n.t('project.abuse.report_abuse_form.validation.age'));
      event.preventDefault();
      return;
    }

    if (this.refs.abuse_type.value === '') {
      alert(i18n.t('project.abuse.report_abuse_form.validation.abuse_type'));
      event.preventDefault();
      return;
    }

    if (this.refs.abuse_detail.value === '') {
      alert(i18n.t('project.abuse.report_abuse_form.validation.abuse_detail'));
      event.preventDefault();
      return;
    }
    this.writeCookie();
  };

  render() {
    const i18n = this.props.i18n;
    return (
      <div style={{width: DROPDOWN_WIDTH}}>
        <h2>{i18n.t('footer.report_abuse')}</h2>
        <p>{i18n.t('project.abuse.report_abuse_form.intro')}</p>
        <br />
        <form action="/report_abuse" method="post">
          <input
            type="hidden"
            name="authenticity_token"
            value={this.props.csrfToken}
          />
          <input type="hidden" name="channel_id" value={this.getChannelId()} />
          <input type="hidden" name="name" value={this.props.name} />
          <div style={{display: this.props.email ? 'none' : 'block'}}>
            <div>{i18n.t('activerecord.attributes.user.email')}</div>
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
            <div>{i18n.t('activerecord.attributes.user.age')}</div>
            <AgeDropdown
              style={{width: DROPDOWN_WIDTH}}
              ref="age"
              age={this.props.age}
            />
          </div>

          <div>{i18n.t('project.abuse.report_abuse_form.abusive_url')}</div>
          <input
            type="text"
            readOnly={!!this.props.abuseUrl}
            style={{width: INPUT_WIDTH}}
            defaultValue={this.props.abuseUrl}
            name="abuse_url"
          />

          <div>
            <SafeMarkdown
              markdown={i18n.t(
                'project.abuse.report_abuse_form.abuse_type.question',
                {
                  link_start: '<a href="https://code.org/tos" target="_blank">',
                  link_end: '</a>'
                }
              )}
            />
          </div>
          <select
            style={{width: DROPDOWN_WIDTH}}
            name="abuse_type"
            ref="abuse_type"
            id="uitest-abuse-type"
          >
            <option value="" />
            <option value="harassment">
              {i18n.t('project.abuse.report_abuse_form.abuse_type.harassment')}
            </option>
            <option value="offensive">
              {i18n.t('project.abuse.report_abuse_form.abuse_type.offensive')}
            </option>
            <option value="infringement">
              {i18n.t(
                'project.abuse.report_abuse_form.abuse_type.infringement'
              )}
            </option>
            <option value="other">
              {i18n.t('project.abuse.report_abuse_form.abuse_type.other')}
            </option>
          </select>

          <div>{i18n.t('project.abuse.report_abuse_form.detail')}</div>
          <textarea
            style={{width: INPUT_WIDTH, height: 100}}
            name="abuse_detail"
            ref="abuse_detail"
            id="uitest-abuse-detail"
          />

          <div>
            <SafeMarkdown
              markdown={i18n.t('project.abuse.report_abuse_form.acknowledge', {
                link_start_privacy:
                  '<a href="https://code.org/privacy" target="_blank">',
                link_start_tos:
                  '<a href="https://code.org/tos" target="_blank">',
                link_end: '</a>'
              })}
            />
          </div>
          <button
            type="submit"
            onClick={this.handleSubmit}
            id="uitest-submit-report-abuse"
          >
            {i18n.t('submit')}
          </button>
        </form>
      </div>
    );
  }
}

// TODO - just expose renderer on dashboard?
window.dashboard = window.dashboard || {};
window.dashboard.ReportAbuseForm = ReportAbuseForm;
