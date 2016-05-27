/* globals $ */

var msg = require('../locale');

/**
 * A single row in the VersionHistory dialog, describing one version of a project.
 */
var VersionRow = React.createClass({
  propTypes: {
    versionId: React.PropTypes.string.isRequired,
    lastModified: React.PropTypes.instanceOf(Date),
    isLatest: React.PropTypes.bool,
    onChoose: React.PropTypes.func
  },

  getLastModifiedTimestamp: function () {
    var timestamp = this.props.lastModified;
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  },

  render: function () {
    var button;
    if (this.props.isLatest) {
      button = <button className="btn-default" disabled="disabled" style={{cursor: "default"}}>{msg.currentVersion()}</button>;
    } else {
      button = [
        <a key={0} href={location.href + '?version=' + this.props.versionId}
          target="_blank">
          <button className="version-preview"><i className="fa fa-eye"></i></button>
        </a>,
        <button key={1} className="btn-info" onClick={this.props.onChoose}>{msg.restoreThisVersion()}</button>
      ];
    }

    return (
      <tr className="versionRow">
        <td>
          <p>Saved <time className="versionTimestamp" dateTime={this.props.lastModified.toISOString()}>{this.getLastModifiedTimestamp()}</time></p>
          {this.getLastModifiedTimestamp()}
        </td>
        <td width="275" style={{textAlign: 'right'}}>
          {button}
        </td>
      </tr>
    );
  },

  componentDidMount: function () {
    $('.versionTimestamp').timeago();
  }
});
module.exports = VersionRow;
