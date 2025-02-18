import PropTypes from 'prop-types';
import React, {Component} from 'react';
import onClickOutside from 'react-onclickoutside';

import javalabMsg from '@cdo/javalab/locale';

import JavalabDropdown from './components/JavalabDropdown';

/**
 * A menu with a set of clickable file options that calls the cancel handler if you
 * click outside the menu or the cancel button.
 */
export class JavalabEditorTabMenu extends Component {
  static propTypes = {
    cancelTabMenu: PropTypes.func.isRequired,
    renameFromTabMenu: PropTypes.func.isRequired,
    moveTabLeft: PropTypes.func.isRequired,
    moveTabRight: PropTypes.func.isRequired,
    deleteFromTabMenu: PropTypes.func.isRequired,
    changeFileTypeFromTabMenu: PropTypes.func.isRequired,
    showVisibilityOption: PropTypes.bool.isRequired,
    fileIsVisible: PropTypes.bool,
    fileIsValidation: PropTypes.bool,
    activeTabKey: PropTypes.string,
    orderedTabKeys: PropTypes.array,
  };

  dropdownElements = () => {
    const {
      renameFromTabMenu,
      deleteFromTabMenu,
      moveTabRight,
      moveTabLeft,
      showVisibilityOption,
      changeFileTypeFromTabMenu,
      fileIsVisible,
      fileIsValidation,
      activeTabKey,
      orderedTabKeys,
    } = this.props;

    let elements = [
      <button onClick={renameFromTabMenu} key="rename" type="button">
        {javalabMsg.rename()}
      </button>,
    ];
    const tabsLength = orderedTabKeys.length;
    const index = orderedTabKeys.indexOf(activeTabKey);
    if (index > 0) {
      elements.push(
        <button onClick={moveTabLeft} key="moveLeft" type="button">
          {javalabMsg.moveLeft()}
        </button>
      );
    }
    if (index < tabsLength - 1) {
      elements.push(
        <button onClick={moveTabRight} key="moveRight" type="button">
          {javalabMsg.moveRight()}
        </button>
      );
    }
    elements.push(
      <button onClick={deleteFromTabMenu} key="delete" type="button">
        {javalabMsg.delete()}
      </button>
    );

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
    return elements;
  };

  handleClickOutside = () => {
    this.props.cancelTabMenu();
  };

  render() {
    return <JavalabDropdown>{this.dropdownElements()}</JavalabDropdown>;
  }
}

export default onClickOutside(JavalabEditorTabMenu);
