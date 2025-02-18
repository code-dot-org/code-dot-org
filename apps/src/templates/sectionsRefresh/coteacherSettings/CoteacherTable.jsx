import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import {StrongText, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
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
        <StrongText>
          <FontAwesome icon={'ellipsis'} className={styles.tablePillIcon} />
          {i18n.coteacherPending()}
        </StrongText>
      </div>
      <ReactTooltip
        id={'pending-tooltip'}
        role="tooltip"
        effect="solid"
        place="top"
      >
        <BodyTwoText className={styles.tableToolTipText}>
          {i18n.coteacherPendingTooltip()}
        </BodyTwoText>
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
          <StrongText>
            <FontAwesome icon={'check'} className={styles.tablePillIcon} />
            {i18n.coteacherAccepted()}
          </StrongText>
        </div>
      );
    case 'declined':
      return (
        <div className={classNames(styles.tableDeclined, styles.tablePill)}>
          <StrongText>
            <FontAwesome icon={'xmark'} className={styles.tablePillIcon} />
            {i18n.coteacherDeclined()}
          </StrongText>
        </div>
      );
    default:
      return (
        <div className={classNames(styles.tableError, styles.tablePill)}>
          <StrongText>
            <FontAwesome icon={'xmark'} className={styles.tablePillIcon} />
            {i18n.coteacherError()}
          </StrongText>
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
                <StrongText> {coteacher.instructorName}</StrongText>
                <br />
              </>
            )}

            {coteacher.instructorEmail}
          </div>
        </td>
        <td className={styles.tableStatusCell}>
          {getStatusPill(coteacher.status)}
        </td>
        {!disabled && (
          <td>
            <button
              type="button"
              onClick={() => setCoteacherToRemove(coteacher)}
              className={styles.tableRemoveButton}
            >
              <i
                className={classNames('fa-solid fa-trash', styles.trashIcon)}
              />
            </button>
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
