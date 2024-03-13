import React, {useEffect, useState} from 'react';
import {Heading3} from '@cdo/apps/componentLibrary/typography';

const NavigationBar = () => {
  const [linksToHeadings, setLinksToHeadings] = useState([]);

  useEffect(() => {
    // Find all h1 elements with the class 'control-legend'
    const legends = document.querySelectorAll('h1.control-legend');

    const linksData = Array.from(legends).map(element => {
      return {
        text: element.textContent,
        target: element.getAttribute('data-target'),
      };
    });

    setLinksToHeadings(linksData);
  }, []); // Empty dependency array to run once on mount

  const handleClick = (event, target) => {
    event.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <div>
      <Heading3>Navigation</Heading3>
      <ul>
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

export default NavigationBar;
