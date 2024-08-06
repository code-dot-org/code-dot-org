import React, {Component} from 'react';

import ResourceCard from '@cdo/apps/templates/studioHomepages/ResourceCard';
import ResourceCardResponsiveContainer from '@cdo/apps/templates/studioHomepages/ResourceCardResponsiveContainer';
import {pegasus} from '@cdo/apps/util/urlHelpers';
import i18n from '@cdo/locale';

const CARDS = [
  {
    title: i18n.projectTypeApplab(),
    description: i18n.projectDescriptionApplab(),
    buttonText: i18n.learnMoreApplab(),
    link: '/applab',
  },
  {
    title: i18n.projectTypeGamelab(),
    description: i18n.projectDescriptionGamelab(),
    buttonText: i18n.learnMoreGamelab(),
    link: '/gamelab',
  },
  {
    title: i18n.projectTypeWeblab(),
    description: i18n.projectDescriptionWeblab(),
    buttonText: i18n.learnMoreWeblab(),
    link: '/weblab',
  },
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
            buttonText={card.buttonText}
          />
        ))}
      </ResourceCardResponsiveContainer>
    );
  }
}
