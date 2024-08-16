import classnames from 'classnames';
import React, {useCallback, useState} from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import _Tab, {TabModel} from '@cdo/apps/componentLibrary/tabs/_Tab';
import _TabPanel from '@cdo/apps/componentLibrary/tabs/_TabPanel';

import moduleStyles from './tabs.module.scss';

export interface TabsProps {
  /** Array of props for Tabs to render */
  tabs: TabModel[];
  /** The function that is called when a Tab is clicked/selected tab is changed */
  onChange: (value: string) => void;
  /** The value of the default selected Tab */
  defaultSelectedTabValue: string;
  /** The name attribute specifies the name of a Tabs group.
     The name attribute is used to reference elements in a JavaScript.
     */
  name: string;
  /** Type of Tabs */
  type?: 'primary' | 'secondary';
  /** Mode (color) of Tabs */
  mode?: 'light' | 'dark';
  /** Size of Tabs */
  size?: ComponentSizeXSToL;
  /** Custom className for Tabs container */
  tabsContainerClassName?: string;
  /** Custom id for Tabs container */
  tabsContainerId?: string;
  /** Custom className for Tab Panels container */
  tabPanelsContainerClassName?: string;
  /** Custom id for Tab Panels container */
  tabPanelsContainerId?: string;
  /** Custom className for active Tab Panel */
  tabPanelClassNameActive?: string;
  /** Custom className for hidden Tab Panel */
  tabPanelClassNameHidden?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
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
  defaultSelectedTabValue,
  tabsContainerId,
  tabsContainerClassName,
  tabPanelsContainerId,
  tabPanelsContainerClassName,
  type = 'primary',
  mode = 'light',
  size = 'm',
}) => {
  const [selectedTabValue, setSelectedValue] = useState(
    defaultSelectedTabValue
  );
  const handleChange = useCallback(
    (value: string) => {
      setSelectedValue(value);
      if (onChange) {
        onChange(value);
      }
    },
    [setSelectedValue, onChange]
  );

  const nameStripped = name.replace(' ', '-');

  return (
    <>
      <div
        className={classnames(
          moduleStyles.tabs,
          moduleStyles[`tabs-${size}`],
          moduleStyles[`tabs-${type}`],
          moduleStyles[`tabs-${mode}`],
          tabsContainerClassName
        )}
        id={tabsContainerId}
      >
        <ul role="tablist">
          {tabs.map((tab, index) => (
            <_Tab
              {...tab}
              key={tab.value}
              isSelected={tab.value === selectedTabValue}
              onClick={handleChange}
              tabPanelId={`${nameStripped}-panel-${tab.value}`}
              tabButtonId={`${nameStripped}-tab-${tab.value}`}
            />
          ))}
        </ul>
      </div>
      <div
        className={classnames(tabPanelsContainerClassName)}
        id={tabPanelsContainerId}
      >
        {tabs.map(tab => (
          <_TabPanel
            key={tab.value}
            content={tab.tabContent}
            isActive={tab.value === selectedTabValue}
            id={`${nameStripped}-panel-${tab.value}`}
            labelledBy={`${nameStripped}-tab-${tab.value}`}
            classNameActive={moduleStyles.tabPanelActive}
            classNameHidden={moduleStyles.tabPanelHidden}
          />
        ))}
      </div>
    </>
  );
};

export default Tabs;
