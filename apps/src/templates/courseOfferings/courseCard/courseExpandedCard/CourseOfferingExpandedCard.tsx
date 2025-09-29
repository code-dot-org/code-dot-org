import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Image from '@code-dot-org/component-library/image';
import {
  Heading3,
  BodyTwoText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import i18n from '@cdo/locale';

import moduleStyles from './courseOfferingExpandedCard.module.scss';

interface CourseOfferingExpandedCardProps {
  courseOffering: CourseOffering;
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
  onClose,
  actionRowContent,
  isThisCourseForTeachers,
  courseDurationLabel,
  translatedGradeRange,
  translatedSubjectsAndTopicsTitlesArray,
  relatedProposalsContent,
  relatedProposalsHeader,
}) => {
  return (
    <div className={moduleStyles.courseOfferingExpandedCardContainer}>
      <div className={moduleStyles.arrowContainer} />
      <div className={moduleStyles.expandedCard}>
        <div className={moduleStyles.curriculumDetails}>
          <div className={moduleStyles.top}>
            <div className={moduleStyles.text}>
              <div className={moduleStyles.main}>
                <Heading3 noMargin>{courseOffering.display_name}</Heading3>
                <div className={moduleStyles.aspects}>
                  <div>
                    <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
                    <BodyThreeText noMargin>
                      <StrongText noMargin>
                        {translatedGradeRange[0]}
                      </StrongText>{' '}
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
                  {!!translatedSubjectsAndTopicsTitlesArray.length && (
                    <div>
                      <FontAwesomeV6Icon iconName="book" iconStyle="solid" />
                      <BodyThreeText noMargin>
                        <StrongText noMargin>{i18n.topic()}:</StrongText>{' '}
                        {translatedSubjectsAndTopicsTitlesArray.join(', ')}
                      </BodyThreeText>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={moduleStyles.details}>
            {courseOffering.description && (
              <BodyThreeText noMargin>
                {courseOffering.description}
              </BodyThreeText>
            )}
            {courseOffering.image && <Image src={courseOffering.image} />}
          </div>
          {/*TODO: Bring and refactor this functionality back in scope of
                 https://codedotorg.atlassian.net/browse/ACQ-3467*/}
          {/*{courseOffering.available_resources &&*/}
          {/*  !!Object.keys(courseOffering.available_resources).length && (*/}
          {/*    <div className={moduleStyles.additionalDetails}>*/}
          {/*      <div>*/}
          {/*        <FontAwesomeV6Icon*/}
          {/*          iconName="book-open-cover"*/}
          {/*          iconStyle="solid"*/}
          {/*        />*/}
          {/*        <BodyThreeText noMargin>*/}
          {/*          <StrongText>Associated Curriculum:</StrongText>*/}
          {/*        </BodyThreeText>*/}
          {/*        {Object.keys(courseOffering.available_resources).length &&*/}
          {/*          Object.keys(courseOffering.available_resources).map(key => (*/}
          {/*            <Link*/}
          {/*              key={key}*/}
          {/*              href={*/}
          {/*                courseOffering.available_resources*/}
          {/*                  ? courseOffering.available_resources[key]*/}
          {/*                  : '#'*/}
          {/*              }*/}
          {/*              text={key}*/}
          {/*            />*/}
          {/*          ))}*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  )}*/}

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
                  <BodyTwoText noMargin>
                    <StrongText>{relatedProposalsHeader}</StrongText>
                  </BodyTwoText>
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
