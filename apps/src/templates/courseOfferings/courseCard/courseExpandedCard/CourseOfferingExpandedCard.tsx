import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Image from '@code-dot-org/component-library/image';
import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import React from 'react';

import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import i18n from '@cdo/locale';

import moduleStyles from './courseOfferingExpandedCard.module.scss';

interface CourseOfferingExpandedCardProps {
  courseOffering: CourseOffering;
  getRelatedCurriculums: (course: CourseOffering) => CourseOffering[];
  onClose: () => void;
  actionRowContent?: React.ReactNode;
  translatedGradeRange: [string, string];
  courseDurationLabel: string;
  isThisCourseForTeachers: boolean;
  translatedSubjectsAndTopicsTitlesArray: string[];
  relatedProposalsHeader?: string;
  relatedProposalsContent?: React.ReactNode;
}
const CourseOfferingExpandedCard: React.FunctionComponent<
  CourseOfferingExpandedCardProps
> = ({
  courseOffering,
  getRelatedCurriculums,
  onClose,
  actionRowContent,
  isThisCourseForTeachers,
  courseDurationLabel,
  translatedGradeRange,
  translatedSubjectsAndTopicsTitlesArray,
  relatedProposalsContent,
  relatedProposalsHeader,
}) => {
  const relatedCurriculums = getRelatedCurriculums(courseOffering);
  return (
    <div className={moduleStyles.courseOfferingExpandedCardContainer}>
      <div className={moduleStyles.arrowContainer} />
      <div className={moduleStyles.expandedCard}>
        <div className={moduleStyles.curriculumDetails}>
          <div className={moduleStyles.top}>
            <div className={moduleStyles.text}>
              <div className={moduleStyles.main}>
                <Typography variant="h3">
                  {courseOffering.display_name}
                </Typography>
                <div className={moduleStyles.aspects}>
                  <div>
                    <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
                    <Typography variant="body3">
                      <Typography variant="strong">
                        {translatedGradeRange[0]}
                      </Typography>{' '}
                      {translatedGradeRange[1]}
                      {isThisCourseForTeachers && '  Teachers'}
                    </Typography>
                  </div>
                  <div>
                    <FontAwesomeV6Icon iconName="clock" iconStyle="solid" />
                    <Typography variant="body3">
                      <Typography variant="strong">
                        {i18n.duration()}:
                      </Typography>{' '}
                      {courseDurationLabel}
                    </Typography>
                  </div>
                  {!!translatedSubjectsAndTopicsTitlesArray.length && (
                    <div>
                      <FontAwesomeV6Icon iconName="book" iconStyle="solid" />
                      <Typography variant="body3">
                        <Typography variant="strong">
                          {i18n.topic()}:
                        </Typography>{' '}
                        {translatedSubjectsAndTopicsTitlesArray.join(', ')}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={moduleStyles.details}>
            {courseOffering.description && (
              <Typography variant="body3">
                {courseOffering.description}
              </Typography>
            )}
            {courseOffering.image && <Image src={courseOffering.image} />}
          </div>
          {!!relatedCurriculums?.length && (
            <div className={moduleStyles.additionalDetails}>
              <div>
                <FontAwesomeV6Icon
                  iconName="book-open-cover"
                  iconStyle="solid"
                />
                <Typography variant="body3">
                  <Typography variant="strong">
                    Associated Curriculum:
                  </Typography>
                </Typography>
                {relatedCurriculums.map(
                  ({display_name, course_version_path}, index) => (
                    <React.Fragment key={display_name}>
                      <Link
                        size="s"
                        key={display_name}
                        href={course_version_path}
                        text={display_name}
                      />
                      {index < relatedCurriculums.length - 1 && (
                        <Typography
                          className={
                            moduleStyles.associatedCurriculumsSeparator
                          }
                          variant="body3"
                        >
                          •
                        </Typography>
                      )}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
          )}

          {actionRowContent && (
            <div className={moduleStyles.actionRowContent}>
              {actionRowContent}
            </div>
          )}
        </div>
        <div className={moduleStyles.right}>
          {relatedProposalsContent && (
            <>
              <div className={moduleStyles.top}>
                {relatedProposalsHeader && (
                  <Typography variant="body2">
                    <Typography variant="strong">
                      {relatedProposalsHeader}
                    </Typography>
                  </Typography>
                )}
              </div>
              <div className={moduleStyles.related}>
                {relatedProposalsContent}
              </div>
            </>
          )}

          <CloseButton
            aria-label="Close expanded card"
            onClick={onClose}
            size="l"
            className={moduleStyles.closeExpandedCardButton}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseOfferingExpandedCard;
