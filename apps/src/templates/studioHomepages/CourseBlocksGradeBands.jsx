import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
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
    responsiveSize: PropTypes.string.isRequired,
  };

  render() {
    return (
      <ResourceCardResponsiveContainer>
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

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(CourseBlocksGradeBands);
