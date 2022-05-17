import React, {Component} from 'react';
import PropTypes from 'prop-types';
import JavalabDropdown from './components/JavalabDropdown';
import javalabMsg from '@cdo/javalab/locale';

/**
 * A menu with a set of clickable file options that calls the cancel handler if you
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
      <button onClick={renameFromTabMenu} key="rename" type="button">
        {javalabMsg.rename()}
      </button>,
      <button onClick={deleteFromTabMenu} key="delete" type="button">
        {javalabMsg.delete()}
      </button>
    ];
    // options for start sources mode
    if (showVisibilityOption) {
      // file is not visible, add option to make it a starter file
      if (!fileIsVisible) {
        elements.push(
          <button
            type="button"
            key="starter"
            onClick={() => {
              changeFileTypeFromTabMenu(
                true /*isVisible*/,
                false /*isValidation*/
              );
            }}
          >
            {javalabMsg.makeStarter()}
          </button>
        );
      }
      // file is not a validation file, add option to make it a validation file
      if (!fileIsValidation) {
        elements.push(
          <button
            type="button"
            key="validation"
            onClick={() => {
              changeFileTypeFromTabMenu(
                false /*isVisible*/,
                true /*isValidation*/
              );
            }}
          >
            {javalabMsg.makeValidation()}
          </button>
        );
      }
      // if file is a starter file or a validation file, add the option to make it a support file.
      if (fileIsVisible || fileIsValidation) {
        elements.push(
          <button
            type="button"
            key="support"
            onClick={() => {
              changeFileTypeFromTabMenu(
                false /*isVisible*/,
                false /*isValidation*/
              );
            }}
          >
            {javalabMsg.makeSupport()}
          </button>
        );
      }
    }
    elements.push(
      <button key="cancel" onClick={cancelTabMenu} type="button">
        {javalabMsg.cancel()}
      </button>
    );
    return elements;
  };

  render() {
    return <JavalabDropdown>{this.dropdownElements()}</JavalabDropdown>;
  }
}
