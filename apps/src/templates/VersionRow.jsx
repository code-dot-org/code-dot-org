/* globals $ */


/**
 * A single row in the VersionHistory dialog, describing one version of a project.
 */
var VersionRow = React.createClass({
  propTypes: {
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
      button = <button className="btn-default" disabled="disabled" style={{cursor: "default"}}>Current Version</button>;
    } else {
      button = <button className="btn-info" onClick={this.props.onChoose}>
        Restore this Version
      </button>;
    }

    return (
      <tr className="versionRow">
        <td>
          <p>Saved <time className="versionTimestamp" dateTime={this.props.lastModified.toISOString()}>{this.getLastModifiedTimestamp()}</time></p>
          {this.getLastModifiedTimestamp()}
        </td>
        <td width="250" style={{textAlign: 'right'}}>
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
