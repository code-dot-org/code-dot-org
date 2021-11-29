import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';
import {ResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';

class TeachersBeyondHoc extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired
  };

  render() {
    const {responsiveSize} = this.props;
    const desktop =
      responsiveSize === ResponsiveSize.lg ||
      responsiveSize === ResponsiveSize.md;

    const codeorgTeacherImage = desktop ? 'codeorg-teacher' : 'course-catalog';

    const thirdPartyTeacherImage = desktop
      ? 'third-party-teacher'
      : 'third-party-teacher-small';

    const thirdPartyTeacherTitle = desktop
      ? i18n.congratsTeacherExternalTitle()
      : i18n.congratsTeacherExternalTitleShort();

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
        <h1 style={headingStyle}>{i18n.congratsTeacherHeading()}</h1>
        <ResourceCardResponsiveContainer>
          {cards.map((card, cardIndex) => (
            <VerticalImageResourceCard
              key={cardIndex}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              link={card.link}
              jumbo={desktop}
              image={card.image}
            />
          ))}
        </ResourceCardResponsiveContainer>
        <div style={styles.clear} />
        {!desktop && <div style={styles.spacer} />}
      </div>
    );
  }
}

const styles = {
  heading: {
    width: '100%'
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5
  },
  clear: {
    clear: 'both'
  },
  spacer: {
    height: 50
  }
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(TeachersBeyondHoc);
