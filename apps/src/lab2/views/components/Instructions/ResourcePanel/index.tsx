import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {
  default as FontAwesomeV6Icon,
  kitIcons,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import StudentRubricView from '@cdo/apps/lab2/views/components/rubrics/StudentRubricView';
import {commonI18n} from '@cdo/apps/types/locale';
import {getTypedKeys} from '@cdo/apps/types/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useRubric} from '../../rubrics/RubricWrapper';
import ForTeachersOnly from '../ForTeachersOnly';
import Instructions, {InstructionsProps} from '../InstructionsV2';
import NavigationArea from '../NavigationArea';

import CopyrightButton from './CopyrightButton';
import ResourcePanelExtraLinks from './ResourcePanelExtraLinks';
import SettingsPanel from './SettingsPanel';

import styles from './styles.module.scss';

enum Tabs {
  Instructions = 'instructions',
  AiTutor = 'aiTutor',
  TeachersOnly = 'teachersOnly',
  StudentRubric = 'studentRubric',
}

export interface Setting {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}

const tabInfo: {[key in Tabs]: {title: string; icon: string}} = {
  [Tabs.Instructions]: {title: commonI18n.instructions(), icon: 'info-circle'},
  [Tabs.AiTutor]: {title: commonI18n.aiTutor(), icon: 'ai-head-solid'},
  [Tabs.TeachersOnly]: {
    title: commonI18n.forTeachersOnly(),
    icon: 'chalkboard-teacher',
  },
  [Tabs.StudentRubric]: {
    title: commonI18n.rubric(),
    icon: 'clipboard-list',
  },
};

type ResourcePanelProps = InstructionsProps & {
  className?: string;
  headerClassName?: string;
  aiTutor2Context?: string;
  rightHeaderContent?: React.ReactNode;
  includeFooterSpacing?: boolean;
  settings?: Setting[];
};

/**
 * Display various instructional resources for the level as tabs.
 */
const ResourcePanel: React.FC<ResourcePanelProps> = ({
  className,
  headerClassName,
  aiTutor2Context,
  rightHeaderContent,
  includeFooterSpacing = true,
  settings,
  ...instructionsProps
}) => {
  const {theme} = useTheme();
  const {showRubric} = useRubric();
  const isParticipant = useAppSelector(
    state => state.currentUser.userType === 'student'
  );
  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Instructions);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const levelId = instructionsProps.levelProperties.id;

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
      (levelProperties.aiTutorAvailable ||
        queryParams('show-ai-tutor2') === 'true') &&
      aiTutor2Context
    ) {
      tabMap[Tabs.AiTutor] = <AiTutor2Chat hiddenContext={aiTutor2Context} />;
    }

    if (isParticipant && showRubric) {
      tabMap[Tabs.StudentRubric] = <StudentRubricView />;
    }

    return tabMap;
  }, [instructionsProps, aiTutor2Context, isParticipant, showRubric]);

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
              key={`tooltip-${tab}`}
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
                <FontAwesomeV6Icon
                  iconName={tabInfo[tab].icon}
                  iconFamily={
                    kitIcons.has(tabInfo[tab].icon) ? 'kit' : undefined
                  }
                />
              </button>
            </WithTooltip>
          ))}
        </div>
        <div className={classNames(styles.bottomTabs)}>
          <ResourcePanelExtraLinks levelId={levelId} theme={theme} />
          <WithTooltip
            tooltipProps={{
              text: commonI18n.settings(),
              tooltipId: 'tooltip-settings',
              direction: 'onRight',
              size: 'xs',
              'data-theme': theme,
            }}
          >
            <button
              type="button"
              className={styles.bottomButton}
              onClick={() => {
                setIsSettingsOpen(!isSettingsOpen);
              }}
            >
              <FontAwesomeV6Icon iconName={'gear'} />
            </button>
          </WithTooltip>
          <CopyrightButton theme={theme} />
        </div>
      </div>
      <div className={styles.panels}>
        <PanelContainer
          id={currentTab}
          headerContent={tabInfo[currentTab].title}
          headerClassName={headerClassName}
          rightHeaderContent={rightHeaderContent}
        >
          {availableTabs[currentTab]}
          <NavigationArea {...instructionsProps} />
          {isSettingsOpen && (
            <SettingsPanel
              settings={settings || []}
              closePanel={() => setIsSettingsOpen(false)}
            />
          )}
        </PanelContainer>
      </div>
    </div>
  );
};

export default ResourcePanel;
