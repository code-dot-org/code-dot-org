import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Tooltip, {TooltipOverlay} from '@cdo/apps/componentLibrary/tooltip';
import {TooltipProps} from '@cdo/apps/componentLibrary/tooltip/Tooltip';
import styles from './tabs.module.scss';
import TabPanel from './TabPanel';

export type Tab = {
  title: string;
  content: React.ReactNode;
  isReadOnly: boolean;
};

interface TabsProps {
  tabs: Tab[];
  // Identifier used for ARIA properties
  // to differentiate between uses of this component on the page.
  name: string;
  initialActiveIndex?: number;
}

const Tabs: React.FunctionComponent<TabsProps> = ({
  tabs,
  name,
  initialActiveIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(
    initialActiveIndex >= 0 && initialActiveIndex < tabs.length
      ? initialActiveIndex
      : 0
  );

  // Check to make sure active index is always within bounds whenever tabs or activeIndex update
  useEffect(() => {
    if (tabs.length <= activeIndex && tabs.length > 0) {
      setActiveIndex(0);
    }
  }, [tabs, activeIndex, setActiveIndex]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };

  const nameStripped = name.replace(' ', '-');
  const getTabButtonId = (index: number) => `${nameStripped}-tab-${index}`;
  const getTabPanelId = (index: number) => `${nameStripped}-panel-${index}`;
  const tooltipArgs: TooltipProps = {
    text: 'View only',
    direction: 'onRight',
    tooltipId: 'tooltipId',
  };

  return (
    <>
      <div className={styles.tabsContainer}>
        <ul role="tablist" className={styles.tabsList}>
          {tabs.map((tab, index) => {
            return (
              <li
                role="presentation"
                className={classNames(
                  styles.tab,
                  index === activeIndex && styles.active
                )}
                key={index}
              >
                <TooltipOverlay key={tooltipArgs.tooltipId}>
                  <button
                    type="button"
                    role="tab"
                    aria-describedby={tooltipArgs.tooltipId}
                    aria-selected={activeIndex === index}
                    aria-controls={getTabPanelId(index)}
                    id={getTabButtonId(index)}
                    onClick={() => handleTabClick(index)}
                    className={classNames(
                      index === activeIndex && styles.active
                    )}
                  >
                    {tab.title}
                    {tab.isReadOnly && (
                      <FontAwesomeV6Icon
                        iconName="lock"
                        iconStyle="solid"
                        className={styles.tabIcon}
                      />
                    )}
                  </button>
                  {tab.isReadOnly && <Tooltip {...tooltipArgs} />}
                </TooltipOverlay>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.tabPanelsContainer}>
        {tabs.map((tab, index) => {
          return (
            <TabPanel
              key={index}
              content={tab.content}
              isActive={index === activeIndex}
              id={getTabPanelId(index)}
              labelledBy={getTabButtonId(index)}
            />
          );
        })}
      </div>
    </>
  );
};

export default Tabs;
