import {
  Button,
  LinkButton,
  buttonColors,
} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import CardLabels from '@cdo/apps/templates/curriculumCatalog/CardLabels';
import i18n from '@cdo/locale';

import SelfPacedPLCatalogExpandedCard from './SelfPacedPLCatalogExpandedCard';

import style from './selfPacedPLCatalog.module.scss';

interface SelfPacedPLCard {
  courseKey: string;
  displayName: string;
  gradeLevels: string;
  duration: number;
  csTopics: string;
  description: string;
  image?: string;
  video?: string;
  pathToCourse: string;
  isExpanded: boolean;
  updateExpandedCardKey: () => void;
}

const SelfPacedPLCatalogCard: React.FunctionComponent<SelfPacedPLCard> = ({
  courseKey,
  displayName,
  gradeLevels,
  duration,
  csTopics,
  description,
  image,
  video,
  pathToCourse,
  isExpanded,
  updateExpandedCardKey,
}) => (
  <div id={`${courseKey}-cardContainer`} className={style.cardContainer}>
    <div>
      <img src={image} alt="" />
      <div className={style.curriculumInfoContainer}>
        <div>
          {csTopics && (
            <div className={style.csTopicLabels}>
              <CardLabels subjectsAndTopics={csTopics.split(',')} />
            </div>
          )}
          <h4>{displayName}</h4>
          <div className={style.iconWithDescription}>
            <FontAwesomeV6Icon
              iconName="user"
              iconStyle="solid"
              className="fa-solid"
            />
            <p>{gradeLevels}</p>
          </div>
          <div className={style.iconWithDescription}>
            <FontAwesomeV6Icon
              iconName="clock"
              iconStyle="solid"
              className="fa-solid"
            />
            <p>{duration}</p>
          </div>
        </div>
        <div className={style.buttonsContainer}>
          <Button
            text={i18n.quickView()}
            ariaLabel={i18n.quickViewDescription({
              course_name: displayName,
            })}
            type="secondary"
            color={buttonColors.black}
            className={style.buttonFlex}
            onClick={updateExpandedCardKey}
          />
          <LinkButton
            text={i18n.learnMore()}
            ariaLabel={i18n.learnMoreDescription({
              course_name: displayName,
            })}
            type="secondary"
            color={buttonColors.black}
            className={style.buttonFlex}
            href={pathToCourse}
          />
        </div>
      </div>
    </div>
    {isExpanded && (
      <SelfPacedPLCatalogExpandedCard
        courseKey={courseKey}
        displayName={displayName}
        duration={duration}
        gradeLevels={gradeLevels}
        csTopics={csTopics}
        description={description}
        image={image}
        video={video}
        pathToCourse={pathToCourse}
        onClose={updateExpandedCardKey}
      />
    )}
  </div>
);

export default SelfPacedPLCatalogCard;
