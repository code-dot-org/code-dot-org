import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {marketing} from '@cdo/apps/lib/util/urlHelpers';

import color from '../util/color';

/**
 * A card used on /congrats to display information about a particular course or
 * HoC follow-up activity. Not to be confused with CourseCard, the larger
 * component used on /home for scripts and courses specific to a user.
 * ImageResourceCard is also similar, but has image and text aligned
 * horizontally. The jumbo version fits 2 across in a row.
 */

class VerticalImageResourceCard extends Component {
  static propTypes = {
    altText: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    MCShareLink: PropTypes.string,
    jumbo: PropTypes.bool,
    hasAdjustableHeight: PropTypes.bool,
  };

  render() {
    const {
      altText,
      title,
      description,
      link,
      buttonText,
      jumbo,
      MCShareLink,
      image,
      hasAdjustableHeight,
    } = this.props;
    const cardHeight = hasAdjustableHeight ? {} : styles.cardHeight;
    const cardStyle = jumbo
      ? {...styles.jumboCard, ...cardHeight}
      : {...styles.card, ...cardHeight};

    const imageHeight = hasAdjustableHeight ? {} : styles.imageHeight;
    const imageStyle = jumbo
      ? {...styles.jumboImage, ...imageHeight}
      : {...styles.image, ...imageHeight};

    const descriptionStyle = hasAdjustableHeight
      ? styles.description
      : {...styles.description, ...styles.descriptionHeight};

    const filenameToImgUrl = {
      'another-hoc': require('@cdo/static/resource_cards/anotherhoc.png'),
      'applab-marketing': require('@cdo/static/resource_cards/applabmarketing.png'),
      'applab-project': require('@cdo/static/resource_cards/applabcreateproject.png'),
      'applab-tutorial': require('@cdo/static/resource_cards/applabtutorial.png'),
      'create-account': require('@cdo/static/resource_cards/createaccount.png'),
      'csf-express': require('@cdo/static/resource_cards/csfexpress.png'),
      'course-catalog': require('@cdo/static/resource_cards/coursecatalog.png'),
      'hero-minecraft': require('@cdo/static/resource_cards/herominecraft.png'),
      'old-minecraft': require('@cdo/static/resource_cards/oldminecraft.png'),
      'minecraft-marketing': require('@cdo/static/resource_cards/minecraftmarketing.png'),
      'aquatic-minecraft': require('@cdo/static/resource_cards/aquaticminecraft.png'),
      'codeorg-teacher': require('@cdo/static/resource_cards/codeorgteacher.png'),
      'third-party-teacher': require('@cdo/static/resource_cards/thirdpartyteacher.png'),
      'third-party-teacher-small': require('@cdo/static/resource_cards/thirdpartyteachersmall.png'),
      maker: require('@cdo/static/resource_cards/maker.png'),
      'dance-party': require('@cdo/static/resource_cards/danceparty.png'),
      'dance-party-2': require('@cdo/static/resource_cards/danceparty2.png'),
      'dance-party-2-2019': require('@cdo/static/resource_cards/danceparty2-2019.png'),
      'dance-party-sloth-2019': require('@cdo/static/resource_cards/danceparty-sloth-2019.png'),
      course2: marketing('/shared/images/courses/logo_tall_course2.jpg'),
      course3: marketing('/shared/images/courses/logo_tall_course3.jpg'),
      course4: marketing('/shared/images/courses/logo_tall_course4.jpg'),
      courseB: marketing('/shared/images/courses/logo_tall_courseb.png'),
      courseC: marketing('/shared/images/courses/logo_tall_coursec.png'),
      courseD: marketing('/shared/images/courses/logo_tall_coursed.png'),
      courseE: marketing('/shared/images/courses/logo_tall_coursee.png'),
      courseF: marketing('/shared/images/courses/logo_tall_coursef.png'),
    };
    const imgSrc = filenameToImgUrl[image];

    return (
      <div style={cardStyle}>
        <div style={imageStyle}>
          <a href={link}>
            <img src={imgSrc} alt={altText} />
          </a>
        </div>
        <div>
          <div style={{...styles.text, ...styles.title}}>{title}</div>
          <div style={{...styles.text, ...descriptionStyle}}>
            {description}
            {MCShareLink && (
              <input
                type="text"
                style={{...styles.text, ...styles.shareLink}}
                value={MCShareLink}
                onChange={() => {}}
                onClick={e => e.target.select()}
              />
            )}
          </div>
          <Button
            __useDeprecatedTag
            href={link}
            color={Button.ButtonColor.gray}
            text={buttonText}
            style={{...styles.button}}
          />
        </div>
      </div>
    );
  }
}

VerticalImageResourceCard.defaultProps = {
  altText: '',
};

const styles = {
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: 308,
    backgroundColor: color.white,
  },
  jumboCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: 473,
    marginBottom: 20,
    backgroundColor: color.white,
  },
  cardHeight: {
    height: 440,
  },
  image: {
    width: 310,
  },
  jumboImage: {
    width: 473,
  },
  imageHeight: {
    height: 220,
  },
  text: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
  },
  title: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 15,
    fontSize: 20,
  },
  button: {
    margin: 20,
  },
  description: {
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 14,
    lineHeight: 1.5,
  },
  descriptionHeight: {
    height: 89,
  },
  shareLink: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    fontSize: 14,
    marginTop: 5,
    padding: 5,
    width: 258,
  },
};

export default VerticalImageResourceCard;
