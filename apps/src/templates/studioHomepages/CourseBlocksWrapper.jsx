import PropTypes from 'prop-types';
import React, {Component} from 'react';

import ResourceCard from '@cdo/apps/templates/studioHomepages/resourceCards/ResourceCard';
import ResourceCardResponsiveContainer from '@cdo/apps/templates/studioHomepages/resourceCards/ResourceCardResponsiveContainer';

import ContentContainer from '../ContentContainer';

class CourseBlocksWrapper extends Component {
  static propTypes = {
    cards: PropTypes.array.isRequired,
    heading: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    linkText: PropTypes.string,
    hideBottomMargin: PropTypes.bool,
  };

  render() {
    return (
      <ContentContainer
        heading={this.props.heading}
        description={this.props.description}
        link={this.props.link}
        linkText={this.props.linkText}
        hideBottomMargin={this.props.hideBottomMargin}
      >
        <ResourceCardResponsiveContainer>
          {this.props.cards.map((card, cardIndex) => (
            <ResourceCard
              linkId={card.linkId}
              linkClass={card.linkClass}
              key={cardIndex}
              title={card.heading}
              description={card.description}
              buttonText={card.buttonText}
              link={card.path}
              callout={card.callout}
            />
          ))}
        </ResourceCardResponsiveContainer>
      </ContentContainer>
    );
  }
}

export default CourseBlocksWrapper;
