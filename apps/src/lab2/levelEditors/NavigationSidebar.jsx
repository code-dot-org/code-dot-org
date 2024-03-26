import React, {useEffect, useState} from 'react';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './navigation.module.scss';

const NavigationSidebar = () => {
  const [linksToHeadings, setLinksToHeadings] = useState([]);

  useEffect(() => {
    const legends = document.querySelectorAll('h1.control-legend');

    const linksData = Array.from(legends).map(element => {
      return {
        text: element.textContent,
        target: element,
      };
    });

    setLinksToHeadings(linksData);
  }, []); // Empty dependency array to run once on mount

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
