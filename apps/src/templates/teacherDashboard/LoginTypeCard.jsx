import React, {Component, PropTypes} from 'react';
import color from '../../util/color';
import Button from '../Button';

const styles = {
  card: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    // Set width to form a three-column layout on 970px teacher dashboard.
    width: 312,
    // Uniform height, even in different rows
    height: 240,
    paddingTop: 15,
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 15,
    marginBottom: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    background: color.white
  },
  title: {
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily:'"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.dark_charcoal,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    lineHeight: '18px',
    fontFamily:'"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.dark_charcoal,
    fontWeight: 'bold'
  },
  description: {
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 14,
    lineHeight: '18px',
    fontFamily: '"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.dark_charcoal
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
    zIndex: 2,
  },
};

class LoginTypeCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
  };

  render() {
    const {
      title,
      subtitle,
      description,
      buttonText,
      onClick,
      disabled
    } = this.props;

    return (
      <div style={styles.card} className={this.props.className}>
        <div>
          <div style={styles.title}>
            {title}
          </div>
          {subtitle &&
            <div style={styles.subtitle}>
              {subtitle}
            </div>
          }
          <div style={styles.description}>
            {description}
          </div>
        </div>
        <Button
          className="uitest-button"
          onClick={onClick}
          color={Button.ButtonColor.gray}
          text={buttonText}
          style={styles.button}
          disabled={disabled}
        />
      </div>
    );
  }
}
export default LoginTypeCard;
