import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import Button from '../Button';
import color from "../../util/color";

// If you want to include an image, you're probably looking for a ImageResourceCard.

const styles = {
  card: {
    height: 250,
    width: 310,
    background: color.teal
  },
  card_allow_wrap: {
    position: 'relative'
  },
  text: {
    paddingLeft: 20,
    paddingRight: 20,
    color: color.white,
  },
  title: {
    fontFamily: '"Gotham 7r", sans-serif',
    paddingTop: 20,
    paddingBottom: 15,
    fontSize: 27,
    width: 260,
    display: 'inline',
  },
  title_no_wrap: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  title_allow_wrap: {
    lineHeight: '110%'
  },
  description: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    lineHeight: "21px",
    height: 140,
    width: 260
  },
  button: {
    marginLeft: 20,
    marginRight: 20,
  },
  button_allow_wrap: {
    position: 'absolute',
    bottom: 20,
    left: 0,
  },
  ltr: {
    float: 'left',
  },
  rtl: {
    float: 'right',
  },
};

class ResourceCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    allowWrap: PropTypes.bool
  };

  render() {

    const { title, description, buttonText, link, isRtl, allowWrap } = this.props;
    const localeStyle = isRtl ? styles.rtl : styles.ltr;
    let buttonStyles = [styles.button];
    let cardStyles = [styles.card, localeStyle];
    let titleStyles = [styles.title, styles.text, localeStyle];
    if (allowWrap) {
      buttonStyles.push(styles.button_allow_wrap);
      cardStyles.push(styles.card_allow_wrap);
      titleStyles.push(styles.title_allow_wrap);
    } else {
      titleStyles.push(styles.title_no_wrap);
    }

    return (
      <div style={cardStyles}>
        <div style={titleStyles}>
          {title}
        </div>
        <div style={[styles.text, styles.description, localeStyle]}>
          {description}
        </div>
        <br/>
        <Button
          href={link}
          color={Button.ButtonColor.gray}
          text={buttonText}
          style={buttonStyles}
        />
      </div>
    );
  }
}

export default Radium(ResourceCard);
