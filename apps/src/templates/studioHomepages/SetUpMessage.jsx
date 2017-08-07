import React, {PropTypes} from 'react';
import Radium from 'radium';
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import Button from "../Button";

const styles = {
  section: {
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    borderStyle: 'dashed',
    borderWidth: 5,
    borderColor: color.border_gray,
    boxSizing: "border-box"
  },
  wordBox: {
    width: styleConstants['content-width']-225,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Gotham 5r',
    fontWeight: 'bold',
    color: color.teal,
    paddingTop: 25,
  },
  description: {
    fontSize: 14,
    color: color.charcoal,
    width: styleConstants['content-width']-250,
    paddingTop: 5,
    paddingBottom: 25,
  },
  button: {
    marginTop: 28,
    marginLeft: 25,
    marginRight: 25
  },
  ltr: {
    float: 'left',
    paddingLeft: 25,
  },
  rtl: {
    float: 'right',
    paddingRight: 25,
  },
  clear: {
    clear: 'both'
  }
};

const SetUpMessage = ({
  isRtl,
  headingText,
  descriptionText,
  className,
  buttonText,
  buttonUrl,
  buttonClass,
  onClick,
}) => (
  <div style={styles.section} className={className}>
    <div style={[styles.wordBox, isRtl ? styles.rtl : styles.ltr, {padding:0}]}>
      <div style={[styles.heading, isRtl ? styles.rtl : styles.ltr]}>
        {headingText}
      </div>
      <div style={[styles.description, isRtl ? styles.rtl : styles.ltr]}>
        {descriptionText}
      </div>
    </div>
    <Button
      href={buttonUrl}
      onClick={onClick}
      className={buttonClass}
      color={Button.ButtonColor.gray}
      text={buttonText}
      style={[styles.button, isRtl ? styles.ltr : styles.rtl]}
    />
    <div style={styles.clear}/>
  </div>
);
SetUpMessage.propTypes = {
  isRtl: PropTypes.bool,
  headingText: PropTypes.string.isRequired,
  descriptionText: PropTypes.string.isRequired,
  className: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  buttonUrl: PropTypes.string,
  buttonClass: PropTypes.string,
  onClick: PropTypes.func,
};
export default Radium(SetUpMessage);
