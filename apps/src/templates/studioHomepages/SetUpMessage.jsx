import React, {PropTypes} from 'react';
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
    width: styleConstants['content-width']-200,
    float: 'left',
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Gotham 5r',
    fontWeight: 'bold',
    color: color.teal,
    float: 'left',
    paddingTop: 25,
    paddingLeft: 25,
  },
  rtlHeading: {
    paddingRight: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 20,
    fontFamily: 'Gotham 5r',
    color: color.teal,
  },
  description: {
    width: styleConstants['content-width']-250,
    paddingTop: 5,
    paddingBottom: 25,
    paddingLeft: 25,
    fontSize: 14,
    color: color.charcoal,
    float: 'left'
  },
  rtlDescription: {
    paddingRight: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 14,
    color: color.charcoal
  },
  button: {
    float: 'right',
    marginRight: 25,
    marginTop: 28,
  },
  rtlButton: {
    marginRight: 50,
    marginBottom: 80
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
    <div style={styles.wordBox}>
      <div style={isRtl ? styles.rtlHeading : styles.heading}>
        {headingText}
      </div>
      <div style={isRtl ? styles.rtlDescription : styles.description}>
        {descriptionText}
      </div>
    </div>
    <Button
      href={buttonUrl}
      onClick={onClick}
      className={buttonClass}
      color={Button.ButtonColor.gray}
      text={buttonText}
      style={isRtl ? styles.rtlButton : styles.button}
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
export default SetUpMessage;
