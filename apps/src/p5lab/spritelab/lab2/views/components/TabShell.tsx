import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef} from 'react';

import {
  ALL_TABS,
  Tab,
} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import moduleStyles from '../sprite-lab2-view.module.scss';

// The tabs that edit the selected scene. They share the scene selector, so
// they render as one group with the selector leading it.
const SCENE_TABS: readonly Tab[] = ['World', 'Code'];

interface TabShellProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  // Tabs not yet implemented are disabled in the bar.
  enabledTabs: readonly Tab[];
  // Tabs to show at all. Defaults to every tab.
  visibleTabs?: readonly Tab[];
  // Rendered in the tab bar leading the scene-editing tabs (the scene
  // selector).
  sceneTabsExtra?: React.ReactNode;
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
  visibleTabs = ALL_TABS,
  sceneTabsExtra,
  playTabExtra,
  children,
  onClickStartOver,
}) => {
  const sceneTabs = useMemo(
    () =>
      ALL_TABS.filter(
        tab => SCENE_TABS.includes(tab) && visibleTabs.includes(tab)
      ),
    [visibleTabs]
  );
  // A lone scene tab with no selector has nothing to group with.
  const grouped = !!sceneTabsExtra || sceneTabs.length > 1;
  // Returning to the group reopens the scene tab it was left on, so a trip to
  // Play doesn't cost the World editor.
  const lastSceneTab = useRef<Tab | null>(null);
  useEffect(() => {
    if (sceneTabs.includes(activeTab)) {
      lastSceneTab.current = activeTab;
    }
  }, [activeTab, sceneTabs]);
  const groupTarget =
    lastSceneTab.current && sceneTabs.includes(lastSceneTab.current)
      ? lastSceneTab.current
      : sceneTabs.includes('Code')
      ? 'Code'
      : sceneTabs[0];
  const renderTab = (tab: Tab) => (
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
      // Read by .tab::after, which reserves the selected label's width.
      data-label={tab}
    >
      {tab}
    </button>
  );
  return (
    <div className={moduleStyles.tabShell}>
      <div className={moduleStyles.tabContainer}>
        <div className={moduleStyles.tabBar} role="tablist">
          {ALL_TABS.filter(tab => visibleTabs.includes(tab)).map(tab => {
            if (grouped && sceneTabs.includes(tab)) {
              // The whole group renders at the first scene tab's position.
              if (tab !== sceneTabs[0]) {
                return null;
              }
              return (
                <div
                  key={tab}
                  className={classNames(
                    moduleStyles.tabGroup,
                    // Only offer the pointer when a click here would move
                    // the tab; on a scene tab it would do nothing.
                    !sceneTabs.includes(activeTab) &&
                      moduleStyles.tabGroupOpensTab
                  )}
                  // Clicks on the disabled selector fall through here and
                  // open the group's default tab. The tab buttons handle
                  // their own clicks; acting on their bubbled events too
                  // would override them (activeTab is stale in this render).
                  onClick={e => {
                    if (
                      !(e.target as HTMLElement).closest('button') &&
                      !sceneTabs.includes(activeTab) &&
                      enabledTabs.includes(groupTarget)
                    ) {
                      onTabChange(groupTarget);
                    }
                  }}
                >
                  {sceneTabsExtra}
                  {sceneTabs.map(sceneTab => (
                    <React.Fragment key={sceneTab}>
                      {renderTab(sceneTab)}
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            // The restart controls sit just right of the Play button.
            if (tab === 'Play' && playTabExtra) {
              return (
                <React.Fragment key={tab}>
                  {renderTab(tab)}
                  {playTabExtra}
                </React.Fragment>
              );
            }
            return <React.Fragment key={tab}>{renderTab(tab)}</React.Fragment>;
          })}
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
