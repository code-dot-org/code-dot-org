import React from 'react';
import ProgressButton from '../progress/ProgressButton';

const styles = {
  card: {
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    width: 400,
    margin: 20,
    float: 'left'
  },
  overlay: {
    background: 'linear-gradient(to right, rgba(2,130,132,.95), rgba(2,130,132,0))',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right:0,
    top:0,
    zIndex: 1,
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
    fontFamily: '"Gotham 3r", sans-serif',
    color: 'rgba(255, 255, 255, .9)',
    zIndex: 2,
    position: 'absolute'
  },
  description: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 50,
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    color: 'rgba(255, 255, 255, .9)',
    position: 'absolute',
    zIndex: 2,
    width: 250
  },
  button: {
    marginLeft: 20,
    marginTop: 140,
    position: 'absolute',
    zIndex: 2,
  }
};

const GradientNavCard = React.createClass({
  propTypes: {
    cardData: React.PropTypes.shape({
      title: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      image: React.PropTypes.string.isRequired,
      buttonText: React.PropTypes.string.isRequired,
      link: React.PropTypes.string.isRequired
    })
  },

  render() {
    const { cardData } = this.props;

    return (
      <div style={styles.card}>
        <img src={require('../../../static/navcard-placeholder.png')} style={styles.image}/>
        <h2 style={styles.title}>{cardData.title}</h2>
        <h4 style={styles.description}>{cardData.description}</h4>
        <ProgressButton href={cardData.link} color="gray" text={cardData.buttonText} style={styles.button}/>
        <div style={styles.overlay}/>
      </div>
    );
  }

});

export default GradientNavCard;
