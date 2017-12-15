import React, { PropTypes, Component } from 'react';
import ContentContainer from './ContentContainer';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import Responsive from '../responsive';
import shapes from './studioHomepages/shapes';

/**
 * A responsive row of 3 VerticalImageResourceCards, that stack on mobile.
 */

export default class VerticalImageResourceCardRow extends Component {
  static propTypes = {
    responsive: PropTypes.instanceOf(Responsive).isRequired,
    cards: shapes.courses,
  };

  render() {
    const { cards } = this.props;
    return (
      <ContentContainer
        heading=""
        description=""
        hideBottomMargin={true}
      >
        <ResourceCardResponsiveContainer>
          {cards.map(
            (card, cardIndex) => (
              <VerticalImageResourceCard
                key={cardIndex}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                link={card.link}
                image={card.image}
                MCShareLink={card.MCShareLink}
              />
            )
          )}
        </ResourceCardResponsiveContainer>
      </ContentContainer>
    );
  }
}
