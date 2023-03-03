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
      cardStyle = {...cardStyle, background: color.neutral_light};
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
          <h4 style={titleStyle}>{title}</h4>
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
    display: 'inline-block',
    boxSizing: 'border-box',
    // Set width to form a three-column layout on 970px teacher dashboard.
    width: 312,
    minHeight: 150,
    padding: 8,
    margin: '8px 0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.neutral_dark20,
    borderRadius: 1,
    background: color.neutral_white,
    cursor: 'pointer'
  },
  title: {
    paddingBottom: 4,
    marginBottom: 0,
    fontSize: '1.5em',
    lineHeight: '18px',
    fontFamily: '"Barlow Semi Condensed Medium", sans-serif',
    zIndex: 2,
    color: color.neutral_dark
  },
  subtitle: {
    paddingBottom: 0,
    fontSize: 12,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    zIndex: 2,
    color: color.neutral_dark
  },
  description: {
    paddingTop: 12,
    fontSize: 12,
    lineHeight: '18px',
    fontFamily: '"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.neutral_dark
  }
};
export default LoginTypeCard;
