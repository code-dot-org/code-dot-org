import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from './JavalabButton';
import JavalabDropdown from './components/JavalabDropdown';

/**
 * A button that drops down to a set of clickable links, and closes itself if
 * you click on the button, or outside of the dropdown.
 */
export class JavalabSettings extends Component {
  static propTypes = {
    style: PropTypes.object,
    children: props => {
      React.Children.map(props.children, child => {
        if (child.type !== 'a') {
          throw new Error('only accepts children of type <a/>');
        }
        if (!child.props.onClick) {
          throw new Error('each child must have an href or onclick');
        }
      });
    }
  };

  state = {
    dropdownOpen: false
  };

  expandDropdown = () => {
    this.setState({dropdownOpen: true});
  };

  collapseDropdown = () => {
    this.setState({dropdownOpen: false});
  };

  handleClickOutside = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    }
  };

  toggleDropdown = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    } else {
      this.expandDropdown();
    }
  };

  onClickChild = (event, childProps) => {
    this.collapseDropdown();
    childProps.onClick(event);
  };

  render() {
    const {style} = this.props;
    const {dropdownOpen} = this.state;
    const btnStyle = {
      ...styles.button,
      ...(dropdownOpen && styles.button.selected),
      ...style
    };

    return (
      <div style={styles.main}>
        {dropdownOpen && (
          <JavalabDropdown style={styles.dropdown}>
            {React.Children.map(this.props.children, (child, index) => (
              <a
                {...child.props}
                onClick={event => this.onClickChild(event, child.props)}
                key={index}
                style={child.props.style}
              />
            ))}
          </JavalabDropdown>
        )}
        <JavalabButton
          icon={<FontAwesome icon="cog" />}
          text={i18n.settings()}
          style={btnStyle}
          onClick={this.toggleDropdown}
          isHorizontal
        />
      </div>
    );
  }
}

export default onClickOutside(Radium(JavalabSettings));

const styles = {
  main: {
    display: 'inline-block',
    float: 'left'
  },
  button: {
    fontSize: 15,
    width: 140,
    backgroundColor: color.white,
    borderColor: color.dark_charcoal,
    color: color.dark_charcoal,
    fontFamily: '"Gotham 5r"',
    padding: '5px 12px',
    margin: '5px 0 5px 5px',
    justifyContent: 'center',
    ':hover': {
      color: color.dark_charcoal,
      boxShadow: 'none'
    },

    selected: {
      backgroundColor: color.lightest_gray,
      borderColor: color.lightest_gray,
      color: color.dark_charcoal
    }
  },
  dropdown: {
    bottom: 40,
    marginLeft: 5
  }
};
