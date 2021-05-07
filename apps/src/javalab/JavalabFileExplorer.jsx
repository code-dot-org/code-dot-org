import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

/**
 * A button that drops down to a set of clickable buttons, and closes itself if
 * you click on the buttons or outside of the dropdown.
 */
class JavalabFileExplorerComponent extends Component {
  static propTypes = {
    fileMetadata: PropTypes.object,
    onSelectFile: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired
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
    const {isDarkMode} = this.props;
    const {dropdownOpen} = this.state;
    const files = this.transformFileMetadata();

    return (
      <div style={styles.main}>
        <button
          type="button"
          onClick={this.toggleDropdown}
          style={{...styles.button, ...(isDarkMode && styles.darkButton)}}
        >
          <FontAwesome icon="folder" />
        </button>

        {dropdownOpen && (
          <div style={styles.dropdown} ref={ref => (this.dropdownList = ref)}>
            {files
              .sort((a, b) => (a.filename > b.filename ? 1 : -1))
              .map((file, index) => (
                <button
                  type="button"
                  onClick={() => this.onClickFile(file.key)}
                  key={index}
                  style={styles.anchor}
                >
                  {file.filename}
                </button>
              ))}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    float: 'left',
    height: 33,
    width: 33,
    margin: 2
  },
  dropdown: {
    border: `1px solid ${color.charcoal}`,
    position: 'absolute',
    zIndex: 1,
    maxHeight: 175,
    overflowY: 'scroll'
  },
  anchor: {
    padding: 10,
    color: color.charcoal,
    backgroundColor: color.white,
    display: 'block',
    textDecoration: 'none',
    lineHeight: '7px',
    transition: 'background-color .2s ease-out',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer'
    },
    width: '100%',
    borderRadius: 0,
    margin: 0,
    fontSize: 13
  },
  button: {
    height: '100%',
    width: '100%',
    padding: 5,
    margin: 0
  },
  darkButton: {
    backgroundColor: color.darkest_gray,
    color: color.white
  }
};

export default onClickOutside(Radium(JavalabFileExplorerComponent));
