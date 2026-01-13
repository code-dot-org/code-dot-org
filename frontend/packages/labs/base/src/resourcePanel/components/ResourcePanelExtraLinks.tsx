import type {FunctionComponent} from 'react';
import {useState} from 'react';

import {Theme} from '@code-dot-org/component-library/common/contexts';

import ExtraLinksModal from '../../components/ExtraLinksModal';
import {useExtraLinks} from '../../hooks/useExtraLinks';

import ButtonWithDialog from './ButtonWithDialog';

interface ResourcePanelExtraLinksProps {
  levelId: number;
  theme: Theme;
}

const ResourcePanelExtraLinks: FunctionComponent<
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
      text="Extra Links"
      ariaLabel="Extra Links"
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
