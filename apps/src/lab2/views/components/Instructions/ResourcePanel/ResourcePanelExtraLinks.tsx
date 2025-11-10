import {Theme} from '@code-dot-org/component-library/common/contexts';
import React, {useState} from 'react';

import {useExtraLinks} from '@cdo/apps/lab2/hooks/useExtraLinks';
import lab2I18n from '@cdo/apps/lab2/locale';
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
      ariaLabel={lab2I18n.extraLinks()}
      id={'extra-links'}
      theme={theme}
      Dialog={innerDialog}
      iconName={'link'}
      setIsDialogOpen={setIsModalOpen}
      buttonSize="s"
    />
  );
};

export default ResourcePanelExtraLinks;
