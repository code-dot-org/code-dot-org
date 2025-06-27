import {useMemo} from 'react';

import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Heading4,
  BodyFourText,
} from '@code-dot-org/component-library/typography';

import AdoptionMapPoint, {MAP_POINT_TYPES} from './AdoptionMapPoint';
import type {School} from './types';

import styles from './adoptionMap.module.scss';

interface AdoptionMapInfoProps {
  school: School;
  onTakeSurveyClick?: (school: School) => void;
}

const AdoptionMapInfo: React.FC<AdoptionMapInfoProps> = ({
  school,
  onTakeSurveyClick,
}) => {
  const legend = useMemo(() => {
    switch (school.teachesCs) {
      case 'YES':
      case 'Y':
        return [
          <AdoptionMapPoint
            key={MAP_POINT_TYPES.HAS_CS}
            type={MAP_POINT_TYPES.HAS_CS}
          />,
          'We believe this school offers Computer Science',
        ];
      case 'NO':
      case 'N':
        return [
          <AdoptionMapPoint
            key={MAP_POINT_TYPES.NO_CS}
            type={MAP_POINT_TYPES.NO_CS}
          />,
          'We believe this school offers no Computer Science opportunities',
        ];
      case 'HISTORICAL_YES':
      case 'HY':
        return [
          <AdoptionMapPoint
            key={MAP_POINT_TYPES.HAS_CS}
            type={MAP_POINT_TYPES.HAS_CS}
          />,
          'We believe this school historically offered Computer Science',
        ];
      case 'HISTORICAL_NO':
      case 'HN':
        return [
          <AdoptionMapPoint
            key={MAP_POINT_TYPES.NO_CS}
            type={MAP_POINT_TYPES.NO_CS}
          />,
          'We believe this school historically offered no Computer Science opportunities',
        ];
      default:
        return [
          <AdoptionMapPoint
            key={MAP_POINT_TYPES.NO_DATA}
            type={MAP_POINT_TYPES.NO_DATA}
          />,
          'We need data for this school',
        ];
    }
  }, [school.teachesCs]);

  return (
    <div className={styles.adoptionMapSchool}>
      <Heading4
        visualAppearance="heading-xs"
        className={styles.adoptionMapSchoolHeading}
      >
        {school.name}
      </Heading4>

      {(school.city || school.state) && (
        <div className={styles.adoptionMapSchoolLocation}>
          <FontAwesomeV6Icon iconName="location-dot" />
          <BodyFourText className={styles.adoptionMapSchoolLocationText}>
            {[school.city, school.state].filter(Boolean).join(', ')}
          </BodyFourText>
        </div>
      )}

      <BodyFourText className={styles.adoptionMapSchoolLegend}>
        {legend}
      </BodyFourText>

      {onTakeSurveyClick && (
        <Button
          size="s"
          text="Take the survey"
          className={styles.adoptionMapSchoolButton}
          onClick={() => onTakeSurveyClick(school)}
        />
      )}
    </div>
  );
};

export default AdoptionMapInfo;
