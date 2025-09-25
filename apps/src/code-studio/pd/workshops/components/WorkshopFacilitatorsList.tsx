import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Image from '@code-dot-org/component-library/image';
import {
  BodyTwoText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useState} from 'react';

import {FacilitatorInfo, WorkshopInfo} from './../types';

import moduleStyles from './workshopFaccilitatorsList.module.scss';

const FacilitatorItem: React.FC<{facilitator: FacilitatorInfo}> = ({
  facilitator,
}) => {
  const [showBio, handleShowBio] = useState(false);

  return (
    <div className={moduleStyles.workshopFacilitatorItem}>
      <div className={moduleStyles.workshopFacilitatorItemHeader}>
        <div className={moduleStyles.workshopFacilitatorContactImage}>
          {facilitator.image_path ? (
            <Image src={facilitator.image_path} />
          ) : (
            <FontAwesomeV6Icon iconName="user" />
          )}
        </div>
        <div className={moduleStyles.workshopFacilitatorContactInfo}>
          <BodyTwoText>
            <StrongText>{facilitator.name}</StrongText>
          </BodyTwoText>
          <BodyThreeText>{facilitator.email}</BodyThreeText>
        </div>
        {facilitator.bio && (
          <div>
            <Button
              type="tertiary"
              size="s"
              className={moduleStyles.showBioButton}
              text={showBio ? 'Hide biography' : 'Show biography'}
              iconRight={{iconName: showBio ? 'chevron-up' : 'chevron-down'}}
              onClick={() => handleShowBio(!showBio)}
              aria-expanded={showBio}
            />
          </div>
        )}
      </div>
      {facilitator.bio && (
        <div
          className={classNames(
            moduleStyles.workshopFacilitatorItemBio,
            !showBio && moduleStyles.hidden
          )}
        >
          <BodyThreeText>{facilitator.bio}</BodyThreeText>
        </div>
      )}
    </div>
  );
};

interface WorkshopSessionsListProps
  extends Pick<WorkshopInfo, 'facilitators'> {}

/** Component to render a list of workshop facilitators. */
const WorkshopFacilitatorsList: React.FC<WorkshopSessionsListProps> = ({
  facilitators,
}) => {
  return (
    <div className={moduleStyles.workshopFacilitatorsList}>
      {facilitators?.map(facilitator => (
        <FacilitatorItem key={facilitator.email} facilitator={facilitator} />
      ))}
    </div>
  );
};

export default WorkshopFacilitatorsList;
