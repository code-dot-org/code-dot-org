var React = require('react');

/**
 * A single row in the VersionHistory modal, describing one version of a project.
 */
module.exports = React.createClass({
  propTypes: {
    lastModified: React.PropTypes.instanceOf(Date),
    onChoose: React.PropTypes.func
  },

  getTimestamp: function () {
    var timestamp = this.props.lastModified;
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  },

  render: function () {

    return (
      <tr className="versionRow">
        <td>
          {this.getTimestamp()}
          <p>Saved <time className="versionTimestamp" dateTime={this.props.lastModified.toISOString()}>{this.getTimestamp()}</time></p>
        </td>
        <td width="250" style={{textAlign: 'right'}}>
          <button className="btn-info" onClick={this.props.onChoose}>
            Restore this Version
          </button>
        </td>
      </tr>
    );
  },

  componentDidMount: function () {
    $('.versionTimestamp').timeago();
  }
});
