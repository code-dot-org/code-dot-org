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
}

const Tabs: React.FunctionComponent<TabsProps> = ({tabs}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div>
      <div className={styles.tabsContainer}>
        <ul role="tablist" className={styles.tabsList}>
          {tabs.map((tab, index) => {
            return (
              <li
                role="presentation"
                className={classNames(
                  styles.tabContainer,
                  index === activeIndex && styles.active
                )}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-controls={`panel-${index}`}
                  id={`tab-${index}`}
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
            id={`panel-${index}`}
            labelledBy={`tab-${index}`}
          />
        );
      })}
    </div>
  );
};

export default Tabs;
