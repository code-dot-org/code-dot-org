import React, { Component, PropTypes } from 'react';
import i18n from "@cdo/locale";
import color from "../util/color";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import Responsive from '../responsive';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';

const styles = {
  heading: {
    color: color.teal,
    width: '100%'
  }
};

export default class TeachersBeyondHoc extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
  };

  render() {
    const { isRtl, responsive } = this.props;
    const desktop = (responsive.isResponsiveCategoryActive('lg') || responsive.isResponsiveCategoryActive('md'));

    const cards = [
      {
        title: "Teach Code.org courses",
        description: "Description, description, description, description, Description, description, description, description, description, description, description, description",
        buttonText: i18n.learnMore(),
        link: "/courses?view=teacher",
      },
      {
        title: "Teach other courses",
        description: "Description, description, description, description, Description, description, description, description, description, description, description, description",
        buttonText: i18n.learnMore(),
        link: '/educate/curriculum/3rd-party'
      }
    ];

    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsTeacherHeading()}
        </h1>
        <ResourceCardResponsiveContainer responsive={responsive}>
          {cards.map(
            (card, cardIndex) => (
              <VerticalImageResourceCard
                key={cardIndex}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                link={pegasus(`/${card.link}`)}
                isRtl={isRtl}
                jumbo={desktop}
              />
            )
          )}
        </ResourceCardResponsiveContainer>
      </div>
    );
  }
}
