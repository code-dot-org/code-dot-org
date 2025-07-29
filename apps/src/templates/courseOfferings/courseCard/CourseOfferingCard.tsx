import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Image from '@code-dot-org/component-library/image';
import Tags, {TagProps} from '@code-dot-org/component-library/tags';
import {
  Heading4,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {concat, intersection} from 'lodash';
import React, {useMemo} from 'react';

import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import {
  subjectsAndTopicsOrder,
  translatedLabels,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import i18n from '@cdo/locale';

import moduleStyles from './courseOfferingCard.module.scss';

interface CourseOfferingCardProps extends CourseOffering {
  isThisCourseForTeachers?: boolean;
  courseDurationLabel: string;
  actionRowContent?: React.ReactNode;
  defaultImageSrc: string;
}

const CourseOfferingCard: React.FC<CourseOfferingCardProps> = ({
  display_name,
  grade_levels,
  image,
  is_translated,
  cs_topic,
  school_subject,
  isThisCourseForTeachers,
  courseDurationLabel,
  actionRowContent,
  defaultImageSrc,
}) => {
  const translatedSubjectsAndTopicsTitlesArray = useMemo(() => {
    const keys = intersection(
      subjectsAndTopicsOrder,
      concat(school_subject?.split(','), cs_topic?.split(','))
    ).filter((key): key is keyof typeof translatedLabels => {
      const isInTranslatedLabels = key !== undefined && key in translatedLabels;
      if (!isInTranslatedLabels) {
        console.warn(
          'Course subject or topic not found in translated labels:',
          key,
          "It won't be displayed."
        );
      }

      return isInTranslatedLabels;
    });

    return keys.map(key => translatedLabels[key]);
  }, [cs_topic, school_subject]);

  const courseSubjectsAndTopicsTagsList: TagProps[] = useMemo(() => {
    const tagsList = [];

    const firstSubjectOrTopic = translatedSubjectsAndTopicsTitlesArray[0];
    tagsList.push({
      label: firstSubjectOrTopic,
      tooltipContent: firstSubjectOrTopic,
      tooltipId: `${display_name}-course-first-label-tooltip`,
    });

    if (translatedSubjectsAndTopicsTitlesArray.length > 1) {
      const remainingSubjectsAndTopics =
        translatedSubjectsAndTopicsTitlesArray.slice(1);
      const tooltipContent = <>{remainingSubjectsAndTopics.join(', ')}</>;
      tagsList.push({
        label: `+${remainingSubjectsAndTopics.length}`,
        tooltipContent,
        'aria-label': remainingSubjectsAndTopics.join(', '),
        tooltipId: `${display_name}remaining-subjects-topics-tooltip`,
      });
    }

    return tagsList;
  }, [display_name, translatedSubjectsAndTopicsTitlesArray]);

  const translatedGradeRange = useMemo(() => {
    const gradesArray = grade_levels?.split(',') || [];

    const translatedGradesString = i18n.gradeRange({
      numGrades: gradesArray.length,
      youngestGrade: gradesArray[0],
      oldestGrade: gradesArray[gradesArray.length - 1],
    });

    const splitTranslatedStringArray = translatedGradesString.split(' ');

    return [splitTranslatedStringArray[0], splitTranslatedStringArray[1]];
  }, [grade_levels]);

  return (
    <div className={moduleStyles.courseOfferingCardContainer}>
      <Image
        className={moduleStyles.courseOfferingCardImage}
        src={image || defaultImageSrc}
      />
      <div className={moduleStyles.mainContent}>
        <div className={moduleStyles.textContent}>
          <div className={moduleStyles.header}>
            <div className={moduleStyles.topicWrapper}>
              {translatedSubjectsAndTopicsTitlesArray.length > 0 && (
                <Tags size="s" tagsList={courseSubjectsAndTopicsTagsList} />
              )}

              {is_translated && (
                <FontAwesomeV6Icon iconName="language" iconStyle="solid" />
              )}
            </div>
            <Heading4 noMargin className={moduleStyles.courseTitle}>
              {display_name}
            </Heading4>
          </div>
          <div className={moduleStyles.details}>
            <div>
              <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
              <BodyThreeText noMargin>
                <StrongText noMargin>{translatedGradeRange[0]}</StrongText>{' '}
                {translatedGradeRange[1]}
                {isThisCourseForTeachers && '  Teachers'}
              </BodyThreeText>
            </div>
            <div>
              <FontAwesomeV6Icon iconName="clock" iconStyle="solid" />
              <BodyThreeText noMargin>
                <StrongText noMargin>{i18n.duration()}:</StrongText>{' '}
                {courseDurationLabel}
              </BodyThreeText>
            </div>
          </div>
        </div>
        {actionRowContent && (
          <div className={moduleStyles.actionRow}>{actionRowContent}</div>
        )}
      </div>
    </div>
  );
};

export default CourseOfferingCard;
