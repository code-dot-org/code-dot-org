import React, { PropTypes, Component } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from "../util/color";
import Button from './Button';

const styles = {
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    position: 'relative',
    height: 440,
    width: 308,
    backgroundColor: color.white
  },
  jumboCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    position: 'relative',
    height: 440,
    width: 473,
    marginBottom: 20,
    backgroundColor: color.white
  },
  image: {
    width: 310,
    height: 220,
    position: 'absolute',
  },
  jumboImage: {
    width: 473,
    height: 220,
    position: 'absolute',
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
    height: 89
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
  ltr: {
    float: 'left',
  },
  rtl: {
    float: 'right',
    textAlign: 'right'
  },
};

/**
 * A card used on /congrats to display information about a particular course or
 * HoC follow-up activity. Not to be confused with CourseCard, the larger
 * component used on /home for scripts and courses specific to a user.
 * ImageResourceCard is also similar, but has image and text aligned
 * horizontally. The jumbo version fits 2 across in a row.
 */

class VerticalImageResourceCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    MCShareLink: PropTypes.string,
    jumbo: PropTypes.bool
  };

  render() {
    const { title, description, link, buttonText, isRtl, jumbo, MCShareLink, image } = this.props;
    const cardStyle = jumbo ? styles.jumboCard : styles.card;
    const imageStyle = jumbo ? styles.jumboImage : styles.image;
    const localeStyle = isRtl ? styles.rtl : styles.ltr;

    const filenameToImgUrl = {
      "another-hoc": require('@cdo/static/resource_cards/anotherhoc.png'),
      "applab-marketing": require('@cdo/static/resource_cards/applabmarketing.png'),
      "applab-project": require('@cdo/static/resource_cards/applabcreateproject.png'),
      "applab-tutorial": require('@cdo/static/resource_cards/applabtutorial.png'),
      "create-account": require('@cdo/static/resource_cards/createaccount.png'),
      "csf-express": require('@cdo/static/resource_cards/csfexpress.png'),
      "course-catalog": require('@cdo/static/resource_cards/coursecatalog.png'),
      "new-minecraft": require('@cdo/static/resource_cards/newminecraft.png'),
      "old-minecraft": require('@cdo/static/resource_cards/oldminecraft.png'),
      "minecraft-marketing": require('@cdo/static/resource_cards/minecraftmarketing.png'),
      "codeorg-teacher":
      require('@cdo/static/resource_cards/codeorgteacher.png'),
      "third-party-teacher":
      require('@cdo/static/resource_cards/thirdpartyteacher.png'),
      "third-party-teacher-small":
      require('@cdo/static/resource_cards/thirdpartyteachersmall.png'),
    };
    const imgSrc = filenameToImgUrl[image];

    return (
      <div style={[cardStyle, localeStyle]}>
        <div style={imageStyle}/>
          <img src={imgSrc}/>
        <div>
          <div style={[styles.text, styles.title, localeStyle]}>
            {title}
          </div>
          <div style={[styles.text, styles.description, localeStyle]}>
           {description}
           {MCShareLink && (
             <input
               type="text"
               style={[styles.text, styles.shareLink, localeStyle]}
               value={MCShareLink}
               onChange={() => {}}
               onClick={e => e.target.select()}
             />
           )}
          </div>
          <Button
            href={link}
            color={Button.ButtonColor.gray}
            text={buttonText}
            style={[styles.button, localeStyle]}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  isRtl: state.isRtl,
}))(Radium(VerticalImageResourceCard));
