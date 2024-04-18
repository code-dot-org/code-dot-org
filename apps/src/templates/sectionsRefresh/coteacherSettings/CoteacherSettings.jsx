import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';

import {StrongText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import AddCoteacher from './AddCoteacher';
import CoteacherTable from './CoteacherTable';
import PrimaryTeacher from './PrimaryTeacher';
import RemoveCoteacherDialog from './RemoveCoteacherDialog';

import styles from './coteacher-settings.module.scss';

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
  sectionId,
  sectionInstructors,
  primaryTeacher,
  setCoteachersToAdd,
  coteachersToAdd,
  sectionMetricInformation,
  disabled,
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

  const addSavedCoteacher = useCallback(
    coteacher => {
      setSavedCoteachers(prevSaved => [coteacher, ...prevSaved]);
    },
    [setSavedCoteachers]
  );

  return (
    <div className={styles.expandedSection}>
      {disabled ? i18n.coteacherLtiAddInfo() : i18n.coteacherAddInfo()}
      <PrimaryTeacher
        primaryTeacher={primaryTeacher}
        numCoteachers={coteachers.length}
      />
      <label className={styles.label}>
        <StrongText>{i18n.coteacherLabel()}</StrongText>
      </label>
      <div className={styles.settings}>
        <AddCoteacher
          sectionId={sectionId}
          numCoteachers={coteachers.length}
          coteachersToAdd={coteachersToAdd}
          setCoteachersToAdd={setCoteachersToAdd}
          addSavedCoteacher={addSavedCoteacher}
          addError={addError}
          setAddError={setAddError}
          sectionMetricInformation={sectionMetricInformation}
          disabled={disabled}
        />
        <CoteacherTable
          coteachers={coteachers}
          setCoteacherToRemove={setCoteacherToRemove}
          disabled={disabled}
        />
        <RemoveCoteacherDialog
          coteacherToRemove={coteacherToRemove}
          setCoteacherToRemove={setCoteacherToRemove}
          removeSavedCoteacher={removeSavedCoteacher}
          setCoteachersToAdd={setCoteachersToAdd}
          sectionId={sectionId}
        />
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionId: PropTypes.number,
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  primaryTeacher: PropTypes.object,
  setCoteachersToAdd: PropTypes.func.isRequired,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
  sectionMetricInformation: PropTypes.object,
  disabled: PropTypes.bool,
};
