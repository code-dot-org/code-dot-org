import React, {Component} from 'react';

import i18n from '@cdo/locale';
import ResourceCard from '@cdo/apps/templates/studioHomepages/ResourceCard';
import ResourceCardResponsiveContainer from '@cdo/apps/templates/studioHomepages/ResourceCardResponsiveContainer';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const CARDS = [
  {
    title: i18n.projectTypeApplab(),
    description: i18n.projectDescriptionApplab(),
    link: '/applab'
  },
  {
    title: i18n.projectTypeGamelab(),
    description: i18n.projectDescriptionGamelab(),
    link: '/gamelab'
  },
  {
    title: i18n.projectTypeWeblab(),
    description: i18n.projectDescriptionWeblab(),
    link: '/weblab'
  }
];

export default class MiddleHighResourceCards extends Component {
  render() {
    return (
      <ResourceCardResponsiveContainer>
        {CARDS.map(card => (
          <ResourceCard
            description={card.description}
            key={card.title}
            link={pegasus(card.link)}
            title={card.title}
            buttonText={i18n.learnMore()}
          />
        ))}
      </ResourceCardResponsiveContainer>
    );
  }
}
