window.dashboard = window.dashboard || {};

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
window.dashboard.ReportAbuseForm = (function (React) {
  var INPUT_WIDTH = 500;
  // dropdown width is wider so that it still lines up with inputs (which have
  // padding)
  var DROPDOWN_WIDTH = 514;

  // TODO - temp i18n
  var strs = {
    submit: 'Submit',
    report_abuse: {
      validation: {
        email: 'Please provide an email address',
        age: 'Please specify an age',
        abuseType: 'Please answer how this content violates the Terms of Service',
        abuseDetail: 'Please provide details regarding the content you are reporting'
      },
      email: 'Email',
      age: 'Age',
      abusiveUrl: 'Abusive URL',
      abuseType: {
        question: 'How does this content violate the %{link_start}Terms of Service%{link_end}?',
        harassment: 'Threats, cyberbullying, harassement',
        offensive: 'Offensive content',
        infringement: 'Copyright Infringement',
        other: 'Other'
      },
      detail: 'Please provide as much detail as possible regarding the content you are reporting.',
      acknowledge: 'By submitting this information, you acknowledge it will be handled in accordance with the terms of the %{link_start_privacy}Privacy Policy%{link_end} and the %{link_start_tos}Terms of Service%{link_end}'
    }
  };

  var i18n = {
    /**
     * Mimics dashboard's I18n.t, getting a string from the hierarchy
     * @param {string} selector Selector the desired string, i.e. "project.abuse.tos"
     */
    t: function (selector, params) {
      var hierarchy = selector.split('.');
      var current = strs;
      hierarchy.forEach(function(item) {
        current = current[item];
        if (!current) {
          throw new Error('i18n failed to find string: ' + selector);
        }
      });
      if (typeof(current) !== 'string') {
        throw new Error('i18n not a leaf: ' + selector);
      }

      Object.keys(params || {}).forEach(function (key) {
        current = current.replace(new RegExp('%{' + key + '}', 'g'), params[key]);
      });

      return current;
    }
  };


  /**
   * A dropdown with the set of ages we use across our site (4-20, 21+)
   */
  var AgeDropdown = React.createClass({
    propTypes: {
      age: React.PropTypes.string
    },

    render: function () {
      var style = $.extend({}, {width: DROPDOWN_WIDTH}, this.props.style);

      var ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
        '15', '16', '17', '18', '19', '20', '21+'];

      if (this.props.age !== null && ages.indexOf(this.props.age) == -1) {
        throw new Error('Invalid age: ' + this.props.age);
      }

      return (
        <select style={style} value={this.props.age}>{
          ages.map(function (age) {
            return <option key={age} value={age}>{age}</option>;
          })
        }</select>
      );
    }
  });

  return React.createClass({
    propTypes: {
      csrfToken: React.PropTypes.string.isRequired,
      abuseUrl: React.PropTypes.string.isRequired,
      name: React.PropTypes.string,
      email: React.PropTypes.string,
      age: React.PropTypes.string,
    },

    /**
     * Extracts a channel id from the given abuse url
     * @returns {string} Channel id, or undefined if we can't get one.
     */
    getChannelId: function () {
      var match = /.*\/projects\/[^\/]+\/([^\/]+)/.exec(this.props.abuseUrl);
      return match && match[1];
    },

    handleSubmit: function () {
      if (React.findDOMNode(this.refs.email).value === '') {
        alert(i18n.t('report_abuse.validation.email'));
        return false;
      }

      if (React.findDOMNode(this.refs.age).value === '') {
        alert(i18n.t('report_abuse.validation.age'));
        return false;
      }

      if (React.findDOMNode(this.refs.abuseType).value === '') {
        alert(i18n.t('report_abuse.validation.abuseType'));
        return false;
      }

      if (React.findDOMNode(this.refs.abuseDetail).value === '') {
        alert(i18n.t('report_abuse.validation.abuseDetail'));
        return false;
      }
      return true;
    },

    render: function () {
      return (
        <form action="/zendesk_report_abuse" method="post">
          <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
          <input type="hidden" name="channel_id" value={this.getChannelId()}/>
          <input type="hidden" name="name" value={this.props.name}/>
          <div style={{display: this.props.email ? 'none' : 'block'}}>
            <div>{i18n.t('report_abuse.email')}</div>
            <input type="text" style={{width: INPUT_WIDTH}} defaultValue={this.props.email} name="email" ref="email"/>
          </div>

          <div style={{display: this.props.age ? 'none' : 'block'}}>
            <div>{i18n.t('report_abuse.age')}</div>
            <AgeDropdown age={this.props.age} ref="age"/>
          </div>

          <div>{i18n.t('report_abuse.abusiveUrl')}</div>
          <input type="text" readOnly style={{width: INPUT_WIDTH}} defaultValue={this.props.abuseUrl} name="abuse_url"/>

          {/* we dangerouslySetInnerHTML because our string has html in it*/ }
          <div dangerouslySetInnerHTML={{
            __html: i18n.t('report_abuse.abuseType.question', {
              link_start: '<a href="http://code.org/tos" target="_blank">',
              link_end: '</a>'
            })}}/>
          <select style={{width: DROPDOWN_WIDTH}} name="abuse_type" ref="abuseType">
            <option value=""></option>
            <option value="harassment">{i18n.t('report_abuse.abuseType.harassment')}</option>
            <option value="offensive">{i18n.t('report_abuse.abuseType.offensive')}</option>
            <option value="infringement">{i18n.t('report_abuse.abuseType.infringement')}</option>
            <option value="other">{i18n.t('report_abuse.abuseType.other')}</option>
          </select>

          <div>{i18n.t('report_abuse.detail')}</div>
          <textarea style={{width: INPUT_WIDTH, height: 100}} name="abuse_detail" ref="abuseDetail"/>

          {/* we dangerouslySetInnerHTML because our string has html in it*/ }
          <div dangerouslySetInnerHTML={{
            __html: i18n.t('report_abuse.acknowledge', {
              link_start_privacy: '<a href="http://code.org/privacy" target="_blank">',
              link_start_tos: '<a href="http://code.org/tos" target="_blank">',
              link_end: '</a>'
            })}}/>
          <button onClick={this.handleSubmit}>
            {i18n.t('submit')}
          </button>
        </form>
      );
    }
  });
})(React);
