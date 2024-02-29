import React, {useState} from 'react';
import classNames from 'classnames';

import styles from './tabs.module.scss';

const Tabs = ({children}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabClick = index => {
    setActiveIndex(index);
  };

  return (
    <div>
      <div className={styles.tabsContainer}>
        <ul
          style={{display: 'flex', listStyleType: 'none', margin: 0}}
          role="tablist"
          className="tab-list"
        >
          {React.Children.map(children, (child, index) => (
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
                // tabIndex={activeIndex === index ? 0 : -1}
                className={classNames(
                  styles.button,
                  index === activeIndex && styles.active
                )}
              >
                {child.props.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isActive: index === activeIndex,
          id: `panel-${index}`,
          labelledby: `tab-${index}`,
        })
      )}
    </div>
  );
};

export default Tabs;
