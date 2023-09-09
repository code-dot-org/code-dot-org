import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '../util/color';
import Button from './Button';

import anotherhocPng from '@cdo/static/resource_cards/anotherhoc.png';
import applabmarketingPng from '@cdo/static/resource_cards/applabmarketing.png';
import applabcreateprojectPng from '@cdo/static/resource_cards/applabcreateproject.png';
import applabtutorialPng from '@cdo/static/resource_cards/applabtutorial.png';
import createaccountPng from '@cdo/static/resource_cards/createaccount.png';
import csfexpressPng from '@cdo/static/resource_cards/csfexpress.png';
import coursecatalogPng from '@cdo/static/resource_cards/coursecatalog.png';
import herominecraftPng from '@cdo/static/resource_cards/herominecraft.png';
import oldminecraftPng from '@cdo/static/resource_cards/oldminecraft.png';
import minecraftmarketingPng from '@cdo/static/resource_cards/minecraftmarketing.png';
import aquaticminecraftPng from '@cdo/static/resource_cards/aquaticminecraft.png';
import codeorgteacherPng from '@cdo/static/resource_cards/codeorgteacher.png';
import thirdpartyteacherPng from '@cdo/static/resource_cards/thirdpartyteacher.png';
import thirdpartyteachersmallPng from '@cdo/static/resource_cards/thirdpartyteachersmall.png';
import makerPng from '@cdo/static/resource_cards/maker.png';
import dancepartyPng from '@cdo/static/resource_cards/danceparty.png';
import danceparty2Png from '@cdo/static/resource_cards/danceparty2.png';
import danceparty2_2019Png from '@cdo/static/resource_cards/danceparty2-2019.png';
import danceparty_sloth_2019Png from '@cdo/static/resource_cards/danceparty-sloth-2019.png';

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

    /*
      import anotherhocPng,
import applabmarketingPng,
import applabcreateprojectPng,
import applabtutorialPng,
import createaccountPng,
import csfexpressPng,
import coursecatalogPng,
import herominecraftPng,
import oldminecraftPng,
import minecraftmarketingPng,
import aquaticminecraftPng,
import codeorgteacherPng,
import thirdpartyteacherPng,
import thirdpartyteachersmallPng,
import makerPng,
import dancepartyPng,
import danceparty2Png,
import danceparty2_2019Png,
import danceparty_sloth_2019Png,*/

    const filenameToImgUrl = {
      'another-hoc': anotherhocPng,
      'applab-marketing': applabmarketingPng,
      'applab-project': applabcreateprojectPng,
      'applab-tutorial': applabtutorialPng,
      'create-account': createaccountPng,
      'csf-express': csfexpressPng,
      'course-catalog': coursecatalogPng,
      'hero-minecraft': herominecraftPng,
      'old-minecraft': oldminecraftPng,
      'minecraft-marketing': minecraftmarketingPng,
      'aquatic-minecraft': aquaticminecraftPng,
      'codeorg-teacher': codeorgteacherPng,
      'third-party-teacher': thirdpartyteacherPng,
      'third-party-teacher-small': thirdpartyteachersmallPng,
      maker: makerPng,
      'dance-party': dancepartyPng,
      'dance-party-2': danceparty2Png,
      'dance-party-2-2019': danceparty2_2019Png,
      'dance-party-sloth-2019': danceparty_sloth_2019Png,
      course2: pegasus('/shared/images/courses/logo_tall_course2.jpg'),
      course3: pegasus('/shared/images/courses/logo_tall_course3.jpg'),
      course4: pegasus('/shared/images/courses/logo_tall_course4.jpg'),
      courseB: pegasus('/shared/images/courses/logo_tall_courseb.png'),
      courseC: pegasus('/shared/images/courses/logo_tall_coursec.png'),
      courseD: pegasus('/shared/images/courses/logo_tall_coursed.png'),
      courseE: pegasus('/shared/images/courses/logo_tall_coursee.png'),
      courseF: pegasus('/shared/images/courses/logo_tall_coursef.png'),
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
    fontFamily: '"Gotham 4r", sans-serif',
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
