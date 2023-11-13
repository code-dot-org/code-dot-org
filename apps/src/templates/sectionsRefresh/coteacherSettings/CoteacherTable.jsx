import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';

import classNames from 'classnames';
import styles from './coteacher-settings.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

const getPill = (text, className, icon) => (
  <div className={classNames(className, styles.tablePill)}>
    <StrongText>
      <FontAwesome icon={icon} className={styles.tablePillIcon} />
      {text}
    </StrongText>
  </div>
);

const getStatusPill = status => {
  if (!status) {
    return getPill(i18n.coteacherPending(), styles.tablePending, 'ellipsis');
  }
  switch (status) {
    case 'invited':
      return getPill(i18n.coteacherPending(), styles.tablePending, 'ellipsis');
    case 'active':
      return getPill(i18n.coteacherAccepted(), styles.tableActive, 'check');
    case 'declined':
      return getPill(i18n.coteacherDeclined(), styles.tableDeclined, 'xmark');
    default:
      return getPill(i18n.coteacherError(), styles.tableError, 'xmark');
  }
};

export default function CoteacherTable({coteachers, setCoteacherToRemove}) {
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
        <td>
          <button
            type="button"
            onClick={() => setCoteacherToRemove(coteacher)}
            className={styles.tableRemoveButton}
          >
            <i className={classNames('fa-solid fa-trash', styles.trashIcon)} />
          </button>
        </td>
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
};
