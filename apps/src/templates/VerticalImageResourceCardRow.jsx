import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ContentContainer from './ContentContainer';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import i18n from "@cdo/locale";
import shapes from './studioHomepages/shapes';

/**
 * A responsive row of 3 VerticalImageResourceCards, that stack on mobile.
 */

class VerticalImageResourceCardRow extends Component {
  static propTypes = {
    cards: shapes.courses,
    isRtl: PropTypes.bool.isRequired,
  };

  render() {
    const { cards, isRtl } = this.props;

    return (
      <ContentContainer
        heading=""
        description=""
        hideBottomMargin={true}
        isRtl={isRtl}
      >
        <ResourceCardResponsiveContainer>
          {cards.map(
            (card, cardIndex) => (
              <VerticalImageResourceCard
                key={cardIndex}
                title={card.title}
                description={card.description}
                buttonText={i18n.learnMore()}
                link={card.link}
                image={card.image}
              />
            )
          )}
        </ResourceCardResponsiveContainer>
      </ContentContainer>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(VerticalImageResourceCardRow);
