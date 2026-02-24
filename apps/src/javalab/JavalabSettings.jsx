import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import onClickOutside from 'react-onclickoutside';
import {connect} from 'react-redux';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import javalabMsg from '@cdo/javalab/locale';
import msg from '@cdo/locale';

import {DisplayTheme} from './DisplayTheme';
import JavalabButton from './JavalabButton';
import {
  decreaseEditorFontSize,
  increaseEditorFontSize,
  setDisplayTheme,
} from './redux/viewRedux';

import style from './javalab-settings.module.scss';

/**
 * Displays the settings options for JavaLab.
 */
export class UnconnectedJavalabSettings extends Component {
  static propTypes = {
    // populated by Redux
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
    setDisplayTheme: PropTypes.func.isRequired,
    increaseEditorFontSize: PropTypes.func.isRequired,
    decreaseEditorFontSize: PropTypes.func.isRequired,
    canIncreaseFontSize: PropTypes.bool.isRequired,
    canDecreaseFontSize: PropTypes.bool.isRequired,
    editorFontSize: PropTypes.number.isRequired,
  };

  state = {
    dropdownOpen: false,
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

  // Sends redux call to update dark mode, which handles user preferences
  renderSwitchThemeButton = () => {
    const {displayTheme, setDisplayTheme} = this.props;
    const displayThemeString =
      displayTheme === DisplayTheme.DARK
        ? javalabMsg.displayThemeLightMode()
        : javalabMsg.displayThemeDarkMode();

    return (
      <button
        onClick={() => {
          setDisplayTheme(
            displayTheme === DisplayTheme.DARK
              ? DisplayTheme.LIGHT
              : DisplayTheme.DARK
          );
          this.collapseDropdown();
        }}
        key="theme-setting"
        type="button"
        className={style.item}
        id="javalab-settings-switch-theme"
      >
        {javalabMsg.switchToDisplayTheme({displayTheme: displayThemeString})}
      </button>
    );
  };

  renderFontSizeSelector = () => {
    const {
      increaseEditorFontSize,
      decreaseEditorFontSize,
      canIncreaseFontSize,
      canDecreaseFontSize,
      editorFontSize,
    } = this.props;

    return (
      <div
        className={classNames(style.item, style.fontSizeSelector)}
        id="javalab-settings-font-size-selector"
      >
        <span className={style.textSizeLabel}>{javalabMsg.textSize()}</span>
        <button
          onClick={decreaseEditorFontSize}
          disabled={!canDecreaseFontSize}
          className={style.fontSizeButton}
          type="button"
          id="javalab-settings-decrease-font"
        >
          <FontAwesome icon="minus" className={style.icon} />
        </button>
        {`${editorFontSize}px`}
        <button
          onClick={increaseEditorFontSize}
          disabled={!canIncreaseFontSize}
          className={style.fontSizeButton}
          type="button"
          id="javalab-settings-increase-font"
        >
          <FontAwesome icon="plus" className={style.icon} />
        </button>
      </div>
    );
  };

  renderDropdown = () => {
    return (
      <div className={classNames(style.settingsDropdown)}>
        {this.renderFontSizeSelector()}
        {this.renderSwitchThemeButton()}
      </div>
    );
  };

  render() {
    const {dropdownOpen} = this.state;

    return (
      <CloseOnEscape
        className={style.main}
        handleClose={this.handleClickOutside}
      >
        <JavalabButton
          icon={<FontAwesome icon="cog" />}
          text={msg.settings()}
          className={classNames(
            style.buttonWhite,
            dropdownOpen && style.selected
          )}
          onClick={this.toggleDropdown}
          isHorizontal
        />
        {dropdownOpen && this.renderDropdown()}
      </CloseOnEscape>
    );
  }
}

export default connect(
  state => ({
    displayTheme: state.javalabView.displayTheme,
    canIncreaseFontSize: state.javalabView.canIncreaseFontSize,
    canDecreaseFontSize: state.javalabView.canDecreaseFontSize,
    editorFontSize: state.javalabView.editorFontSize,
  }),
  dispatch => ({
    setDisplayTheme: displayTheme => dispatch(setDisplayTheme(displayTheme)),
    increaseEditorFontSize: () => dispatch(increaseEditorFontSize()),
    decreaseEditorFontSize: () => dispatch(decreaseEditorFontSize()),
  })
)(onClickOutside(UnconnectedJavalabSettings));
