import classnames from 'classnames';
import React from 'react';

// import {componentSizeToBodyTextSizeMap} from '@cdo/apps/componentLibrary/common/constants';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
// import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import _Tab, {TabModel} from '@cdo/apps/componentLibrary/tabs/_Tab';
import TabPanel from '@cdo/apps/componentLibrary/tabs/TabPanel';

import moduleStyles from './tabs.module.scss';

export interface TabsProps {
  tabs: TabModel[];
  onChange: (value: string) => void;
  selectedTabValue: string;
  /** The name attribute specifies the name of a Tabs group.
     The name attribute is used to reference elements in a JavaScript.
     */
  name: string;
  type?: 'primary' | 'secondary';
  /** Size of Tabs */
  size?: ComponentSizeXSToL;
  tabsContainerClassName?: string;
  tabsContainerId?: string;
  tabPanelsContainerClassName?: string;
  tabPanelsContainerId?: string;
}

/**
 * ### Production-ready Checklist:
 * * (?✔) implementation of component approved by design team;
 * * (?✔) has storybook, covered with stories and documentation;
 * * (?✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TabsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Tabs Component.
 * Can be used to render a set of Tabs and Tab's content.
 */
const Tabs: React.FunctionComponent<TabsProps> = ({
  tabs,
  name,
  onChange,
  selectedTabValue,
  tabsContainerId,
  tabsContainerClassName,
  tabPanelsContainerId,
  tabPanelsContainerClassName,
  type = 'primary',
  size = 'm',
}) => {
  return (
    <>
      <div
        className={classnames(
          moduleStyles.tabs,
          moduleStyles[`tabs-${size}`],
          moduleStyles[`tabs-${type}`],
          tabsContainerClassName
        )}
        id={tabsContainerId}
      >
        <ul
          role="tablist"
          // className={moduleStyles.tabsList}
        >
          {tabs.map((tab, index) => (
            <_Tab
              {...tab}
              key={tab.value}
              isSelected={tab.value === selectedTabValue}
              onClick={onChange}
              tabPanelId={`${name}-panel-${tab.value}`}
              tabButtonId={`${name}-tab-${tab.value}`}
            />
          ))}
        </ul>
      </div>
      <div
        className={classnames(tabPanelsContainerClassName)}
        id={tabPanelsContainerId}
      >
        {tabs.map(tab => (
          <TabPanel
            key={tab.value}
            content={tab.tabContent}
            isActive={tab.value === selectedTabValue}
            id={`${name}-panel-${tab.value}`}
            labelledBy={`${name}-tab-${tab.value}`}
          />
        ))}
      </div>
    </>
  );
};

export default Tabs;
