import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';

const getPendingPill = () => {
  return (
    <span>
      <div
        className={classNames(styles.tablePending, styles.tablePill)}
        data-tip
        data-event="mouseenter focus"
        data-event-off="mouseleave blur"
        data-for={'pending-tooltip'}
      >
        <Typography variant="strong">
          <FontAwesomeV6Icon
            iconName={'ellipsis'}
            className={styles.tablePillIcon}
          />
          {i18n.coteacherPending()}
        </Typography>
      </div>
      <ReactTooltip
        id={'pending-tooltip'}
        role="tooltip"
        effect="solid"
        place="top"
        className={styles.tableToolTipText}
      >
        <Typography variant="body3" component="span">
          {i18n.coteacherPendingTooltip()}
        </Typography>
      </ReactTooltip>
    </span>
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
      <div className={styles.tableRow}>{i18n.coteacherNoCoteachers()}</div>
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
