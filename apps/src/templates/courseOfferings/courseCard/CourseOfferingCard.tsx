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

import CourseOfferingExpandedCard from './courseExpandedCard/CourseOfferingExpandedCard';

import moduleStyles from './courseOfferingCard.module.scss';

interface CourseOfferingCardProps {
  courseOffering: CourseOffering;
  isThisCourseForTeachers?: boolean;
  courseDurationLabel: string;
  actionRowContent?: React.ReactNode;
  defaultImageSrc: string;
  isExpanded?: boolean;
  expandedCardActionRowContent?: React.ReactNode;
  onCloseExpandedCard: () => void;
  relatedProposalsHeader?: string;
  relatedProposalsContent?: React.ReactNode;
}

const CourseOfferingCard: React.FC<CourseOfferingCardProps> = ({
  courseOffering,
  isThisCourseForTeachers = false,
  courseDurationLabel,
  actionRowContent,
  defaultImageSrc,
  isExpanded = false,
  expandedCardActionRowContent,
  onCloseExpandedCard,
  relatedProposalsHeader,
  relatedProposalsContent,
}) => {
  const {
    display_name,
    grade_levels,
    school_subject,
    cs_topic,
    image,
    // TODO: [ACQ-3475]: uncomment this
    // is_translated,
  } = courseOffering;

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

  const translatedGradeRange: [string, string] = useMemo(() => {
    const gradesArray = grade_levels?.split(',') || null;

    if (!gradesArray || gradesArray.length === 0) {
      return ['', ''];
    }

    const translatedGradesString = i18n.gradeRange({
      numGrades: gradesArray.length,
      youngestGrade: gradesArray[0],
      oldestGrade: gradesArray[gradesArray.length - 1],
    });

    const splitTranslatedStringArray = translatedGradesString.split(' ');

    return [splitTranslatedStringArray[0], splitTranslatedStringArray[1]];
  }, [grade_levels]);

  return (
    <div>
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

                {/* TODO: [ACQ-3475] Make this work correctly */}
                {/*{is_translated && (*/}
                {/*  <FontAwesomeV6Icon iconName="language" iconStyle="solid" />*/}
                {/*)}*/}
              </div>
              <Heading4 noMargin className={moduleStyles.courseTitle}>
                {display_name}
              </Heading4>
            </div>
            <div className={moduleStyles.details}>
              {translatedGradeRange[0] && (
                <div>
                  <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
                  <BodyThreeText noMargin>
                    <StrongText noMargin>{translatedGradeRange[0]}</StrongText>{' '}
                    {translatedGradeRange[1]}
                    {isThisCourseForTeachers && '  Teachers'}
                  </BodyThreeText>
                </div>
              )}
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
      {isExpanded && (
        <CourseOfferingExpandedCard
          courseOffering={courseOffering}
          courseDurationLabel={courseDurationLabel}
          translatedGradeRange={translatedGradeRange}
          isThisCourseForTeachers={isThisCourseForTeachers}
          translatedSubjectsAndTopicsTitlesArray={
            translatedSubjectsAndTopicsTitlesArray
          }
          onClose={onCloseExpandedCard}
          actionRowContent={expandedCardActionRowContent}
          relatedProposalsHeader={relatedProposalsHeader}
          relatedProposalsContent={relatedProposalsContent}
        />
      )}
    </div>
  );
};

export default CourseOfferingCard;
