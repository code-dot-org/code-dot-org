import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';

import classNames from 'classnames';
import styles from './coteacher-settings.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function CoteacherTable({coteachers, setCoteacherToRemove}) {
  const pill = (text, className, icon) => (
    <div className={classNames(className, styles.tablePill)}>
      <StrongText>
        <FontAwesome icon={icon} className={styles.tablePillIcon} />
        {text}
      </StrongText>
    </div>
  );

  const statusPill = status => {
    if (!status || status === 'invited') {
      return pill(i18n.coteacherPending(), styles.tablePending, 'ellipsis');
    } else if (status === 'active') {
      return pill(i18n.coteacherAccepted(), styles.tableActive, 'check');
    } else if (status === 'declined') {
      return pill(i18n.coteacherDeclined(), styles.tableDeclined, 'xmark');
    } else {
      return pill(i18n.coteacherError(), styles.tableError, 'xmark');
    }
  };

  const tableRow = (index, coteacher) => {
    return (
      <tr key={index} className={styles.tableRow}>
        <td className={styles.tableInfoCell}>
          <div>
            {coteacher.instructorName ? (
              <>
                <StrongText> {coteacher.instructorName}</StrongText>
                <br />
              </>
            ) : null}

            {coteacher.instructorEmail}
          </div>
        </td>
        <td className={styles.tableStatusCell}>
          {statusPill(coteacher.status)}
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
    <div className={classNames(styles.table, styles.tableRow)}>
      {i18n.coteacherNoCoteachers()}
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
