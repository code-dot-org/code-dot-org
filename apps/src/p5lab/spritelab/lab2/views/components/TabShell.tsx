import classNames from 'classnames';
import React from 'react';

import {SPRITE_LAB2_TABS, SpriteLab2Tab} from '../../redux/spriteLab2Redux';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface TabShellProps {
  activeTab: SpriteLab2Tab;
  onTabChange: (tab: SpriteLab2Tab) => void;
  // Tabs not yet implemented are disabled in the bar.
  enabledTabs: readonly SpriteLab2Tab[];
  children: React.ReactNode;
}

/**
 * The full-screen tab chrome for SpriteLab2: a button bar plus the active
 * tab's content. The Code tab is kept mounted by the parent (behind a
 * clip-path) so its Blockly workspace survives tab switches; the bar here only
 * tracks which tab is visible.
 */
const TabShell: React.FunctionComponent<TabShellProps> = ({
  activeTab,
  onTabChange,
  enabledTabs,
  children,
}) => {
  return (
    <div className={moduleStyles.tabShell}>
      <div className={moduleStyles.tabBar} role="tablist">
        {SPRITE_LAB2_TABS.map(tab => {
          const enabled = enabledTabs.includes(tab);
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              disabled={!enabled}
              className={classNames(
                moduleStyles.tab,
                activeTab === tab && moduleStyles.tabActive
              )}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className={moduleStyles.tabContent}>{children}</div>
    </div>
  );
};

export default TabShell;
