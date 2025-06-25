'use client';

import {useState} from 'react';

import YourSchoolMapSection from './mapSection';
import type {School} from './types';

import styles from './yourSchool.module.scss';

interface YourSchoolProps {
  dataSourceURL: string;
}

const YourSchool: React.FC<YourSchoolProps> = ({dataSourceURL}) => {
  const [school, setSchool] = useState<School | null>(null);

  return (
    <div className={styles.yourSchool}>
      <YourSchoolMapSection
        school={school}
        dataSourceURL={dataSourceURL}
        onTakeSurveyClick={setSchool}
      />
    </div>
  );
};

export default YourSchool;
