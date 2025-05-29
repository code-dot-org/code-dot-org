import Button from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {
  BodyTwoText,
  Heading2,
} from '@code-dot-org/component-library/typography';
import Drawer from '@mui/material/Drawer';
import React from 'react';

import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import SchoolDataInputs from '../../SchoolDataInputs';

import styles from './teacherHomepage.module.scss';

export const TeacherHomepageDrawer: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const usIp = useAppSelector(state => state.currentUser.inUSA);
  const existingSchoolInfo = useAppSelector(
    state => state.currentUser.userSchoolInfo
  );
  const schoolInfo = useSchoolInfo({
    usIp,
    country: existingSchoolInfo?.country,
    schoolName: existingSchoolInfo?.schoolName,
    schoolId: existingSchoolInfo?.schoolId,
    schoolZip: existingSchoolInfo?.schoolZip,
    schoolType: existingSchoolInfo?.schoolType,
  });
  return (
    <Drawer
      className={styles.drawer}
      anchor={'bottom'}
      open={open}
      onClose={() => setOpen(false)}
      variant={'persistent'}
    >
      <div className={styles.toolbar}>
        <CloseButton
          aria-label={''}
          onClick={() => setOpen(false)}
          color={'light'}
          size="l"
          className={''}
        />
      </div>
      <Heading2>{i18n.censusHeading()}</Heading2>
      <BodyTwoText>{i18n.schoolInfoInterstitialTitle()}</BodyTwoText>
      <div className={styles.drawerContent}>
        <SchoolDataInputs {...schoolInfo} includeHeaders={false} />
      </div>
      <div className={styles.drawerFooter}>
        <Button
          type={'secondary'}
          size={'m'}
          color={'gray'}
          text={i18n.cancel()}
          onClick={() => setOpen(false)}
        />

        <Button
          type={'primary'}
          size={'m'}
          text={i18n.save()}
          onClick={() => setOpen(false)}
        />
      </div>
    </Drawer>
  );
};

export default TeacherHomepageDrawer;
