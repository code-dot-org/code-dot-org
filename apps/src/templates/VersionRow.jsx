import {
  Button as MuiButton,
  Stack as MuiStack,
  Typography as MuiTypography,
} from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import msg from '@cdo/locale';

import styles from './versionHistory.module.scss';

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
        <MuiTypography
          key={'latest-version-message'}
          component="span"
          variant="body2"
        >
          {msg.latestVersion()}
        </MuiTypography>
      );
    } else if (!this.props.isReadOnly) {
      const variant = this.props.isSelectedVersion ? 'contained' : 'outlined';
      buttons.push(
        <MuiButton
          key={'restore-version-button'}
          type="button"
          color="primary"
          variant={variant}
          onClick={this.props.onChoose}
        >
          {msg.restore()}
        </MuiButton>
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
          <MuiButton type="button" color="primary" variant="contained">
            {msg.view()}
          </MuiButton>
        </a>
      );
    } else {
      buttons.push(
        <MuiButton
          key={'disabled-view-button'}
          type="button"
          color="secondary"
          variant="contained"
          disabled
          className={styles.disabledViewButton}
        >
          {msg.view()}
        </MuiButton>
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
          <MuiTypography variant="body1">
            {msg.versionHistory_versionLabel({
              timestamp: this.getLastModifiedTimestamp(),
            })}
          </MuiTypography>
        </td>
        <td width="275" height="52" className={styles.actionCell}>
          <MuiStack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            alignItems="center"
            useFlexGap
          >
            {buttons}
          </MuiStack>
        </td>
      </tr>
    );
  }
}
