'use client';

import {useEffect, useState} from 'react';

import Image from '@code-dot-org/component-library/image';
import Link from '@code-dot-org/component-library/link';
import {
  BodyThreeText,
  BodyTwoText,
  Heading2,
} from '@code-dot-org/component-library/typography';

import AdoptionMap from '@/components/contentful/corporateSite/adoptionMap';
import SchoolSearchFieldset from '@/components/contentful/corporateSite/schoolSearchFieldset';
import Section from '@/components/contentful/section';
import Spacer from '@/components/contentful/spacer';
import cstaLogo from '@public/images/csta-logo.avif';

import {YOUR_SCHOOL_FORM_ID} from '../constants';
import type {YourSchoolProps, School} from '../types';

import styles from '../yourSchool.module.scss';

interface YourSchoolMapSectionProps
  extends Pick<YourSchoolProps, 'dataSourceURL'> {
  school?: School | null;
  onTakeSurveyClick: (school: School) => void;
}

const YourSchoolMapSection: React.FC<YourSchoolMapSectionProps> = ({
  school = null,
  dataSourceURL,
  onTakeSurveyClick,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(school);

  useEffect(() => {
    setSelectedSchool(school);
  }, []);

  return (
    <Section
      background="secondary"
      id="map"
      className={styles.yourSchoolMapSection}
    >
      <Heading2 className={styles.yourSchoolMapHeading}>
        Does your school teach teach computer science?
      </Heading2>

      <BodyTwoText className={styles.yourSchoolMapParagraph}>
        Find your school on the interactive map below to see if computer science
        was offered during the {new Date().getFullYear() - 2}-
        {new Date().getFullYear() - 1} school year. Then{' '}
        <Link href={`#${YOUR_SCHOOL_FORM_ID}`}>take the survey</Link> to make
        sure your school is accurately represented for{' '}
        {new Date().getFullYear() - 1}-{new Date().getFullYear()}.
      </BodyTwoText>

      <Spacer size="m" />

      <div className={styles.yourSchoolMapContainer}>
        <SchoolSearchFieldset
          className={styles.yourSchoolMapSearchFieldset}
          school={school}
          onSelect={setSelectedSchool}
        />

        <AdoptionMap
          school={selectedSchool}
          onTakeSurveyClick={onTakeSurveyClick}
        />

        <div className={styles.yourSchoolMapSources}>
          <BodyThreeText className={styles.yourSchoolMapData}>
            Learn about the{' '}
            <Link openInNewTab size="s" href={dataSourceURL}>
              data sources we use
            </Link>
          </BodyThreeText>

          <div className={styles.yourSchoolMapPartner}>
            <BodyThreeText className={styles.yourSchoolMapPartnerText}>
              In partnership with
            </BodyThreeText>

            <Image
              src={cstaLogo.src}
              altText="CSTA"
              className={styles.yourSchoolMapPartnerImg}
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default YourSchoolMapSection;
