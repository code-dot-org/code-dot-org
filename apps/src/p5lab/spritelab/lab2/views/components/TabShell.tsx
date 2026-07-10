import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {
  SPRITE_LAB2_TABS,
  SpriteLab2Tab,
} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface TabShellProps {
  activeTab: SpriteLab2Tab;
  onTabChange: (tab: SpriteLab2Tab) => void;
  // Tabs not yet implemented are disabled in the bar.
  enabledTabs: readonly SpriteLab2Tab[];
  // Tabs to show at all. Defaults to every tab; the scenes UI variant drops
  // World entirely rather than disabling it.
  visibleTabs?: readonly SpriteLab2Tab[];
  // Rendered in the header immediately after the tab buttons (the scenes
  // variant puts the scene selector there).
  codeTabExtra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The workspace chrome for SpriteLab2: a PanelContainer whose header holds
 * the tab controls (segmented buttons), so its bar aligns with the
 * ResourcePanel's. The Code tab is kept mounted by the parent (behind a
 * clip-path) so its Blockly workspace survives tab switches.
 */
const TabShell: React.FunctionComponent<TabShellProps> = ({
  activeTab,
  onTabChange,
  enabledTabs,
  visibleTabs = SPRITE_LAB2_TABS,
  codeTabExtra,
  children,
}) => {
  return (
    <PanelContainer
      id="spritelab2-workspace"
      className={moduleStyles.tabShell}
      headerContent="Sprite Lab"
      leftHeaderContent={
        <div className={moduleStyles.tabControls}>
          <SegmentedButtons
            size="xs"
            buttons={SPRITE_LAB2_TABS.filter(tab =>
              visibleTabs.includes(tab)
            ).map(tab => ({
              label: tab,
              ariaLabel: tab,
              value: tab,
              disabled: !enabledTabs.includes(tab),
            }))}
            selectedButtonValue={activeTab}
            onChange={value => onTabChange(value as SpriteLab2Tab)}
          />
          {codeTabExtra}
        </div>
      }
    >
      <div className={moduleStyles.tabContent}>{children}</div>
    </PanelContainer>
  );
};

export default TabShell;
