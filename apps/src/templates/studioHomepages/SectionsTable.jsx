import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import styleConstants from '../../styleConstants';
import i18n from '@cdo/locale';
import shapes from './shapes';
import Button from '@cdo/apps/templates/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

// Many of these styles are also used by our similar SectionTable on the
// teacher-dashboard page (which is why we export them).
export const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width']
  },
  headerRow: {
    backgroundColor: color.table_header,
    fontWeight: 'bold',
    borderColor: color.border_light_gray,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 1,
  },
  lightRow: {
    backgroundColor: color.table_light_row
  },
  darkRow: {
    backgroundColor: color.table_dark_row
  },
  row: {
    borderBottomColor: color.border_light_gray,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  },
  col: {
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    color: color.charcoal,
    paddingLeft: 20,
    paddingRight: 20,
  },
  sectionNameCol: {
    width: 310
  },
  courseCol: {
    width: 310
  },
  teacherCol: {
    lineHeight: '52px',
    width: 160
  },
  studentsCol: {
    width: 110
  },
  sectionCodeCol: {
    lineHeight: '52px',
    width: 135,
    borderRightWidth: 0,
  },
  sectionCodeColRtl: {
    lineHeight: '52px',
    width: 210
  },
  leaveCol: {
    width: 110,
    borderLeftWidth: 1,
    borderLeftColor: color.border_light_gray,
    borderLeftStyle: 'solid',
  },
  colText: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    lineHeight: '22px'
  },
  link: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    textDecoration: 'none'
  }
};

const SectionsTable = React.createClass({
  propTypes: {
    sections: shapes.sections,
    isRtl: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
    updateSections: PropTypes.func,
    updateSectionsResult: PropTypes.func
  },

  onLeave(sectionCode, sectionName) {
    $.post({
      url: `/api/v1/sections/${sectionCode}/leave`,
      dataType: "json"
    }).done(data => {
      this.props.updateSections(data.sections);
      this.props.updateSectionsResult("leave", data.result, sectionName);
    });
  },

  sectionHref(section) {
    if (section.numberOfStudents === 0) {
      return pegasus(`/teacher-dashboard#/sections/${section.id}/manage`);
    }
    return section.linkToProgress;
  },

  render() {
    const { sections, isRtl, isTeacher, canLeave } = this.props;

    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={{...styles.col, ...styles.sectionNameCol}}>
              <div style={styles.colText}>
                {i18n.sectionName()}
              </div>
            </td>
            <td style={{...styles.col, ...styles.courseCol}}>
              <div style={styles.colText}>
                {i18n.course()}
              </div>
            </td>
            {isTeacher && (
              <td style={{...styles.col, ...styles.studentsCol}}>
                <div style={styles.colText}>
                  {i18n.students()}
                </div>
              </td>
            )}
            {!isTeacher && (
              <td style={{...styles.col, ...styles.teacherCol}}>
                <div style={styles.colText}>
                  {i18n.teacher()}
                </div>
              </td>
            )}
            <td style={{...styles.col, ...(isRtl? styles.sectionCodeColRtl: styles.sectionCodeCol)}}>
              <div style={styles.colText}>
                {i18n.sectionCode()}
              </div>
            </td>
            {!isTeacher && canLeave && (
              <td style={{...styles.col, ...styles.leaveCol}}>
                <div style={styles.colText}>
                </div>
              </td>
            )}
          </tr>
        </thead>
        <tbody>
          {sections.map((section, index) =>
            <tr
              style={{
                ...(index % 2 === 0 ? styles.lightRow : styles.darkRow),
                ...styles.row
              }}
              key={index}
            >
              <td style={{...styles.col, ...styles.sectionNameCol}}>
                {isTeacher && (
                  <a href={this.sectionHref(section)} style={styles.link}>
                    {section.name}
                  </a>
                )}
                {!isTeacher && (
                  <div>
                    {section.name}
                  </div>
                )}
              </td>
              <td style={{...styles.col, ...styles.courseCol}}>
                <a href={section.linkToAssigned} style={styles.link}>
                  {section.assignedTitle}
                </a>
              </td>
              {isTeacher && (
                <td style={{...styles.col, ...styles.col3}}>
                  <a href={section.linkToStudents} style={styles.link}>
                    {section.numberOfStudents}
                  </a>
                </td>
              )}
              {!isTeacher && (
                <td style={{...styles.col, ...styles.col3Student}}>
                  {section.teacherName}
                </td>
              )}
              <td style={{...styles.col, ...(isRtl? styles.sectionCodeColRtl: styles.sectionCodeCol)}}>
                {section.code}
              </td>
              {!isTeacher && canLeave && (
                <td style={{...styles.col, ...styles.leaveCol}}>
                  <Button
                    style={{marginLeft: 5}}
                    text={i18n.leaveSection()}
                    onClick={this.onLeave.bind(this, section.code, section.name)}
                    color={Button.ButtonColor.gray}
                  />
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    );
  }
});

export default SectionsTable;
