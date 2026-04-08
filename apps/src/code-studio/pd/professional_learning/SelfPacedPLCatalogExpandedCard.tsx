import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Typography,
  Button as MuiButton,
  IconButton as MuiIconButton,
} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import style from './courses/selfPacedPLCatalog.module.scss';

const SelfPacedPLCatalogExpandedCard: React.FunctionComponent<{
  courseKey: string;
  displayName: string;
  gradeLevels?: string;
  duration?: number;
  csTopics?: string;
  description?: string;
  image?: string;
  video?: string;
  pathToCourse?: string;
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
              <Typography variant="h3" gutterBottom>
                {displayName}
              </Typography>
              <div className={style.infoContainer}>
                <div className={style.iconWithDescription}>
                  <FontAwesomeV6Icon
                    iconName="user"
                    iconStyle="solid"
                    className="fa-solid"
                  />
                  <Typography variant="body2" gutterBottom>
                    {gradeLevels}
                  </Typography>
                </div>
                <div className={style.iconWithDescription}>
                  <FontAwesomeV6Icon
                    iconName="clock"
                    iconStyle="solid"
                    className="fa-solid"
                  />
                  <Typography variant="body2" gutterBottom>
                    {duration}
                  </Typography>
                </div>
                <div className={style.iconWithDescription}>
                  <FontAwesomeV6Icon
                    iconName="book"
                    iconStyle="solid"
                    className="fa-solid"
                  />
                  <Typography variant="body2" gutterBottom>
                    {i18n.topic() + ': ' + csTopics}
                  </Typography>
                </div>
              </div>
              <hr className={style.horizontalDivider} />
              <div className={style.centerContentContainer}>
                <div className={style.descriptionContentContainer}>
                  <div className={style.descriptionContainer}>
                    <Typography variant="body2" gutterBottom>
                      {description}
                    </Typography>
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
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="medium"
                  className={style.buttonFlex}
                  aria-label={i18n.quickViewDescription({
                    course_name: displayName,
                  })}
                  href={pathToCourse}
                >
                  {i18n.seeCurriculumDetails()}
                </MuiButton>
              </div>
            </div>
            <div className={style.sideBar}>
              <div className={style.closeButtonContainer}>
                <MuiIconButton
                  variant="text"
                  color="secondary"
                  size="medium"
                  className={style.closeButton}
                  onClick={onClose}
                  aria-label="Close Button"
                  type="button"
                >
                  <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
                </MuiIconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfPacedPLCatalogExpandedCard;
