import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
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
  image: {
    position: 'absolute',
  },
  textbox: {
    position: 'absolute',
    width: 275,
    padding: 20
  },
  title: {
    fontSize: 24,
    paddingBottom: 10,
    fontFamily:'"Gotham 7r", sans-serif',
    color: color.white,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  description: {
    fontSize: 14,
    lineHeight: "21px",
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    height: 80
  },
  ltr: {
    float: 'left',
  },
  rtl: {
    float: 'right',
  },
  rtlMargin: {
    marginRight: 160
  },
  ltrMargin: {
    marginRight: 0
  }
};

class ImageResourceCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {

    const { title, description, buttonText, link, image, isRtl } = this.props;
    const localeStyle = isRtl ? styles.rtl : styles.ltr;
    const uncoverImage = isRtl ? styles.rtlMargin : styles.ltrMargin;

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
      <div style={{...styles.card, ...localeStyle}}>
        <div style={styles.image}>
          <img src={imgSrc}/>
        </div>
        <div style={{...styles.textbox, ...localeStyle, ...uncoverImage}}>
          <div style={styles.title}>
            {title}
          </div>
          <div style={styles.description}>
            {description}
          </div>
          <br/>
          <Button
            href={link}
            color={Button.ButtonColor.gray}
            text={buttonText}
            style={styles.button}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  isRtl: state.isRtl,
}))(ImageResourceCard);
