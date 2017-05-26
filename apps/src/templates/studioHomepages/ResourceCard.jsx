import React from 'react';
import ProgressButton from '../progress/ProgressButton';
import color from "../../util/color";

const styles = {
  card: {
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    width: 458,
    float: 'left',
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
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
  button: {
    marginLeft: 20,
    marginTop: 140,
    position: 'absolute',
    zIndex: 2,
  }
};

const ResourceCard = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired
  },

  render() {
    const { title, description, buttonText, link, image } = this.props;
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
      <div style={styles.card}>
        <img src={imgSrc} style={styles.image}/>
        <div style={styles.title}>
          {title}
        </div>
        <div style={styles.description}>
          {description}
        </div>
        <ProgressButton
          href={link}
          color={ProgressButton.ButtonColor.gray}
          text={buttonText}
          style={styles.button}
        />
      </div>
    );
  }
});

export default ResourceCard;
