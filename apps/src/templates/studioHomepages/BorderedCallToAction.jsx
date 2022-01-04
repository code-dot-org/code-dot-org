import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import Button from '../Button';
import {navigateToHref} from '@cdo/apps/utils';

const BorderedCallToAction = props => {
  const {
    isRtl,
    headingText,
    descriptionText,
    className,
    buttonText,
    buttonUrl,
    buttonClass,
    onClick,
    solidBorder
  } = props;

  const localeStyle = isRtl ? styles.right : styles.left;
  const buttonLocaleStyle = isRtl ? styles.left : styles.right;
  const borderStyle = solidBorder ? styles.solidBorder : styles.dashedBorder;

  return (
    <div style={[styles.outerBox, borderStyle]} className={className}>
      <div style={[styles.wordBox, localeStyle]}>
        <div style={[styles.heading, localeStyle]}>{headingText}</div>
        <div style={[styles.description, localeStyle]}>{descriptionText}</div>
      </div>
      <Button
        onClick={onClick || (() => navigateToHref(buttonUrl))}
        className={buttonClass}
        color={Button.ButtonColor.gray}
        text={buttonText}
        style={[styles.button, buttonLocaleStyle]}
      />
    </div>
  );
};

BorderedCallToAction.defaultProps = {
  buttonColor: Button.ButtonColor.gray
};

BorderedCallToAction.propTypes = {
  isRtl: PropTypes.bool,
  headingText: PropTypes.string.isRequired,
  descriptionText: PropTypes.string.isRequired,
  className: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  buttonUrl: PropTypes.string,
  buttonClass: PropTypes.string,
  buttonColor: PropTypes.oneOf(Object.keys(Button.ButtonColor)),
  onClick: PropTypes.func,
  solidBorder: PropTypes.bool
};

const styles = {
  outerBox: {
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    borderColor: color.border_gray,
    boxSizing: 'border-box',
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between'
  },
  solidBorder: {
    borderStyle: 'solid',
    borderWidth: 1
  },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 5
  },
  wordBox: {
    paddingLeft: 25,
    paddingRight: 25
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Gotham 5r',
    fontWeight: 'bold',
    color: color.teal,
    paddingTop: 25
  },
  description: {
    fontSize: 14,
    color: color.charcoal,
    paddingTop: 5,
    paddingBottom: 25
  },
  button: {
    marginTop: 28,
    marginLeft: 25,
    marginRight: 25,
    paddingLeft: 25,
    paddingRight: 25
  }
};

export const UnconnectedBorderedCallToAction = BorderedCallToAction;

export default connect(state => ({
  isRtl: state.isRtl
}))(Radium(BorderedCallToAction));
