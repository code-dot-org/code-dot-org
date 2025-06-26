'use client';

import {useState} from 'react';

import {YOUR_SCHOOL_FORM_ID} from './constants';
import YourSchoolFormSection from './formSection';
import YourSchoolMapSection from './mapSection';
import type {YourSchoolProps, School} from './types';

import styles from './yourSchool.module.scss';

const YourSchool: React.FC<YourSchoolProps> = ({
  dataSourceURL,
  regionalPartnerURL,
  privacyPolicyURL,
}) => {
  const [school, setSchool] = useState<School | null>(null);

  return (
    <div className={styles.yourSchool}>
      <YourSchoolMapSection
        school={school}
        dataSourceURL={dataSourceURL}
        onTakeSurveyClick={selectedSchool => {
          setSchool(selectedSchool);
          document.getElementById(YOUR_SCHOOL_FORM_ID)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }}
      />

      <YourSchoolFormSection
        regionalPartnerURL={regionalPartnerURL}
        privacyPolicyURL={privacyPolicyURL}
        school={school}
      />
    </div>
  );
};

export default YourSchool;
