import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';

/**
 * A single row in the VersionHistory dialog, describing one version of a project.
 */
export default class VersionRow extends React.Component {
  static propTypes = {
    versionId: PropTypes.string.isRequired,
    lastModified: PropTypes.instanceOf(Date).isRequired,
    isLatest: PropTypes.bool,
    onChoose: PropTypes.func
  };

  componentDidMount() {
    $('.versionTimestamp').timeago();
  }

  getLastModifiedTimestamp() {
    const timestamp = this.props.lastModified;
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  }

  render() {
    let button;
    if (this.props.isLatest) {
      button = (
        <button
          className="btn-default"
          disabled="disabled"
          style={{cursor: "default"}}
        >
          {msg.currentVersion()}
        </button>
      );
    } else {
      button = [
        <a
          key={0}
          href={location.origin + location.pathname + '?version=' + this.props.versionId}
          target="_blank"
        >
          <button className="version-preview">
            <i className="fa fa-eye"/>
          </button>
        </a>,
        <button
          key={1}
          className="btn-info"
          onClick={this.props.onChoose}
        >
          {msg.restoreThisVersion()}
        </button>
      ];
    }

    return (
      <tr className="versionRow">
        <td>
          <p>
            Saved <time className="versionTimestamp" dateTime={this.props.lastModified.toISOString()}>{this.getLastModifiedTimestamp()}</time>
          </p>
          {this.getLastModifiedTimestamp()}
        </td>
        <td width="275" style={{textAlign: 'right'}}>
          {button}
        </td>
      </tr>
    );
  }
}
