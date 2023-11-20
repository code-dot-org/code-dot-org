import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabDropdown from './components/JavalabDropdown';
import {DisplayTheme} from './DisplayTheme';
import i18n from '@cdo/locale';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';

/**
 * A button that drops down to a set of clickable file names, and closes itself if
 * you click on the buttons or outside of the dropdown.
 */
class JavalabFileExplorer extends Component {
  static propTypes = {
    fileMetadata: PropTypes.object,
    onSelectFile: PropTypes.func.isRequired,
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
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

  onClickFile = key => {
    this.collapseDropdown();
    this.props.onSelectFile(key);
  };

  transformFileMetadata() {
    const files = [];
    for (const fileKey in this.props.fileMetadata) {
      files.push({key: fileKey, filename: this.props.fileMetadata[fileKey]});
    }
    return files;
  }

  render() {
    const {displayTheme} = this.props;
    const {dropdownOpen} = this.state;
    const files = this.transformFileMetadata();

    return (
      <CloseOnEscape style={styles.main} handleClose={this.handleClickOutside}>
        <button
          aria-label={i18n.fileExplorer()}
          type="button"
          onClick={this.toggleDropdown}
          style={{
            ...styles.button,
            ...(displayTheme === DisplayTheme.DARK && styles.darkButton),
          }}
        >
          <FontAwesome icon="folder" />
        </button>

        {dropdownOpen && (
          <JavalabDropdown style={styles.dropdown}>
            {files
              .sort((a, b) => (a.filename > b.filename ? 1 : -1))
              .map((file, index) => (
                <button
                  onClick={() => this.onClickFile(file.key)}
                  key={index}
                  type="button"
                >
                  {file.filename}
                </button>
              ))}
          </JavalabDropdown>
        )}
      </CloseOnEscape>
    );
  }
}

const styles = {
  main: {
    float: 'left',
    height: 29,
    width: 29,
    margin: 2,
  },
  dropdown: {
    maxHeight: 190,
    overflowY: 'scroll',
  },
  button: {
    height: '100%',
    width: '100%',
    padding: 3,
    margin: 0,
    borderRadius: 2,
    backgroundColor: color.background_gray,
  },
  darkButton: {
    color: color.dark_charcoal,
  },
};

export default onClickOutside(JavalabFileExplorer);
