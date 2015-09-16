window.dashboard = window.dashboard || {};

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
window.dashboard.ReportAbuseForm = (function (React) {

  /**
   * A dropdown with the set of ages we use across our site (4-20, 21+)
   */
  var AgeDropdown = React.createClass({
    propTypes: {
      age: React.PropTypes.string
    },

    render: function () {
      var style = $.extend({}, {width :500}, this.props.style);

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
      console.log(match && match[1]);
      return match && match[1];
    },

    handleSubmit: function () {
      // TODO - validate form
    },

    render: function () {
      // TODO - i18n
      return (
        <form action="/zendesk_report_abuse" method="post">
          <input type="hidden" name="authenticity_token" value={this.props.csrfToken}/>
          <input type="hidden" name="channel_id" value={this.getChannelId()}/>
          <input type="hidden" name="name" value={this.props.name}/>
          <div style={{display: this.props.email ? 'none' : 'block'}}>
            <div>Email</div>
            <input type="text" style={{width: 500}} defaultValue={this.props.email} name="email"/>
          </div>

          <div style={{display: this.props.age ? 'none' : 'block'}}>
            <div>Age</div>
            <AgeDropdown age={this.props.age}/>
          </div>

          <div>Abusive URL</div>
          <input type="text" readOnly style={{width: 500}} defaultValue={this.props.abuseUrl} name="abuse_url"/>

          <div>How does this content violate the <a href="https://code.org/tos" target="_blank">Terms of Service</a>?</div>
          <select style={{width: 500}} name="abuse_type">
            <option value=""></option>
            <option value="harassment">Threats, cyberbullying, harassement</option>
            <option value="offensive">Offensive content</option>
            <option value="infringement">Copyright infringment</option>
            <option value="other">Other</option>
          </select>

          <div>Please provide as much detail as possible regarding the content you are reporting.</div>
          <textarea style={{width: 500, height: 100}} name="abuse_detail"/>

          <div>
            By submitting this information, you acknowledge it will be handled in accordance with the terms of the
            {" "}<a href="https://code.org/privacy" target="_blank">Privacy Policy</a>{" "}
            and the
            {" "}<a href='https://code.org/tos' target="_blank">Terms of Service</a>{" "}
          </div>

          <button onClick={this.handleSubmit}>
            Submit
          </button>
        </form>
      );
    }
  });
})(React);
