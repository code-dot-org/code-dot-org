import React, {Component} from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';

const placeholderFiles = [
  'MyClass.java',
  'MyPainter.java',
  'NeighborhoodMain.java'
];

const styles = {
  dropdown: {
    position: 'absolute',
    top: 30,
    backgroundColor: color.darkest_gray,
    color: color.light_gray,
    zIndex: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  buttonStyles: {
    cursor: 'pointer',
    float: 'right',
    backgroundColor: color.light_purple,
    marginTop: 3,
    marginBottom: 3,
    marginRight: 3,
    marginLeft: 0,
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
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottoom: 5,
    width: '90%',
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
    paddingRight: 8,
    opacity: 1
  }
};

/**
 * A button that drops down to a set of clickable links, and closes itself if
 * you click on the button, or outside of the dropdown.
 */
export const Backpack = class Backpack extends Component {
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
    const {dropdownOpen} = this.state;

    return (
      <div>
        <button
          type="button"
          onClick={this.toggleDropdown}
          style={{
            ...styles.buttonStyles,
            ...(dropdownOpen && styles.dropdownOpenButton)
          }}
        >
          <img
            src="/blockly/media/javalab/backpack.png"
            alt="backpack icon"
            style={styles.backpackIcon}
          />
          <span>Backpack</span>
        </button>

        {dropdownOpen && (
          <div style={styles.dropdown} ref={ref => (this.dropdownList = ref)}>
            {placeholderFiles.map((filename, index) => (
              <div style={styles.fileListItem} key={`backpack-file-${index}`}>
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
            <button
              type="button"
              style={styles.importButton}
              onClick={this.collapseDropdown}
            >
              Import
            </button>
          </div>
        )}
      </div>
    );
  }
};

export default onClickOutside(Radium(Backpack));
