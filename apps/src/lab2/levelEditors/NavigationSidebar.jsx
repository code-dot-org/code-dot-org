import React, {useEffect, useState} from 'react';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './navigation.module.scss';

const NavigationSidebar = () => {
  const [linksToHeadings, setLinksToHeadings] = useState([]);
  const [linksToSubHeadings, setLinksToSubHeadings] = useState([]);
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

    setLinksToHeadings(linksData);
    setLinksToSubHeadings(indentedLinksData);
    setOrganizedHeadings(processArrays(linksData, indentedLinksData));
  }, []); // Empty dependency array to run once on mount

  function processArrays(largeArr, smallArr) {
    const newArr = [];

    // Iterate over largeArr
    largeArr.forEach(largeItem => {
      // Use .find to check for the presence of largeItem's id in smallArr
      const smallItem = smallArr.find(item => item.id === largeItem.id);

      if (smallItem) {
        // If an item with the same id is found in smallArr, push that item to newArr
        newArr.push(smallItem);
      } else {
        // If not found, push the largeArr item to newArr
        newArr.push(largeItem);
      }
    });

    return newArr;
  }
  //Added console.log to pass check
  console.log(organizedHeadings);
  console.log(linksToSubHeadings);

  const handleClick = (event, element) => {
    event.preventDefault();
    if (element) {
      element.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <div className={moduleStyles.navBarContainer}>
      <Heading3>Navigation</Heading3>
      <ul className={moduleStyles.narrowList}>
        {linksToHeadings.map((link, index) => (
          <li key={index}>
            <a
              href={link.target}
              onClick={event => handleClick(event, link.target)}
            >
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationSidebar;
