import React, {Component, PropTypes} from 'react';
import ResourceCard from './ResourceCard';
import ResourceCardResponsiveContainer from './ResourceCardResponsiveContainer';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

class CourseBlocksGradeBands extends Component {
  static propTypes = {
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        heading: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
      })
    ).isRequired,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  render() {
    return (
      <ResourceCardResponsiveContainer responsive={this.props.responsive}>
        {this.props.cards.map(
          (card, cardIndex) => (
            <ResourceCard
              key={cardIndex}
              title={card.heading}
              description={card.description}
              buttonText={i18n.learnMore()}
              link={pegasus(card.path)}
              isRtl={this.props.isRtl}
            />
          )
        )}
      </ResourceCardResponsiveContainer>
    );
  }
}

export default CourseBlocksGradeBands;
