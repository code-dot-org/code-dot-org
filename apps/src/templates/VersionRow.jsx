import classnames from 'classnames';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import msg from '@cdo/locale';

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
    onChoose: PropTypes.func,
  };

  getLastModifiedTimestamp() {
    const timestamp = this.props.lastModified;
    if (timestamp.toLocaleString) {
      return timestamp.toLocaleString();
    }
    return timestamp.toString();
  }

  getQueryParams() {
    const userId = queryParams('user_id');
    const viewAs = queryParams('viewAs');
    const sectionId = queryParams('section_id');
    const params = {};
    if (sectionId) {
      params.section_id = sectionId;
    }
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
        <button
          key={'latest-version-message'}
          type="button"
          className="btn-default"
          disabled="disabled"
          style={{cursor: 'default', background: 'none', border: 'none'}}
        >
          {msg.latestVersion()}
        </button>
      );
    } else if (!this.props.isReadOnly) {
      const className = this.props.isSelectedVersion
        ? 'btn-info'
        : 'img-upload';
      buttons.push(
        <button
          key={'restore-version-button'}
          type="button"
          className={className}
          onClick={this.props.onChoose}
        >
          {msg.restore()}
        </button>
      );
    }

    if (!this.props.isSelectedVersion) {
      buttons.push(
        <a
          key={'not-selected-version-button'}
          href={
            location.origin + location.pathname + '?' + this.getQueryParams()
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button" className="btn-info">
            {msg.view()}
          </button>
        </a>
      );
    } else {
      buttons.push(
        <button
          key={'disabled-view-button'}
          type="button"
          className="btn-default"
          disabled="disabled"
          style={{cursor: 'default', color: 'white'}}
        >
          {msg.view()}
        </button>
      );
    }

    return (
      <tr
        className={classnames({
          versionRow: true,
          highlight: this.props.isSelectedVersion,
        })}
      >
        <td>
          <p>
            {msg.versionHistory_versionLabel({
              timestamp: this.getLastModifiedTimestamp(),
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
