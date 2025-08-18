import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {useState} from 'react';

import {useExtraLinks} from '@cdo/apps/lab2/hooks/useExtraLinks';
import ExtraLinksModal from '@cdo/apps/lab2/views/ExtraLinksModal';

import styles from './styles.module.scss';

interface ResourcePanelExtraLinksProps {
  levelId: number;
  scriptLevelId?: string;
  theme: Theme;
}

const ResourcePanelExtraLinks: React.FunctionComponent<
  ResourcePanelExtraLinksProps
> = ({levelId, scriptLevelId, theme}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isExtraLinksLoading, levelLinkData, projectLinkData} = useExtraLinks(
    levelId,
    scriptLevelId
  );

  if (isExtraLinksLoading || (!levelLinkData && !projectLinkData)) {
    return null;
  }

  return (
    <>
      <WithTooltip
        tooltipProps={{
          text: 'Extra Links',
          tooltipId: 'tooltip-extra-links',
          direction: 'onRight',
          size: 'xs',
          'data-theme': theme,
        }}
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={styles.bottomButton}
          id={'uitest-extra-links-button'}
        >
          <FontAwesomeV6Icon iconName={'link'} />
        </button>
      </WithTooltip>
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

export default ResourcePanelExtraLinks;
