import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Typography,
  IconButton as MuiIconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';

const getPendingPill = () => {
  return (
    // The bubble's text metrics, colors and max-width come from the theme's
    // MuiTooltip override, so the trigger passes only the text and placement.
    // `placement` is explicit because the theme's default is `bottom` and this
    // call site sat above the pill under react-tooltip.
    <MuiTooltip title={i18n.coteacherPendingTooltip()} placement="top">
      {/* Hover/touch only, as before: the pill is a status, not a control, so
          it takes no tab stop and the theme's describeChild wiring has nothing
          to announce to a keyboard user. react-tooltip asked for `focus` here
          too, but a bare div never receives it, so nothing changes.
          Making the hint keyboard-reachable means giving the pill a real
          interactive trigger -- see the InfoTooltipIcon button pattern. */}
      <div className={classNames(styles.tablePending, styles.tablePill)}>
        <Typography variant="strong">
          <FontAwesomeV6Icon
            iconName={'ellipsis'}
            className={styles.tablePillIcon}
          />
          {i18n.coteacherPending()}
        </Typography>
      </div>
    </MuiTooltip>
  );
};

const getStatusPill = status => {
  if (!status) {
    return getPendingPill();
  }
  switch (status) {
    case 'invited':
      return getPendingPill();
    case 'active':
      return (
        <div className={classNames(styles.tableActive, styles.tablePill)}>
          <Typography variant="strong">
            <FontAwesomeV6Icon
              iconName={'check'}
              className={styles.tablePillIcon}
            />
            {i18n.coteacherAccepted()}
          </Typography>
        </div>
      );
    case 'declined':
      return (
        <div className={classNames(styles.tableDeclined, styles.tablePill)}>
          <Typography variant="strong">
            <FontAwesomeV6Icon
              iconName={'xmark'}
              className={styles.tablePillIcon}
            />
            {i18n.coteacherDeclined()}
          </Typography>
        </div>
      );
    default:
      return (
        <div className={classNames(styles.tableError, styles.tablePill)}>
          <Typography variant="strong">
            <FontAwesomeV6Icon
              iconName={'xmark'}
              className={styles.tablePillIcon}
            />
            {i18n.coteacherError()}
          </Typography>
        </div>
      );
  }
};

export default function CoteacherTable({
  coteachers,
  setCoteacherToRemove,
  disabled,
}) {
  const tableRow = (index, coteacher) => {
    return (
      <tr key={index} className={styles.tableRow}>
        <td className={styles.tableInfoCell}>
          <div>
            {coteacher.instructorName && (
              <>
                <Typography variant="strong">
                  {' '}
                  {coteacher.instructorName}
                </Typography>
                <br />
              </>
            )}

            <Typography variant="body2">{coteacher.instructorEmail}</Typography>
          </div>
        </td>
        <td className={styles.tableStatusCell}>
          {getStatusPill(coteacher.status)}
        </td>
        {!disabled && (
          <td>
            <MuiIconButton
              type="button"
              variant="text"
              color="error"
              onClick={() => setCoteacherToRemove(coteacher)}
              className={styles.tableRemoveButton}
              aria-label={i18n.coteacherRemoveDialogHeader({
                email: coteacher.instructorEmail,
              })}
            >
              <FontAwesomeV6Icon iconName="trash" />
            </MuiIconButton>
          </td>
        )}
      </tr>
    );
  };

  return coteachers.length === 0 ? (
    <div className={styles.table}>
      <div className={styles.tableRow}>
        <Typography variant="body2">{i18n.coteacherNoCoteachers()}</Typography>
      </div>
    </div>
  ) : (
    <table className={styles.table}>
      <tbody>
        {coteachers.map((instructor, id) => tableRow(id, instructor))}
      </tbody>
    </table>
  );
}

CoteacherTable.propTypes = {
  coteachers: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCoteacherToRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
