import React, { Component, PropTypes } from 'react';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import Responsive from '../responsive';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';

const styles = {
  heading: {
    width: '100%'
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5,
  },
  clear: {
    clear: 'both'
  },
  spacer: {
    height: 50,
  },
};

export default class TeachersBeyondHoc extends Component {
  static propTypes = {
    responsive: PropTypes.instanceOf(Responsive).isRequired,
  };

  render() {
    const { responsive } = this.props;
    const desktop = (responsive.isResponsiveCategoryActive('lg') || responsive.isResponsiveCategoryActive('md'));

    const codeorgTeacherImage = desktop ? "codeorg-teacher" : "course-catalog";

    const thirdPartyTeacherImage = desktop ? "third-party-teacher" : "third-party-teacher-small";

    const thirdPartyTeacherTitle = desktop ? i18n.congratsTeacherExternalTitle() : i18n.congratsTeacherExternalTitleShort();

    const headingStyle = desktop ? styles.heading : styles.mobileHeading;

    const cards = [
      {
        title: i18n.congratsTeacherCodeOrgTitle(),
        description: i18n.congratsTeacherCodeOrgDesc(),
        buttonText: i18n.congratsTeacherCodeOrgButton(),
        link: '/courses?view=teacher',
        image: codeorgTeacherImage
      },
      {
        title: thirdPartyTeacherTitle,
        description: i18n.congratsTeacherExternalDesc(),
        buttonText: i18n.congratsTeacherExternalButton(),
        link: pegasus('/educate/curriculum/3rd-party'),
        image: thirdPartyTeacherImage
      }
    ];

    return (
      <div>
        <h1 style={headingStyle}>
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
                link={card.link}
                jumbo={desktop}
                image={card.image}
              />
            )
          )}
        </ResourceCardResponsiveContainer>
        <div style={styles.clear}/>
        {!desktop && (
          <div style={styles.spacer}/>
        )}
      </div>
    );
  }
}
