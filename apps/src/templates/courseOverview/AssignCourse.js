import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import $ from 'jquery';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import AssignCourseConfirm from './AssignCourseConfirm';

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
    courseName: PropTypes.string.isRequired,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
  };

  state = {
    dropdownOpen: false,
    sectionIndexToAssign: null,
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

  onClickDropdown = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  onClickCourse = event => {
    const sectionIndex = event.target.getAttribute('data-section-index');
    this.setState({
      sectionIndexToAssign: sectionIndex
    });
  }

  onCloseDialog = event => {
    this.setState({sectionIndexToAssign: null});
  }

  updateCourse = () => {
    const section = this.props.sectionsInfo[this.state.sectionIndexToAssign];
    $.ajax({
      url: `/sections/${section.id}`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({
        course_id: this.props.courseId
      }),
    }).done(result => {
      this.setState({dropdownOpen: false});
    }).fail((jqXhr, status) => {
      // TODO handle failure
      console.error(status);
    });
  }

  render() {
    const { courseId, courseName, sectionsInfo } = this.props;
    const { dropdownOpen, sectionIndexToAssign } = this.state;
    const section = sectionsInfo[sectionIndexToAssign];

    return (
      <div>
        <ProgressButton
          ref={element => this.button = element}
          text={i18n.assignCourse()}
          style={styles.button}
          onClick={this.onClickDropdown}
          icon={dropdownOpen ? "caret-up" : "caret-down"}
          iconStyle={styles.icon}
          color={ProgressButton.ButtonColor.orange}
        />

        {dropdownOpen && (
          <div style={styles.dropdown}>
            <a
              href={`${window.dashboard.CODE_ORG_URL}/teacher-dashboard?newSection=${courseId}#/sections`}
              style={styles.section}
            >
              {i18n.newSection()}...
            </a>
            {sectionsInfo.map((section, index) => (
              <a
                key={index}
                style={{
                  ...styles.section,
                  ...styles.nonFirstSection
                }}
                data-section-index={index}
                onClick={this.onClickCourse}
              >
                {section.name}
              </a>
            ))}
          </div>
        )}
        {sectionIndexToAssign && (
          <AssignCourseConfirm
            courseName={courseName}
            sectionName={section.name}
            onClose={this.onCloseDialog}
            onConfirm={this.updateCourse}
          />
        )}
      </div>
    );
  }
}

export default Radium(AssignCourse);
