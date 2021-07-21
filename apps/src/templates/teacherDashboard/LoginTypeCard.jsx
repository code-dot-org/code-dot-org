import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../util/color';

class LoginTypeCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
  };

  state = {
    hover: false
  };

  toggleHover = () => {
    this.setState({hover: !this.state.hover});
  };

  render() {
    const {title, subtitle, description, onClick} = this.props;
    const cardStyles = {...styles.card};
    const titleStyles = {...styles.title};
    const subtitleStyles = {...styles.subtitle};
    const descriptionStyles = {...styles.description};

    if (this.state.hover) {
      cardStyles.borderColor = color.dark_charcoal;
      titleStyles.color = color.dark_charcoal;
      subtitleStyles.color = color.dark_charcoal;
      descriptionStyles.color = color.dark_charcoal;
    } else {
      cardStyles.borderColor = color.border_gray;
      titleStyles.color = color.charcoal;
      subtitleStyles.color = color.charcoal;
      descriptionStyles.color = color.charcoal;
    }

    return (
      <div
        style={cardStyles}
        onClick={onClick}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
        className={this.props.className}
      >
        <div>
          <div style={titleStyles}>{title}</div>
          {subtitle && <div style={subtitleStyles}>{subtitle}</div>}
          <div style={descriptionStyles}>{description}</div>
        </div>
      </div>
    );
  }
}

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
    flex: '0 0 auto',
    minHeight: 150,
    padding: 16,
    marginBottom: 5,
    marginLeft: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    borderRadius: 5,
    background: color.white
  },
  title: {
    paddingBottom: 6,
    fontSize: 24,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    zIndex: 2,
    color: color.charcoal
  },
  subtitle: {
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: '18px',
    fontFamily: '"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.charcoal
  },
  description: {
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 13,
    lineHeight: '18px',
    fontFamily: '"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.charcoal
  }
};
export default LoginTypeCard;
