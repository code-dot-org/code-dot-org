import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ResourceCard from './ResourceCard';
import ResourceCardResponsiveContainer from './ResourceCardResponsiveContainer';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

class CourseBlocksGradeBands extends Component {
  static propTypes = {
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        linkId: PropTypes.string,
        linkClass: PropTypes.string,
        heading: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
      })
    ).isRequired,
  };

  render() {
    return (
      <ResourceCardResponsiveContainer>
        {this.props.cards.map(
          (card, cardIndex) => (
            <ResourceCard
              linkId={card.linkId}
              linkClass={card.linkClass}
              key={cardIndex}
              title={card.heading}
              description={card.description}
              buttonText={i18n.learnMore()}
              link={pegasus(card.path)}
            />
          )
        )}
      </ResourceCardResponsiveContainer>
    );
  }
}

export default CourseBlocksGradeBands;
