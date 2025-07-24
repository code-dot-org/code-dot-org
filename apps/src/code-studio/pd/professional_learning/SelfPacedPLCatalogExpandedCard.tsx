import {
  Button,
  LinkButton,
  buttonColors,
} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Heading3,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import style from './selfPacedPLCatalog.module.scss';

const SelfPacedPLCatalogExpandedCard: React.FunctionComponent<{
  courseKey: string;
  displayName: string;
  gradeLevels: string;
  duration: number;
  csTopics: string;
  description: string;
  image?: string;
  video?: string;
  pathToCourse: string;
  onClose: () => void;
}> = ({
  courseKey,
  displayName,
  gradeLevels,
  duration,
  csTopics,
  description,
  image,
  video,
  pathToCourse,
  onClose,
}) => {
  return (
    <div id={`${courseKey}-expandedCardContainer`}>
      <div className={style.arrowContainer} />
      <div className={style.centerExpandedCard}>
        <div className={style.expandedCardContainer}>
          <div className={style.flexDivider}>
            <div className={style.plCourseOfferingContainer}>
              <Heading3>{displayName}</Heading3>
              <div className={style.infoContainer}>
                <div className={style.iconWithDescription}>
                  <FontAwesomeV6Icon
                    iconName="user"
                    iconStyle="solid"
                    className="fa-solid"
                  />
                  <BodyTwoText>{gradeLevels}</BodyTwoText>
                </div>
                <div className={style.iconWithDescription}>
                  <FontAwesomeV6Icon
                    iconName="clock"
                    iconStyle="solid"
                    className="fa-solid"
                  />
                  <BodyTwoText>{duration}</BodyTwoText>
                </div>
                <div className={style.iconWithDescription}>
                  <FontAwesomeV6Icon
                    iconName="book"
                    iconStyle="solid"
                    className="fa-solid"
                  />
                  <BodyTwoText>{i18n.topic() + ': ' + csTopics}</BodyTwoText>
                </div>
              </div>
              <hr className={style.horizontalDivider} />
              <div className={style.centerContentContainer}>
                <div className={style.descriptionContentContainer}>
                  <div className={style.descriptionContainer}>
                    <BodyTwoText>{description}</BodyTwoText>
                  </div>
                  <div className={style.mediaContainer}>
                    {video ? (
                      <div className={style.videoContainer}>
                        <iframe
                          width="100%"
                          height="100%"
                          style={{border: 'none'}}
                          src={video}
                          title="Youtube embed"
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className={style.imageContainer}>
                        <img src={image} alt="" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <hr className={style.horizontalDivider} />
              <div className={style.buttonsContainer}>
                <LinkButton
                  text={i18n.seeCurriculumDetails()}
                  ariaLabel={i18n.quickViewDescription({
                    course_name: displayName,
                  })}
                  color={buttonColors.black}
                  type="secondary"
                  className={style.buttonFlex}
                  href={pathToCourse}
                />
              </div>
            </div>
            <div className={style.sideBar}>
              <div className={style.closeButtonContainer}>
                <Button
                  icon={{
                    iconName: 'xmark',
                    iconStyle: 'solid',
                  }}
                  ariaLabel="Close Button"
                  isIconOnly
                  type="tertiary"
                  color={buttonColors.black}
                  className={style.closeButton}
                  onClick={onClose}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfPacedPLCatalogExpandedCard;
