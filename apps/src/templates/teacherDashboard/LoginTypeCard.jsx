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

    let {
      card: cardStyle,
      title: titleStyle,
      subtitle: subtitleStyle,
      description: descriptionStyle
    } = styles;
    if (this.state.hover) {
      cardStyle = {...cardStyle, borderColor: color.dark_charcoal};
      titleStyle = {...titleStyle, color: color.dark_charcoal};
      subtitleStyle = {...subtitleStyle, color: color.dark_charcoal};
      descriptionStyle = {...descriptionStyle, color: color.dark_charcoal};
    }

    return (
      <div
        style={cardStyle}
        onClick={onClick}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
        className={this.props.className}
      >
        <div>
          <div style={titleStyle}>{title}</div>
          {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
          <div style={descriptionStyle}>{description}</div>
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
