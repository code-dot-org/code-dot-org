import {Button, LinkButton} from '@code-dot-org/component-library/button';
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
        <Button
          key="latest-version-message"
          color="black"
          type="tertiary"
          onClick={() => {}}
          text={msg.latestVersion()}
        />
      );
    } else if (!this.props.isReadOnly) {
      buttons.push(
        <Button
          key="restore-version-button"
          color="black"
          type="secondary"
          onClick={this.props.onChoose}
          className="version-restore"
          text={msg.restore()}
        />
      );
    }

    buttons.push(
      <LinkButton
        key={
          this.props.isSelectedVersion
            ? 'disabled-view-button'
            : 'not-selected-version-button'
        }
        color="purple"
        disabled={this.props.isSelectedVersion}
        href={location.origin + location.pathname + '?' + this.getQueryParams()}
        text={msg.view()}
        target="_blank"
      />
    );

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
        <td
          width="275"
          style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}
        >
          {buttons}
        </td>
      </tr>
    );
  }
}
