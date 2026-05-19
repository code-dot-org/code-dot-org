import {Button as MuiButton} from '@mui/material';
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
}: ExtraLinksProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isExtraLinksLoading, levelLinkData, projectLinkData} =
    useExtraLinks(levelId);

  if (isExtraLinksLoading || (!levelLinkData && !projectLinkData)) {
    return null;
  }

  return (
    <>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        className={moduleStyles.extraLinksButton}
        id="uitest-extra-links-button"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        {'Extra Links'}
      </MuiButton>
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
