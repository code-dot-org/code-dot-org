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
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 10,
    fontFamily:'"Gotham 4r", sans-serif',
    color: color.white,
  },
  title: {
    paddingTop: 25,
    fontSize: 18,
    fontWeight: 'bold',
    width: 260
  },
  description: {
    fontSize: 14,
    lineHeight: "21px",
    height: 130
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
