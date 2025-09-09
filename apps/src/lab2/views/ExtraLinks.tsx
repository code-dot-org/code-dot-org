import Button from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import {useExtraLinks} from '@cdo/apps/lab2/hooks/useExtraLinks';

import ExtraLinksModal from './ExtraLinksModal';

import moduleStyles from './extra-links.module.scss';

interface ExtraLinksProps {
  levelId: number;
  positionRightOfFooter?: boolean;
}

// If the user has permission to see extra links, fetch extra links for the level,
// then display a modal with the link data.
const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
  positionRightOfFooter,
}: ExtraLinksProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isExtraLinksLoading, levelLinkData, projectLinkData} =
    useExtraLinks(levelId);

  if (isExtraLinksLoading || (!levelLinkData && !projectLinkData)) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={
          positionRightOfFooter
            ? moduleStyles.buttonRightOfFooter
            : moduleStyles.extraLinksButton
        }
        size={'s'}
        id={'uitest-extra-links-button'}
      />
      {levelLinkData && (
        <ExtraLinksModal
          levelLinkData={levelLinkData}
          projectLinkData={projectLinkData}
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          levelId={levelId}
        />
      )}
    </>
  );
};

export default ExtraLinks;
