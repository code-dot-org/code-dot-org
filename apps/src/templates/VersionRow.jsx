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
    isActive: PropTypes.bool,
    onChoose: PropTypes.func
  };

  getLastModifiedTimestamp() {
    const timestamp = this.props.lastModified;
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  }

  render() {
    let buttons = [];
    if (this.props.isLatest) {
      buttons.push(
        <button
          key={buttons.length}
          type="button"
          className="btn-default"
          disabled="disabled"
          style={{cursor: 'default'}}
        >
          {msg.currentVersion()}
        </button>
      );
    } else {
      buttons.push(
        <button
          key={buttons.length}
          type="button"
          className="btn-info"
          onClick={this.props.onChoose}
        >
          {msg.restoreThisVersion()}
        </button>
      );
    }

    if (!this.props.isActive) {
      buttons.push(
        <a
          key={buttons.length}
          href={
            location.origin +
            location.pathname +
            (this.props.isLatest ? '' : '?version=' + this.props.versionId)
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="version-preview">
            <i className="fa fa-eye" />
          </button>
        </a>
      );
    }

    return (
      <tr
        className={[
          'versionRow',
          this.props.isActive ? 'activeVersion' : ''
        ].join(' ')}
      >
        <td>
          <p>
            {msg.versionHistory_versionLabel({
              timestamp: this.getLastModifiedTimestamp()
            })}
          </p>
        </td>
        <td width="275" style={{textAlign: 'right'}}>
          {buttons}
        </td>
      </tr>
    );
  }
}
