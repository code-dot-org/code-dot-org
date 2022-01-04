import React, {Component} from 'react';
import PropTypes from 'prop-types';
import JavalabDropdown from './components/JavalabDropdown';
import javalabMsg from '@cdo/javalab/locale';

/**
 * A menu with a set of clickable links that calls the cancel handler if you
 * click outside the menu or the cancel button.
 */
export default class JavalabEditorTabMenu extends Component {
  static propTypes = {
    cancelTabMenu: PropTypes.func.isRequired,
    renameFromTabMenu: PropTypes.func.isRequired,
    deleteFromTabMenu: PropTypes.func.isRequired,
    changeFileTypeFromTabMenu: PropTypes.func.isRequired,
    showVisibilityOption: PropTypes.bool.isRequired,
    fileIsVisible: PropTypes.bool,
    fileIsValidation: PropTypes.bool
  };

  state = {
    dropdownOpen: false
  };

  dropdownElements = () => {
    const {
      renameFromTabMenu,
      deleteFromTabMenu,
      cancelTabMenu,
      showVisibilityOption,
      changeFileTypeFromTabMenu,
      fileIsVisible,
      fileIsValidation
    } = this.props;
    let elements = [
      <a onClick={renameFromTabMenu} key="rename">
        {javalabMsg.rename()}
      </a>,
      <a onClick={deleteFromTabMenu} key="delete">
        {javalabMsg.delete()}
      </a>
    ];
    if (showVisibilityOption && !fileIsVisible) {
      elements.push(
        <a
          key="starter"
          onClick={() => {
            changeFileTypeFromTabMenu(
              true /*isVisible*/,
              false /*isValidation*/
            );
          }}
        >
          {javalabMsg.makeStarter()}
        </a>
      );
    }
    if (showVisibilityOption && (fileIsVisible || fileIsValidation)) {
      elements.push(
        <a
          key="support"
          onClick={() => {
            changeFileTypeFromTabMenu(
              false /*isVisible*/,
              false /*isValidation*/
            );
          }}
        >
          {javalabMsg.makeSupport()}
        </a>
      );
    }
    if (showVisibilityOption && !fileIsValidation) {
      elements.push(
        <a
          key="validation"
          onClick={() => {
            changeFileTypeFromTabMenu(
              false /*isVisible*/,
              true /*isValidation*/
            );
          }}
        >
          {javalabMsg.makeValidation()}
        </a>
      );
    }
    elements.push(
      <a key="cancel" onClick={cancelTabMenu}>
        {javalabMsg.cancel()}
      </a>
    );
    return elements;
  };

  render() {
    return <JavalabDropdown>{this.dropdownElements()}</JavalabDropdown>;
  }
}
