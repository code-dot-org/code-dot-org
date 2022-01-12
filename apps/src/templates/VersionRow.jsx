import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import classnames from 'classnames';
import {queryParams} from '@cdo/apps/code-studio/utils';
import queryString from 'query-string';

/**
 * A single row in the VersionHistory dialog, describing one version of a project.
 */
export default class VersionRow extends React.Component {
  static propTypes = {
    versionId: PropTypes.string.isRequired,
    lastModified: PropTypes.instanceOf(Date).isRequired,
    isLatest: PropTypes.bool.isRequired,
    isSelectedVersion: PropTypes.bool.isRequired,
    isReadOnly: PropTypes.bool.isRequired,
    onChoose: PropTypes.func
  };

  getLastModifiedTimestamp() {
    const timestamp = this.props.lastModified;
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  }

  getUrlAttributes() {
    const userId = queryParams('user_id');
    const viewAs = queryParams('viewAs');
    const params = {};
    if (viewAs) {
      params.viewAs = viewAs;
    }
    if (userId) {
      params.user_id = userId;
    }
    if (!this.props.isLatest) {
      params.version = this.props.versionId;
    }
    return queryString.stringify(params);
  }

  render() {
    let buttons = [];
    if (this.props.isLatest) {
      buttons.push(
        <div
          key={'latest-version-message'}
          style={{marginRight: '20px', fontSize: 18}}
        >
          {msg.latestVersion()}
        </div>
      );
    } else if (!this.props.isReadOnly) {
      buttons.push(
        <button
          key={'restore-version-button'}
          type="button"
          className="btn-info"
          onClick={this.props.onChoose}
        >
          {msg.restoreThisVersion()}
        </button>
      );
    }

    if (!this.props.isSelectedVersion) {
      buttons.push(
        <a
          key={'not-selected-version-button'}
          href={
            location.origin + location.pathname + '?' + this.getUrlAttributes()
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
        className={classnames({
          versionRow: true,
          highlight: this.props.isSelectedVersion
        })}
      >
        <td>
          <p>
            {msg.versionHistory_versionLabel({
              timestamp: this.getLastModifiedTimestamp()
            })}
          </p>
        </td>
        <td width="275" height="52" style={{textAlign: 'right'}}>
          {buttons}
        </td>
      </tr>
    );
  }
}
