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
    rowIndex: PropTypes.number.isRequired,
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
    const versionLabelId = `version-history-row-${this.props.rowIndex}-version-label`;
    const restoreButtonId = `version-history-row-${this.props.rowIndex}-restore-button`;
    const viewButtonId = `version-history-row-${this.props.rowIndex}-view-button`;
    const versionLabel = msg.versionHistory_versionLabel({
      timestamp: this.getLastModifiedTimestamp(),
    });
    if (this.props.isLatest) {
      buttons.push(
        <MuiTypography
          key={'latest-version-message'}
          component="span"
          variant="body3"
        >
          {msg.latestVersion()}
        </MuiTypography>
      );
    } else if (!this.props.isReadOnly) {
      const variant = this.props.isSelectedVersion ? 'contained' : 'outlined';
      const color = this.props.isSelectedVersion ? 'primary' : 'tertiary';
      buttons.push(
        <MuiButton
          key={'restore-version-button'}
          id={restoreButtonId}
          type="button"
          color={color}
          size="small"
          variant={variant}
          aria-describedby={versionLabelId}
          onClick={this.props.onChoose}
        >
          {msg.restore()}
        </MuiButton>
      );
    }

    if (!this.props.isSelectedVersion) {
      buttons.push(
        <MuiButton
          key={'not-selected-version-button'}
          id={viewButtonId}
          component="a"
          href={
            location.origin + location.pathname + '?' + this.getQueryParams()
          }
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          size="small"
          variant="contained"
          aria-describedby={versionLabelId}
          className={styles.viewVersionButton}
        >
          {msg.view()}
        </MuiButton>
      );
    } else {
      buttons.push(
        <MuiButton
          key={'disabled-view-button'}
          id={viewButtonId}
          type="button"
          color="primary"
          size="small"
          variant="contained"
          disabled
          aria-describedby={versionLabelId}
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
          <MuiTypography id={versionLabelId} variant="body1">
            {versionLabel}
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
