import React, {Component} from 'react';
import i18n from '@cdo/locale';
import onClickOutside from 'react-onclickoutside';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import style from './control-buttons.module.scss';
import JavalabButton from './JavalabButton';
import JavalabDropdown from './components/JavalabDropdown';

/**
 * A button that drops down to a set of clickable options, and closes itself if
 * you click on the button, or outside of the dropdown.
 */
export class JavalabSettings extends Component {
  static propTypes = {
    children: props => {
      React.Children.map(props.children, child => {
        if (child.type !== 'button') {
          throw new Error('only accepts children of type <button/>');
        }
        if (!child.props.onClick) {
          throw new Error('each child must have an onclick');
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
    const {dropdownOpen} = this.state;

    return (
      <div className={style.main}>
        {dropdownOpen && (
          <JavalabDropdown className={style.dropdown}>
            {React.Children.map(this.props.children, (child, index) => (
              <button
                {...child.props}
                onClick={event => this.onClickChild(event, child.props)}
                key={index}
                type="button"
                style={child.props.style}
              />
            ))}
          </JavalabDropdown>
        )}
        <JavalabButton
          icon={<FontAwesome icon="cog" />}
          text={i18n.settings()}
          className={classNames(
            style.buttonWhite,
            dropdownOpen && style.selected
          )}
          onClick={this.toggleDropdown}
          isHorizontal
        />
      </div>
    );
  }
}

export default onClickOutside(JavalabSettings);
