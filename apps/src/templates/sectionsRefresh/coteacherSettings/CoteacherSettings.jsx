import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import i18n from '@cdo/locale';

import styles from './coteacher-settings.module.scss';
import AddCoteacher from './AddCoteacher';
import CoteacherTable from './CoteacherTable';
import RemoveCoteacherDialog from './RemoveCoteacherDialog';

const statusSortValue = coteacher => {
  switch (coteacher.status) {
    case 'invited':
      return 0;
    case 'declined':
      return 1;
    case 'active':
      return 2;
    default:
      return 3;
  }
};

const getInitialCoteachers = (sectionInstructors, primaryTeacher) => {
  if (!sectionInstructors) {
    return [];
  }
  if (!primaryTeacher) {
    return sectionInstructors;
  }
  return sectionInstructors.filter(
    instructor => instructor.instructorEmail !== primaryTeacher.email
  );
};

export default function CoteacherSettings({
  sectionInstructors,
  primaryTeacher,
  setCoteachersToAdd,
  coteachersToAdd,
}) {
  const [addError, setAddError] = useState('');
  const [coteacherToRemove, setCoteacherToRemove] = useState(null);
  const [savedCoteachers, setSavedCoteachers] = useState(
    getInitialCoteachers(sectionInstructors, primaryTeacher)
  );

  const coteachers = useMemo(() => {
    const unsaved = coteachersToAdd.map(email => ({instructorEmail: email}));

    const sortedSaved = savedCoteachers.sort(
      (a, b) => statusSortValue(a) - statusSortValue(b)
    );
    return [...unsaved, ...sortedSaved];
  }, [savedCoteachers, coteachersToAdd]);

  const removeSavedCoteacher = useCallback(
    id => {
      setSavedCoteachers(prevSaved =>
        prevSaved.filter(coteacher => coteacher.id !== id)
      );
    },
    [setSavedCoteachers]
  );

  return (
    <div className={styles.expandedSection}>
      {i18n.coteacherAddInfo()}
      <div className={styles.settings}>
        <AddCoteacher
          coteachers={coteachers}
          setCoteachersToAdd={setCoteachersToAdd}
          addError={addError}
          setAddError={setAddError}
        />
        <CoteacherTable
          coteachers={coteachers}
          setCoteacherToRemove={setCoteacherToRemove}
        />
        <RemoveCoteacherDialog
          coteacherToRemove={coteacherToRemove}
          setCoteacherToRemove={setCoteacherToRemove}
          removeSavedCoteacher={removeSavedCoteacher}
          setCoteachersToAdd={setCoteachersToAdd}
        />
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  primaryTeacher: PropTypes.object,
  setCoteachersToAdd: PropTypes.func.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
