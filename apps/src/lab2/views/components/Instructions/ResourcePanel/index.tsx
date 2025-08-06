import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {commonI18n} from '@cdo/apps/types/locale';
import {getTypedKeys} from '@cdo/apps/types/utils';

import ForTeachersOnly from '../ForTeachersOnly';
import Instructions, {InstructionsProps} from '../InstructionsV2';
import NavigationArea from '../NavigationArea';

import styles from './styles.module.scss';

enum Tabs {
  Instructions = 'instructions',
  AiTutor = 'aiTutor',
  TeachersOnly = 'teachersOnly',
}

const tabInfo: {[key in Tabs]: {title: string; icon: string}} = {
  [Tabs.Instructions]: {title: commonI18n.instructions(), icon: 'info-circle'},
  [Tabs.AiTutor]: {title: commonI18n.aiTutor(), icon: 'robot'},
  [Tabs.TeachersOnly]: {
    title: commonI18n.forTeachersOnly(),
    icon: 'chalkboard-teacher',
  },
};

type ResourcePanelProps = InstructionsProps & {
  className?: string;
  headerClassName?: string;
  aiTutor2Context?: string;
};

/**
 * Display various instructional resources for the level as tabs.
 */
const ResourcePanel: React.FC<ResourcePanelProps> = ({
  className,
  headerClassName,
  aiTutor2Context,
  ...instructionsProps
}) => {
  const {theme} = useTheme();
  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Instructions);

  // Build available tabs based on level information.
  const availableTabs = useMemo(() => {
    const tabMap: {[key in Tabs]?: React.ReactNode} = {};
    const levelProperties = instructionsProps.levelProperties;

    if (levelProperties.longInstructions) {
      tabMap[Tabs.Instructions] = (
        <Instructions {...instructionsProps} hideNavigation />
      );
    }

    if (
      levelProperties.teacherMarkdown ||
      levelProperties.predictSettings?.solution
    ) {
      tabMap[Tabs.TeachersOnly] = (
        <ForTeachersOnly
          levelProperties={levelProperties}
          className={styles.panelContent}
        />
      );
    }

    if (
      (levelProperties.aiTutor2Available ||
        queryParams('show-ai-tutor2') === 'true') &&
      aiTutor2Context
    ) {
      tabMap[Tabs.AiTutor] = <AiTutor2Chat hiddenContext={aiTutor2Context} />;
    }

    return tabMap;
  }, [instructionsProps, aiTutor2Context]);

  return (
    <div className={classNames(styles.resourcePanel, className)}>
      <div className={styles.sidebar}>
        <div className={styles.tabs}>
          {getTypedKeys(availableTabs).map(tab => (
            <WithTooltip
              tooltipProps={{
                text: tabInfo[tab].title,
                tooltipId: `tooltip-${tab}`,
                direction: 'onRight',
                size: 'xs',
                'data-theme': theme,
              }}
            >
              <button
                type="button"
                className={classNames(
                  styles.tabButton,
                  tab === currentTab && styles.selected
                )}
                onClick={() => setCurrentTab(tab)}
                key={tab}
              >
                <FontAwesomeV6Icon iconName={tabInfo[tab].icon} />
              </button>
            </WithTooltip>
          ))}
        </div>
      </div>
      <div className={classNames(styles.panels)}>
        <PanelContainer
          id={currentTab}
          headerContent={tabInfo[currentTab].title}
          headerClassName={headerClassName}
        >
          {availableTabs[currentTab]}
          <NavigationArea {...instructionsProps} />
        </PanelContainer>
      </div>
    </div>
  );
};

export default ResourcePanel;
