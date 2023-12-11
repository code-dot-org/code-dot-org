import PropTypes from 'prop-types';
import React, {useState} from 'react';
import styles from './coteacher-settings.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

export default function PrimaryTeacher({primaryTeacher, numCoteachers}) {
  // We explicitely only want to show this component if there are coteachers on initial load.
  // This is so that we the UI doesn't jump around if there are no coteachers and we add one.
  const [coteachersExist] = useState(numCoteachers > 0);

  const shouldDisplayTeacher = React.useMemo(
    () => coteachersExist && !!primaryTeacher,
    [coteachersExist, primaryTeacher]
  );

  console.log('lfm1', shouldDisplayTeacher, coteachersExist);

  return shouldDisplayTeacher ? (
    <div>
      <label className={styles.label}>
        <StrongText>{i18n.coteacherPrimaryTeacher()}</StrongText>
      </label>
      <div className={styles.primaryTeacher}>
        <StrongText>{primaryTeacher.name}</StrongText>
        <br />
        {primaryTeacher.email}
      </div>
    </div>
  ) : null;
}

PrimaryTeacher.propTypes = {
  primaryTeacher: PropTypes.object,
  numCoteachers: PropTypes.number.isRequired,
};
