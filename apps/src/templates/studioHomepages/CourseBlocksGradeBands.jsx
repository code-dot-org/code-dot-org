import React, {Component, PropTypes} from 'react';
import  ResourceCard from './ResourceCard';
import styleConstants from '../../styleConstants';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between"
  }
};

class CourseBlocksTeacherGradeBands extends Component {
  static propTypes = {
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        heading: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
      })
    ).isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {
    return (
      <div style={styles.container}>
        {this.props.cards.slice(0, 3).map(
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
      </div>
    );
  }
}

export default CourseBlocksTeacherGradeBands;
