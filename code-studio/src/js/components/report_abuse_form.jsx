/* global dashboard, React */

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */

var INPUT_WIDTH = 500;
// dropdown width is wider so that it still lines up with inputs (which have
// padding)
var DROPDOWN_WIDTH = 514;

var alert = window.alert;

/**
 * A dropdown with the set of ages we use across our site (4-20, 21+)
 */
var AgeDropdown = React.createClass({
  propTypes: {
    age: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    style: React.PropTypes.object
  },

  render: function () {
    var style = $.extend({}, {width: DROPDOWN_WIDTH}, this.props.style);

    var age = this.props.age && this.props.age.toString();
    var ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
      '15', '16', '17', '18', '19', '20', '21+'];

    if (this.props.age !== null && ages.indexOf(age) === -1) {
      throw new Error('Invalid age: ' + age);
    }

    return (
      <select name="age" style={style} defaultValue={age}>{
        ages.map(function (age) {
          return <option key={age} value={age}>{age}</option>;
        })
      }</select>
    );
  }
});

var ReportAbuseForm = React.createClass({
  propTypes: {
    i18n: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
    abuseUrl: React.PropTypes.string.isRequired,
    name: React.PropTypes.string,
    email: React.PropTypes.string,
    age: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ])
  },

  /**
   * Extracts a channel id from the given abuse url
   * @returns {string} Channel id, or undefined if we can't get one.
   */
  getChannelId: function () {
    var match = /.*\/projects\/[^\/]+\/([^\/]+)/.exec(this.props.abuseUrl);
    return match && match[1];
  },

  handleSubmit: function (event) {
    var i18n = this.props.i18n;
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
  },

  render: function () {
    var i18n = this.props.i18n;
    return (
      <div style={{width: DROPDOWN_WIDTH}}>
        <h2>{i18n.t('footer.report_abuse')}</h2>
        <p>{i18n.t('project.abuse.report_abuse_form.intro')}</p>
        <br/>
        <form action="/report_abuse" method="post">
          <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
          <input type="hidden" name="channel_id" value={this.getChannelId()}/>
          <input type="hidden" name="name" value={this.props.name}/>
          <div style={{display: this.props.email ? 'none' : 'block'}}>
            <div>{i18n.t('activerecord.attributes.user.email')}</div>
            <input type="text" style={{width: INPUT_WIDTH}} defaultValue={this.props.email} name="email" ref="email"/>
          </div>

          <div style={{display: this.props.age ? 'none' : 'block'}}>
            <div>{i18n.t('activerecord.attributes.user.age')}</div>
            <AgeDropdown age={this.props.age} ref="age"/>
          </div>

          <div>{i18n.t('project.abuse.report_abuse_form.abusive_url')}</div>
          <input type="text" readOnly={!!this.props.abuseUrl} style={{width: INPUT_WIDTH}} defaultValue={this.props.abuseUrl} name="abuse_url"/>

          {/* we dangerouslySetInnerHTML because our string has html in it*/ }
          <div dangerouslySetInnerHTML={{
            __html: i18n.t('project.abuse.report_abuse_form.abuse_type.question', {
              link_start: '<a href="https://code.org/tos" target="_blank">',
              link_end: '</a>'
            })}}/>
          <select style={{width: DROPDOWN_WIDTH}} name="abuse_type" ref="abuse_type">
            <option value=""></option>
            <option value="harassment">{i18n.t('project.abuse.report_abuse_form.abuse_type.harassment')}</option>
            <option value="offensive">{i18n.t('project.abuse.report_abuse_form.abuse_type.offensive')}</option>
            <option value="infringement">{i18n.t('project.abuse.report_abuse_form.abuse_type.infringement')}</option>
            <option value="other">{i18n.t('project.abuse.report_abuse_form.abuse_type.other')}</option>
          </select>

          <div>{i18n.t('project.abuse.report_abuse_form.detail')}</div>
          <textarea style={{width: INPUT_WIDTH, height: 100}} name="abuse_detail" ref="abuse_detail"/>

          {/* we dangerouslySetInnerHTML because our string has html in it*/ }
          <div dangerouslySetInnerHTML={{
            __html: i18n.t('project.abuse.report_abuse_form.acknowledge', {
              link_start_privacy: '<a href="https://code.org/privacy" target="_blank">',
              link_start_tos: '<a href="https://code.org/tos" target="_blank">',
              link_end: '</a>'
            })}}/>
          <button onClick={this.handleSubmit}>
            {i18n.t('submit')}
          </button>
        </form>
      </div>
    );
  }
});
module.exports = ReportAbuseForm;

// TODO - just expose renderer on dashboard?
window.dashboard = window.dashboard || {};
window.dashboard.ReportAbuseForm = ReportAbuseForm;
