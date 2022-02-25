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
    // options for start sources mode
    if (showVisibilityOption) {
      // file is not visible, add option to make it a starter file
      if (!fileIsVisible) {
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
      // file is not a validation file, add option to make it a validation file
      if (!fileIsValidation) {
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
      // if file is a starter file or a validation file, add the option to make it a support file.
      if (fileIsVisible || fileIsValidation) {
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
