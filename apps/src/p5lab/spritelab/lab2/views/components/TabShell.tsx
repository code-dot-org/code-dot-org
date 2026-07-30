import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {
  SPRITE_LAB2_TABS,
  SpriteLab2Tab,
} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface TabShellProps {
  activeTab: SpriteLab2Tab;
  onTabChange: (tab: SpriteLab2Tab) => void;
  // Tabs not yet implemented are disabled in the bar.
  enabledTabs: readonly SpriteLab2Tab[];
  // Tabs to show at all. Defaults to every tab.
  visibleTabs?: readonly SpriteLab2Tab[];
  // Rendered in the tab bar immediately after the Code button (the scene
  // selector).
  codeTabExtra?: React.ReactNode;
  // Rendered immediately after the Systems button (the system selector).
  systemsTabExtra?: React.ReactNode;
  // Rendered immediately after the Play button (the restart controls).
  playTabExtra?: React.ReactNode;
  children: React.ReactNode;
  onClickStartOver?: () => void;
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
  visibleTabs = SPRITE_LAB2_TABS,
  codeTabExtra,
  systemsTabExtra,
  playTabExtra,
  children,
  onClickStartOver,
}) => {
  // World-tab experiment: the scene selector, World, and Code read as one
  // group (the selector governs both tabs).
  const worldMode = visibleTabs.includes('World');
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
      onClick={event => {
        blurAfterPointerClick(event);
        onTabChange(tab);
      }}
    >
      {tab}
    </button>
  );
  return (
    <div className={moduleStyles.tabShell}>
      <div className={moduleStyles.tabContainer}>
        <div className={moduleStyles.tabBar} role="tablist">
          {SPRITE_LAB2_TABS.filter(tab => visibleTabs.includes(tab)).map(
            tab => {
              const enabled = enabledTabs.includes(tab);
              const button = renderTab(tab);
              if (worldMode && tab === 'Code') {
                // Rendered inside the World group below.
                return null;
              }
              if (worldMode && tab === 'World') {
                return (
                  <div
                    key={tab}
                    className={classNames(
                      moduleStyles.tabGroup,
                      moduleStyles.tabGroupWorld
                    )}
                    // Clicks on the disabled selector fall through here and
                    // open the group's default tab. The tab buttons handle
                    // their own clicks; acting on their bubbled events too
                    // would override them (activeTab is stale in this render).
                    onClick={e => {
                      if (
                        !(e.target as HTMLElement).closest('button') &&
                        activeTab !== 'Code' &&
                        activeTab !== 'World' &&
                        enabledTabs.includes('Code')
                      ) {
                        onTabChange('Code');
                      }
                    }}
                  >
                    {codeTabExtra}
                    {button}
                    {renderTab('Code')}
                  </div>
                );
              }
              // The Systems tab and its selector read as one group, like the
              // Code tab's below.
              if (tab === 'Systems' && systemsTabExtra) {
                return (
                  <div
                    key={tab}
                    className={classNames(
                      moduleStyles.tabGroup,
                      activeTab === 'Systems' && moduleStyles.tabGroupActive
                    )}
                    // The selector is disabled (pointer-events: none) off the
                    // Systems tab, so clicks on it land here and activate it.
                    onClick={() => {
                      if (activeTab !== 'Systems' && enabled) {
                        onTabChange('Systems');
                      }
                    }}
                  >
                    {button}
                    {systemsTabExtra}
                  </div>
                );
              }
              // The Code tab and its extra (the scene selector) read as one
              // segmented control: the group carries the active-tab background,
              // the pieces inside are transparent.
              if (tab === 'Code' && codeTabExtra) {
                return (
                  <div
                    key={tab}
                    className={classNames(
                      moduleStyles.tabGroup,
                      activeTab === 'Code' && moduleStyles.tabGroupActive
                    )}
                    // The whole group is the Code tab's click target: the scene
                    // selector is disabled (pointer-events: none) on other tabs,
                    // so clicks on it land here and activate the tab.
                    onClick={() => {
                      if (activeTab !== 'Code' && enabled) {
                        onTabChange('Code');
                      }
                    }}
                  >
                    {button}
                    {codeTabExtra}
                  </div>
                );
              }
              // The restart controls sit just right of the Play button.
              if (tab === 'Play' && playTabExtra) {
                return (
                  <React.Fragment key={tab}>
                    {button}
                    {playTabExtra}
                  </React.Fragment>
                );
              }
              return <React.Fragment key={tab}>{button}</React.Fragment>;
            }
          )}
        </div>
        <div className={moduleStyles.tabBar}>
          {onClickStartOver && (
            <MuiButton
              variant="outlined"
              color="secondary"
              size="extraSmall"
              onClick={event => {
                blurAfterPointerClick(event);
                onClickStartOver();
              }}
              type="button"
              endIcon={
                <FontAwesomeV6Icon iconStyle="solid" iconName="refresh" />
              }
            >
              Start Over
            </MuiButton>
          )}
        </div>
      </div>
      <div className={moduleStyles.tabContent}>{children}</div>
    </div>
  );
};

export default TabShell;
