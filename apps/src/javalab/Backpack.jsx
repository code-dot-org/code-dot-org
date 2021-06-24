import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import JavalabButton from './JavalabButton';
import javalabMsg from '@cdo/javalab/locale';

const placeholderFiles = [
  'MyClass.java',
  'MyPainter.java',
  'NeighborhoodMain.java'
];

/**
 * A button that drops down to a set of importable files, and closes itself if
 * you click on the import button, or outside of the dropdown.
 */
export class Backpack extends Component {
  static propTypes = {
    isDarkMode: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired
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

  render() {
    const {isDarkMode, isDisabled} = this.props;
    const {dropdownOpen} = this.state;

    return (
      <div>
        <JavalabButton
          icon={
            <img
              src="/blockly/media/javalab/backpack.png"
              alt="backpack icon"
              style={styles.backpackIcon}
            />
          }
          text={javalabMsg.backpackLabel()}
          style={{
            ...styles.buttonStyles,
            ...(dropdownOpen && styles.dropdownOpenButton)
          }}
          isHorizontal
          onClick={this.toggleDropdown}
          isDisabled={isDisabled}
        />
        {dropdownOpen && (
          <div
            style={{...styles.dropdown, ...(isDarkMode && styles.dropdownDark)}}
            ref={ref => (this.dropdownList = ref)}
          >
            {placeholderFiles.map((filename, index) => (
              <div
                style={{
                  ...styles.fileListItem,
                  ...(isDarkMode && styles.fileListItemDark)
                }}
                key={`backpack-file-${index}`}
              >
                <input
                  type="checkbox"
                  id={`backpack-file-${index}`}
                  name={filename}
                />
                <label
                  htmlFor={`backpack-file-${index}`}
                  style={styles.fileListLabel}
                >
                  {filename}
                </label>
              </div>
            ))}
            <JavalabButton
              text="Import"
              style={styles.importButton}
              onClick={this.collapseDropdown}
            />
          </div>
        )}
      </div>
    );
  }
}

export default onClickOutside(Radium(Backpack));

const styles = {
  dropdown: {
    position: 'absolute',
    top: 30,
    backgroundColor: color.lightest_gray,
    color: color.darkest_gray,
    zIndex: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  dropdownDark: {
    backgroundColor: color.darkest_gray,
    color: color.light_gray
  },
  buttonStyles: {
    cursor: 'pointer',
    float: 'right',
    backgroundColor: color.light_purple,
    margin: '3px 3px 3px 0px',
    height: 24,
    borderRadius: 4,
    borderWidth: 0,
    fontSize: 13,
    color: color.white,
    padding: '0px 12px',
    fontFamily: '"Gotham 5r", sans-serif',
    lineHeight: '18px',
    ':hover': {
      backgroundColor: color.cyan
    }
  },
  dropdownOpenButton: {
    backgroundColor: color.cyan
  },
  fileListItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 10px 5px 10px',
    width: '90%',
    ':hover': {
      backgroundColor: color.lighter_gray
    }
  },
  fileListItemDark: {
    ':hover': {
      backgroundColor: color.black
    }
  },
  fileListLabel: {
    marginLeft: 5
  },
  importButton: {
    backgroundColor: color.orange,
    color: color.white,
    fontSize: 13,
    padding: '5px 16px'
  },
  backpackIcon: {
    height: 15,
    opacity: 1
  }
};
