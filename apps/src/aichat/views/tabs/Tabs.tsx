import React, {useState} from 'react';
import classNames from 'classnames';

import styles from './tabs.module.scss';
import TabPanel from './TabPanel';

type Tab = {
  title: string;
  content: React.ReactNode;
};

interface TabsProps {
  tabs: Tab[];
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

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };

  const nameStripped = name.replace(' ', '-');
  const getTabButtonId = (index: number) => `${nameStripped}-tab-${index}`;
  const getTabPanelId = (index: number) => `${nameStripped}-panel-${index}`;

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
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-controls={getTabPanelId(index)}
                  id={getTabButtonId(index)}
                  onClick={() => handleTabClick(index)}
                  className={classNames(
                    styles.tabButton,
                    index === activeIndex && styles.active
                  )}
                >
                  {tab.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {tabs.map((tab, index) => {
        return (
          <TabPanel
            content={tab.content}
            isActive={index === activeIndex}
            id={getTabPanelId(index)}
            labelledBy={getTabButtonId(index)}
          />
        );
      })}
    </>
  );
};

export default Tabs;
