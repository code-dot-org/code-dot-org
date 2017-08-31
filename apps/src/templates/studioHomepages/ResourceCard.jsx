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
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  description: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    lineHeight: "21px",
    height: 140
  },
  button: {
    marginLeft: 20,
    marginRight: 20,
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
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {

    const { title, description, buttonText, link, isRtl } = this.props;
    const localeStyle = isRtl ? styles.rtl : styles.ltr;

    return (
      <div style={[styles.card, localeStyle]}>
        <div style={[styles.text, styles.title, localeStyle]}>
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
          style={[styles.button]}
        />
      </div>
    );
  }
}

export default Radium(ResourceCard);
