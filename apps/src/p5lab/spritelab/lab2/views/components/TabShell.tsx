import classNames from 'classnames';
import React from 'react';

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
  // Tabs to show at all. Defaults to every tab.
  visibleTabs?: readonly SpriteLab2Tab[];
  // The scene picker, rendered at the left of the World/Code scene group. It
  // governs both sub-tabs: the chosen scene is what World and Code operate on.
  sceneChooser?: React.ReactNode;
  // Rendered immediately after the Play button (the Start-over control).
  playTabExtra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The full-screen tab chrome for SpriteLab2. Images and Play are top-level
 * tabs; World and Code are the per-scene sub-tabs, grouped with the scene
 * picker into one segmented "scene area" between them. The Code tab is kept
 * mounted by the parent (behind a clip-path) so its Blockly workspace survives
 * tab switches; the bar here only tracks which tab is visible.
 */
const TabShell: React.FunctionComponent<TabShellProps> = ({
  activeTab,
  onTabChange,
  enabledTabs,
  visibleTabs = SPRITE_LAB2_TABS,
  sceneChooser,
  playTabExtra,
  children,
}) => {
  const show = (tab: SpriteLab2Tab) => visibleTabs.includes(tab);
  const renderTab = (tab: SpriteLab2Tab) => (
    <button
      type="button"
      role="tab"
      aria-selected={activeTab === tab}
      disabled={!enabledTabs.includes(tab)}
      className={classNames(
        moduleStyles.tab,
        activeTab === tab && moduleStyles.tabActive
      )}
      onClick={() => onTabChange(tab)}
    >
      {tab}
    </button>
  );

  const hasSceneGroup = show('World') || show('Code');

  return (
    <div className={moduleStyles.tabShell}>
      <div className={moduleStyles.tabBar} role="tablist">
        {show('Images') && renderTab('Images')}
        {hasSceneGroup && (
          <div className={moduleStyles.sceneGroup}>
            {sceneChooser}
            {show('World') && renderTab('World')}
            {show('Code') && renderTab('Code')}
          </div>
        )}
        {show('Play') && renderTab('Play')}
        {playTabExtra}
      </div>
      <div className={moduleStyles.tabContent}>{children}</div>
    </div>
  );
};

export default TabShell;
