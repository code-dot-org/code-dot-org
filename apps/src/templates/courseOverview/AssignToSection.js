import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import $ from 'jquery';
import queryString from 'query-string';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ConfirmAssignment from './ConfirmAssignment';

const styles = {
  main: {
    display: 'inline-block',
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
    marginTop: -10,
    // without this, this will be below some content
    zIndex: 1,
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

/**
 * A dropdown component that shows a list of sections for the current user, and
 * lets them assign the current course to any of those sections (after accepting
 * a confirmation dialog)
 */
class AssignToSection extends Component {
  static propTypes = {
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    assignmentName: PropTypes.string.isRequired,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
  };

  state = {
    dropdownOpen: false,
    sectionIndexToAssign: null,
    errorString: null
  }

  onComponentDidUnmount() {
    document.removeEventListener('click', this.onClickDocument, false);
  }

  expandDropdown = () => {
    document.addEventListener('click', this.onClickDocument, false);
    this.setState({dropdownOpen: true});
  }

  collapseDropdown = () => {
    document.removeEventListener('click', this.onClickDocument, false);
    this.setState({dropdownOpen: false});
  }

  onClickDocument = event => {
    // We're only concerned with clicks outside of ourselves
    if (ReactDOM.findDOMNode(this).contains(event.target)) {
      return;
    }
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    }
  }

  onClickDropdown = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    } else {
      this.expandDropdown();
    }
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
        course_id: this.props.courseId,
        script_id: this.props.scriptId,
      }),
    }).done(result => {
      this.collapseDropdown();
      this.setState({
        sectionIndexToAssign: null
      });
    }).fail((jqXhr, status) => {
      this.collapseDropdown();
      this.setState({
        sectionIndexToAssign: null,
        errorString: i18n.unexpectedError()
      });
    });
  }

  acknowledgeError = () => {
    this.setState({errorString: null});
  }

  render() {
    const { courseId, scriptId, assignmentName, sectionsInfo } = this.props;
    const { dropdownOpen, sectionIndexToAssign, errorString } = this.state;
    const section = sectionsInfo[sectionIndexToAssign];

    return (
      <div style={styles.main}>
        <Button
          ref={element => this.button = element}
          text={(courseId && scriptId) ? i18n.assignUnit() : i18n.assignCourse()}
          onClick={this.onClickDropdown}
          icon={dropdownOpen ? "caret-up" : "caret-down"}
          iconStyle={styles.icon}
          color={Button.ButtonColor.orange}
        />

        {dropdownOpen && (
          <div style={styles.dropdown}>
            <a
              href={`${window.dashboard.CODE_ORG_URL}/teacher-dashboard?` +
                queryString.stringify({courseId, scriptId}) + "#/sections"}
              style={styles.section}
            >
              {i18n.newSectionEllipsis()}
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
        {sectionIndexToAssign !== null && (
          <ConfirmAssignment
            sectionName={section.name}
            assignmentName={assignmentName}
            onClose={this.onCloseDialog}
            onConfirm={this.updateCourse}
          />
        )}
        {errorString && (
          <BaseDialog
            isOpen={true}
            handleClose={this.acknowledgeError}
          >
            {errorString}
          </BaseDialog>
        )}
      </div>
    );
  }
}

export default Radium(AssignToSection);
