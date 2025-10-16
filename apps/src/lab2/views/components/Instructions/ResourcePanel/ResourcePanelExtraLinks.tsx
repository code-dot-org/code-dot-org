import {Theme} from '@code-dot-org/component-library/common/contexts';
import React, {useState} from 'react';

import {useExtraLinks} from '@cdo/apps/lab2/hooks/useExtraLinks';
import ExtraLinksModal from '@cdo/apps/lab2/views/ExtraLinksModal';

import ButtonWithDialog from './ButtonWithDialog';

interface ResourcePanelExtraLinksProps {
  levelId: number;
  theme: Theme;
}

const ResourcePanelExtraLinks: React.FunctionComponent<
  ResourcePanelExtraLinksProps
> = ({levelId, theme}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isExtraLinksLoading, levelLinkData, projectLinkData} =
    useExtraLinks(levelId);

  if (isExtraLinksLoading || !levelLinkData) {
    return null;
  }

  const innerDialog = (
    <ExtraLinksModal
      levelLinkData={levelLinkData}
      projectLinkData={projectLinkData}
      isOpen={isModalOpen}
      closeModal={() => setIsModalOpen(false)}
      levelId={levelId}
    />
  );

  return (
    <ButtonWithDialog
      text={'Extra Links'}
      id={'extra-links'}
      theme={theme}
      Dialog={innerDialog}
      iconName={'link'}
      setIsDialogOpen={setIsModalOpen}
    />
  );
};

export default ResourcePanelExtraLinks;
