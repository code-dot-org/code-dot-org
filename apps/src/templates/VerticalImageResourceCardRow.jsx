import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContentContainer from './ContentContainer';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import shapes from './studioHomepages/shapes';

/**
 * A responsive row of 3 VerticalImageResourceCards, that stack on mobile.
 */

export default class VerticalImageResourceCardRow extends Component {
  static propTypes = {
    cards: shapes.courses,
    // For logging
    cardIds: PropTypes.array
  };

  render() {
    const {cards, cardIds} = this.props;
    return (
      <ContentContainer heading="" description="" hideBottomMargin={true}>
        <ResourceCardResponsiveContainer>
          {cards.map((card, cardIndex) => (
            <VerticalImageResourceCard
              key={cardIndex}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              link={card.link}
              image={card.image}
              MCShareLink={card.MCShareLink}
              cardIds={cardIds}
            />
          ))}
        </ResourceCardResponsiveContainer>
      </ContentContainer>
    );
  }
}
