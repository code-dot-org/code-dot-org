import {useMemo} from 'react';

import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Heading4,
  BodyFourText,
} from '@code-dot-org/component-library/typography';

import type {School} from '../types';

import YourSchoolMapPoint, {MAP_POINT_TYPES} from './YourSchoolMapPoint';

import styles from '@/components/contentful/yourSchool/yourSchool.module.scss';

interface YourSchoolInfoProps {
  school: School;
  onTakeSurveyClick: (school: School) => void;
}

const YourSchoolInfo: React.FC<YourSchoolInfoProps> = ({
  school,
  onTakeSurveyClick,
}) => {
  const legend = useMemo(() => {
    switch (school.teachesCs) {
      case 'YES':
      case 'Y':
        return [
          <YourSchoolMapPoint
            key={MAP_POINT_TYPES.HAS_CS}
            type={MAP_POINT_TYPES.HAS_CS}
          />,
          'We believe this school offers Computer Science',
        ];
      case 'NO':
      case 'N':
        return [
          <YourSchoolMapPoint
            key={MAP_POINT_TYPES.NO_CS}
            type={MAP_POINT_TYPES.NO_CS}
          />,
          'We believe this school offers no Computer Science opportunities',
        ];
      case 'HISTORICAL_YES':
      case 'HY':
        return [
          <YourSchoolMapPoint
            key={MAP_POINT_TYPES.HAS_CS}
            type={MAP_POINT_TYPES.HAS_CS}
          />,
          'We believe this school historically offered Computer Science',
        ];
      case 'HISTORICAL_NO':
      case 'HN':
        return [
          <YourSchoolMapPoint
            key={MAP_POINT_TYPES.NO_CS}
            type={MAP_POINT_TYPES.NO_CS}
          />,
          'We believe this school historically offered no Computer Science opportunities',
        ];
      default:
        return [
          <YourSchoolMapPoint
            key={MAP_POINT_TYPES.NO_DATA}
            type={MAP_POINT_TYPES.NO_DATA}
          />,
          'We need data for this school',
        ];
    }
  }, [school.teachesCs]);

  return (
    <div className={styles.yourSchoolMapCard}>
      <Heading4
        visualAppearance="heading-xs"
        className={styles.yourSchoolMapCardHeading}
      >
        {school.name}
      </Heading4>

      {(school.city || school.state) && (
        <div className={styles.yourSchoolMapCardLocation}>
          <FontAwesomeV6Icon iconName="location-dot" />
          <BodyFourText className={styles.yourSchoolMapCardLocationText}>
            {[school.city, school.state].filter(Boolean).join(', ')}
          </BodyFourText>
        </div>
      )}

      <BodyFourText className={styles.yourSchoolMapCardLegend}>
        {legend}
      </BodyFourText>

      <Button
        size="s"
        text="Take the survey"
        className={styles.yourSchoolMapCardButton}
        onClick={() => onTakeSurveyClick(school)}
      />
    </div>
  );
};

export default YourSchoolInfo;
