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
      console.log(match && match[1]);
      return match && match[1];
    },

    handleSubmit: function () {
      if (React.findDOMNode(this.refs.email).value === '') {
        alert('Please provide an email address');
        return false;
      }

      if (React.findDOMNode(this.refs.age).value === '') {
        alert('Please specify an age');
        return false;
      }

      if (React.findDOMNode(this.refs.abuseType).value === '') {
        alert('Please answer how this content violates the Terms of Service');
        return false;
      }

      if (React.findDOMNode(this.refs.abuseDetail).value === '') {
        alert('Please provide details regarding the content you are reporting');
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
            <div>Email</div>
            <input type="text" style={{width: INPUT_WIDTH}} defaultValue={this.props.email} name="email" ref="email"/>
          </div>

          <div style={{display: this.props.age ? 'none' : 'block'}}>
            <div>Age</div>
            <AgeDropdown age={this.props.age} ref="age"/>
          </div>

          <div>Abusive URL</div>
          <input type="text" readOnly style={{width: INPUT_WIDTH}} defaultValue={this.props.abuseUrl} name="abuse_url"/>

          <div>How does this content violate the <a href="https://code.org/tos" target="_blank">Terms of Service</a>?</div>
          <select style={{width: DROPDOWN_WIDTH}} name="abuse_type" ref="abuseType">
            <option value=""></option>
            <option value="harassment">Threats, cyberbullying, harassement</option>
            <option value="offensive">Offensive content</option>
            <option value="infringement">Copyright infringment</option>
            <option value="other">Other</option>
          </select>

          <div>Please provide as much detail as possible regarding the content you are reporting.</div>
          <textarea style={{width: INPUT_WIDTH, height: 100}} name="abuse_detail" ref="abuseDetail"/>

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
