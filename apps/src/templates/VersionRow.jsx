import $ from 'jquery';
import React, {PropTypes} from 'react';
var msg = require('@cdo/locale');

/**
 * A single row in the VersionHistory dialog, describing one version of a project.
 */
var VersionRow = React.createClass({
  propTypes: {
    versionId: PropTypes.string.isRequired,
    lastModified: PropTypes.instanceOf(Date),
    isLatest: PropTypes.bool,
    onChoose: PropTypes.func
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
        <a
          key={0}
          href={location.origin + location.pathname + '?version=' + this.props.versionId}
          target="_blank"
        >
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
