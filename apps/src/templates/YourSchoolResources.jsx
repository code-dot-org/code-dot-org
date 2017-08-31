import React, {Component} from 'react';
import Radium from 'radium';
import ContentContainer from './ContentContainer';
import ResourceCard from './studioHomepages/ResourceCard';
import styleConstants from '../styleConstants';
import i18n from "@cdo/locale";
import _ from 'lodash';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between"
  },
  regularRow: {
    marginBottom: 20
  }
};

class YourSchoolResources extends Component {

  cards = [
    {
      heading: i18n.teachers(),
      path: 'educate'
    },
    {
      heading: i18n.administrators(),
      path: 'educate/district'
    },
    {
      heading: i18n.parents(),
      path: 'promote/letter'
    },
  ];

  render() {
    return (
      <ContentContainer isRtl={false}>
        {_.chunk(this.cards, 3).map(
          (rowCards, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                ...styles.container,
                ...(rowIndex === 0 && styles.regularRow)
              }}
            >
              {rowCards.map(
                (card, cardIndex) => (
                  <ResourceCard
                    key={cardIndex}
                    title={card.heading}
                    buttonText={i18n.learnMore()}
                    link={pegasus(`/${card.path}`)}
                    isRtl={false}
                  />
                )
              )}
            </div>
          )
        )}
      </ContentContainer>
    );
  }
}

export default Radium(YourSchoolResources);
