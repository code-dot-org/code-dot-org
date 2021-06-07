import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '../Button';
import color from '../../util/color';

class ImageResourceCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    callout: PropTypes.string,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  getImage() {
    return require(`@cdo/static/resource_cards/${this.props.image}`);
  }

  render() {
    const {title, callout, description, buttonText, link, isRtl} = this.props;

    return (
      <div style={{...styles.card, ...(isRtl && styles.rtl)}}>
        <div style={styles.textbox}>
          <div>
            <div style={styles.titleContainer}>
              <div style={styles.title}>{title}</div>
              {callout && (
                <div style={styles.callout}>
                  <i>{callout}</i>
                </div>
              )}
            </div>
            <div style={styles.description}>{description}</div>
          </div>
          <Button
            __useDeprecatedTag
            href={link}
            color={Button.ButtonColor.gray}
            text={buttonText}
            style={styles.button}
          />
        </div>
        <img style={styles.image} src={this.getImage()} />
      </div>
    );
  }
}

const styles = {
  card: {
    display: 'flex',
    height: 200,
    width: 473,
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    background: color.teal
  },
  image: {
    width: 158
  },
  textbox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    width: 315,
    padding: 20
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'baseline'
  },
  title: {
    fontSize: 24,
    paddingBottom: 10,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    whiteSpace: 'nowrap'
  },
  callout: {
    flex: 'none',
    fontSize: 14,
    paddingBottom: 10,
    margin: '0px 8px',
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.white
  },
  description: {
    fontSize: 14,
    lineHeight: '21px',
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    height: 80
  },
  button: {
    alignSelf: 'flex-start'
  },
  rtl: {
    direction: 'rtl'
  }
};

export default connect(state => ({
  isRtl: state.isRtl
}))(ImageResourceCard);
