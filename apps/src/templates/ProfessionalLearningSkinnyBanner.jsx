import React from 'react';

import {pegasus} from '@cdo/apps/util/urlHelpers';

import './professionalLearningSkinnyBanner.scss';
import bgDesktop from './images/superhero-banner-bg.png';
import bgTablet from './images/superhero-banner-half-blue.png';

export default function ProfessionalLearningSkinnyBanner() {
  const headerText = 'Help students become superheroes!';
  const text =
    'Join our highly supportive Professional Learning Program for middle and high school educators.';

  return (
    <aside className="professional-learning-banner">
      <a href={pegasus('/educate/professional-learning/middle-high')}>
        <img
          className="bg-desktop"
          src={bgDesktop}
          alt="Illustration of a young student wearing a superhero cape surrounded by a laptop, textbook, and apple"
        />
        <img
          className="bg-tablet"
          src={bgTablet}
          alt="Illustration of a young student wearing a superhero cape"
        />
        <div className="flex-wrapper">
          <div className="text-wrapper">
            <h1>{headerText}</h1>
            <p>{text}</p>
          </div>
          <span>Learn more</span>
        </div>
      </a>
    </aside>
  );
}
