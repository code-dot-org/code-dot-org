import React, {useEffect, useState} from 'react';

import {Heading3} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './navigation.module.scss';

const NavigationSidebar = () => {
  const [organizedHeadings, setOrganizedHeadings] = useState([]);

  useEffect(() => {
    const legends = document.querySelectorAll('h1.control-legend');

    const indentedLegends = document.querySelectorAll(
      'div > h1.control-legend'
    );

    const linksData = Array.from(legends).map(element => {
      return {
        text: element.textContent,
        target: element,
        className: 'non-indented-heading',
      };
    });

    const indentedLinksData = Array.from(indentedLegends).map(element => {
      return {
        text: element.textContent,
        target: element,
        className: 'indented-heading',
      };
    });
    setOrganizedHeadings(processHeadings(linksData, indentedLinksData));
  }, []); // Empty dependency array to run once on mount

  function processHeadings(allHeadings, indentedHeadings) {
    const newArr = [];

    // Iterate over largeArr
    allHeadings.forEach(heading => {
      // Use .find to check for the presence of largeItem's id in smallArr
      const indentedHeading = indentedHeadings.find(
        item => item.text === heading.text
      );

      if (indentedHeading) {
        // If an item with the same id is found in smallArr, push that item to newArr
        newArr.push(indentedHeading);
      } else {
        // If not found, push the largeArr item to newArr
        newArr.push(heading);
      }
    });

    return newArr;
  }

  const handleClick = (event, element) => {
    event.preventDefault();
    if (element) {
      element.scrollIntoView({behavior: 'smooth'});
    }
  };

  function createMenuItemHtml(menuItem, index) {
    if (menuItem.className === 'indented-heading') {
      return (
        <ul key={'indented-list-' + index}>
          <li key={index}>
            <a
              href={menuItem.target}
              onClick={event => handleClick(event, menuItem.target)}
            >
              {menuItem.text}
            </a>
          </li>
        </ul>
      );
    } else {
      return (
        <li key={index}>
          <a
            href={menuItem.target}
            onClick={event => handleClick(event, menuItem.target)}
          >
            {menuItem.text}
          </a>
        </li>
      );
    }
  }

  return (
    <div className={moduleStyles.navBarContainer}>
      <Heading3>Navigation</Heading3>
      <ul className={moduleStyles.narrowList} key={'navigation-list'}>
        {organizedHeadings.map((menuItem, index) =>
          createMenuItemHtml(menuItem, index)
        )}
      </ul>
    </div>
  );
};

export default NavigationSidebar;
