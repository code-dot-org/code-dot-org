import React from 'react';
import Button from '../Button';
import color from "../../util/color";

const styles = {
  card: {
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    width: 473,
    float: 'left',
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    background: color.teal
  },
  cardJumbo: {
    overflow: 'hidden',
    position: 'relative',
    height: 250,
    width: 310,
    float: 'left',
    marginBottom: 20,
    background: color.teal
  },
  image: {
    position: 'absolute',
  },
  title: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 18,
    fontFamily:'"Gotham 4r", sans-serif',
    zIndex: 2,
    position: 'absolute',
    color: color.white,
    fontWeight: 'bold'
  },
  rtlTitle: {
    paddingLeft: 20,
    paddingRight: 175,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 18,
    fontFamily:'"Gotham 4r", sans-serif',
    zIndex: 2,
    position: 'absolute',
    color: color.white,
    fontWeight: 'bold'
  },
  description: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 50,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    position: 'absolute',
    zIndex: 2,
    width: 270,
    color: color.white
  },
  rtlDescription: {
    paddingLeft: 20,
    paddingRight: 175,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 50,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    position: 'absolute',
    zIndex: 2,
    width: 270,
    color: color.white
  },
  button: {
    marginLeft: 20,
    marginTop: 140,
    position: 'absolute',
    zIndex: 2,
  },
  rtlButton: {
    marginRight: 175,
    marginTop: 140,
    position: 'absolute',
    zIndex: 2,
  }
};

const ResourceCard = React.createClass({
  propTypes: {
    isJumbo: React.PropTypes.bool,
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired,
    image: React.PropTypes.string,
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {

    const { isJumbo, title, description, buttonText, link, image, isRtl } = this.props;
    const filenameToImgUrl = {
      "teacher-community": require('@cdo/static/resource_cards/teachercommunity.png'),
      "guest-speaker": require('@cdo/static/resource_cards/findguestspeaker.png'),
      "professional-learning": require('@cdo/static/resource_cards/professionallearning.png'),
      "standards-framework": require('@cdo/static/resource_cards/standardsandframework.png'),
      "elementary": require('@cdo/static/resource_cards/elementary.png'),
      "middleschool": require('@cdo/static/resource_cards/middleschool.png'),
      "highschool": require('@cdo/static/resource_cards/highschool.png'),
      "hourofcode": require('@cdo/static/resource_cards/hourofcode.png'),
      "hourofcode2": require('@cdo/static/resource_cards/hourofcode2.png'),
    };
    const imgSrc = filenameToImgUrl[image];

    return (
      <div style={isJumbo ? styles.cardJumbo : styles.card}>
        {image && (
          <img src={imgSrc} style={styles.image}/>
        )}
        <div style={isRtl ? styles.rtlTitle : styles.title}>
          {title}
        </div>
        <div style={isRtl ? styles.rtlDescription : styles.description}>
          {description}
        </div>
        <br/>
        <Button
          href={link}
          color={Button.ButtonColor.gray}
          text={buttonText}
          style={isRtl ? styles.rtlButton : styles.button}
        />
      </div>
    );
  }
});

export default ResourceCard;
