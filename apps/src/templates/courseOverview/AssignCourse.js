import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import color from "@cdo/apps/util/color";
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

const styles = {
  button: {
    marginBottom: 10
  },
  icon: {
    fontSize: 24,
    // we want our icon text to be a different size than our button text, which
    // requires we manually offset to get it centered properly
    position: 'relative',
    top: 3
  },
  dropdown: {
    border: `1px solid ${color.charcoal}`,
    position: 'absolute',
    marginTop: -10
  },
  section: {
    padding: 10,
    color: color.charcoal,
    backgroundColor: color.white,
    fontFamily: '"Gotham 5r", sans-serif',
    display: 'block',
    textDecoration: 'none',
    lineHeight: '20px',
    transition: 'background-color .2s ease-out',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer'
    }
  },
  nonFirstSection: {
    borderTop: `1px solid ${color.charcoal}`
  }
};

class AssignCourse extends Component {
  static propTypes = {
    courseId: PropTypes.number.isRequired,
  };

  state = {
    dropdownOpen: false
  }

  componentDidMount = () => {
    document.addEventListener('click', this.onClickDocument, false);
  }

  componentWillUnmount = () => {
    document.removeEventListener('click', this.onClickDocument, false);
  }

  onClickDocument = event => {
    // We're only concerned with clicks outside of ourselves
    if (ReactDOM.findDOMNode(this).contains(event.target)) {
      return;
    }
    if (this.state.dropdownOpen) {
      this.setState({
        dropdownOpen: false
      });
    }
  }

  onClick = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    // TODO: i18n
    // TODO: behind flag?
    const sectionNames = ['Section 1', 'Section 2', 'New Section...'];
    return (
      <div>
        <ProgressButton
          ref={element => this.button = element}
          text="Assign Course"
          style={styles.button}
          onClick={this.onClick}
          icon={this.state.dropdownOpen ? "caret-up" : "caret-down"}
          iconStyle={styles.icon}
          color={ProgressButton.ButtonColor.orange}
        />
        {this.state.dropdownOpen && (
          <div style={styles.dropdown}>
            {sectionNames.map((name, index) => (
              <a
                key={index}
                style={{
                  ...styles.section,
                  ...(index > 0 && styles.nonFirstSection)
                }}
              >
                {name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default Radium(AssignCourse);
