import React from 'react';
import color from "./../util/color";
// import i18n from "@cdo/locale";
// import Button from './Button';

// let imgUrl = this.props.cardData.image

const styles = {
  card: {
    flex: 1,
    // backgroundImage: 'url(' + imgUrl + ')',
    backgroundSize: 'cover',
    overflow: 'hidden',
  },
  image: {
    flex: 1

  },
  title: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
   color: color.red
  },
  description: {

  }
};

const GradientNavCard = React.createClass({
  propTypes: {
    cardData: React.PropTypes
  },

  render() {
    const { cardData } = this.props;

    return (
      <div style={styles.card}>
          <h5>Hey, this is where the card goes.</h5>
          <h2 style={styles.title}>{cardData.title}</h2>
      </div>

    );
  }

});

export default GradientNavCard;
