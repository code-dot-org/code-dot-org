import React, {Component} from 'react';

import ResourceCard from '@cdo/apps/templates/studioHomepages/ResourceCard';
import ResourceCardResponsiveContainer from '@cdo/apps/templates/studioHomepages/ResourceCardResponsiveContainer';

const CARDS = [
  {
    title: 'App Lab',
    description:
      'Start with App Lab:  an introductory programming environment where you can design an app, code with blocks or JavaScript to make it work, then share your app in seconds.',
    link: '/applab',
  },
  {
    title: 'Game Lab',
    description:
      'Ready to go further? Game Lab is a more complex programming environment where you can make animations and games with characters that run, jump, fly and more.',
    link: '/gamelab',
  },
  {
    title: 'Web Lab',
    description:
      'Web Lab is a programming environment where you can make simple web pages using HTML and CSS. Design your web pages and share your site in seconds.',
    link: '/weblab',
  },
];

export default class MiddleHighResourceCards extends Component {
  render() {
    return (
      <ResourceCardResponsiveContainer>
        {CARDS.map(card => (
          <ResourceCard {...card} key={card.title} buttonText="Learn More" />
        ))}
      </ResourceCardResponsiveContainer>
    );
  }
}
