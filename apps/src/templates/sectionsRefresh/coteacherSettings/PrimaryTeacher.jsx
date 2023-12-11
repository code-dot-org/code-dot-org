import PropTypes from 'prop-types';
import React, {useState} from 'react';
import styles from './coteacher-settings.module.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

export default function PrimaryTeacher({primaryTeacher, coteachersExist}) {
  // We explicitely only want to show this component if there are coteachers on initial load.
  // This is so that we the UI doesn't jump around if there are no coteachers and we add one.
  const shouldDisplayPrimaryTeacher = useState(coteachersExist);

  const shouldDisplayTeacher = React.useMemo(
    () => !shouldDisplayPrimaryTeacher || !primaryTeacher,
    [shouldDisplayPrimaryTeacher, primaryTeacher]
  );

  return shouldDisplayTeacher ? null : (
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
  );
}

PrimaryTeacher.propTypes = {
  primaryTeacher: PropTypes.object,
  coteachersExist: PropTypes.bool.isRequired,
};
