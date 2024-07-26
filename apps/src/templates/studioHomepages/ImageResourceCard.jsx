import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';

import color from '../../util/color';

class ImageResourceCard extends Component {
  static propTypes = {
    altText: PropTypes.string,
    title: PropTypes.string.isRequired,
    callout: PropTypes.string,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  getImage() {
    return require(`@cdo/static/resource_cards/${this.props.image}`);
  }

  render() {
    const {altText, title, callout, description, buttonText, link, isRtl} =
      this.props;

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
            useAsLink={true}
            href={link}
            ariaLabel={buttonText}
            color={buttonColors.purple}
            text={buttonText}
            size="s"
          />
        </div>
        <img style={styles.image} src={this.getImage()} alt={altText} />
      </div>
    );
  }
}

ImageResourceCard.defaultProps = {
  altText: '',
};

const styles = {
  card: {
    display: 'flex',
    height: 200,
    width: 473,
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.neutral_dark20,
    background: color.neutral_light,
    color: color.neutral_dark,
  },
  image: {
    width: 158,
  },
  textbox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    width: 315,
    padding: 20,
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 24,
    paddingBottom: 10,
    ...fontConstants['main-font-bold'],
    whiteSpace: 'nowrap',
  },
  callout: {
    flex: 'none',
    fontSize: 14,
    paddingBottom: 10,
    margin: '0px 8px',
    ...fontConstants['main-font-semi-bold'],
    color: color.white,
  },
  description: {
    fontSize: 14,
    lineHeight: '21px',
    ...fontConstants['main-font-regular'],
    height: 80,
  },
  button: {
    alignSelf: 'flex-start',
  },
  rtl: {
    direction: 'rtl',
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(ImageResourceCard);
