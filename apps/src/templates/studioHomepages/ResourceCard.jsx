import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import Button from '../Button';
import color from "../../util/color";
import { connect } from 'react-redux';

// If you want to include an image, you're probably looking for a ImageResourceCard.

const styles = {
  card: {
    height: 250,
    width: 310,
    background: color.teal
  },
  cardAllowWrap: {
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
  titleNoWrap: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  titleAllowWrap: {
    lineHeight: '1.1'
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
  buttonAllowWrap: {
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
      buttonStyles.push(styles.buttonAllowWrap);
      cardStyles.push(styles.cardAllowWrap);
      titleStyles.push(styles.titleAllowWrap);
    } else {
      titleStyles.push(styles.titleNoWrap);
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

export default connect(state => ({
  isRtl: state.isRtl,
}))(Radium(ResourceCard));
