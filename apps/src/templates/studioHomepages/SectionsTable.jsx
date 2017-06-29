import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';

// Many of these styles are also used by our similar SectionTable on the
// teacher-dashboard page (which is why we export them).
export const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: 940
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
  col1: {
    width: 310
  },
  col2: {
    width: 310
  },
  col3: {
    lineHeight: '52px',
    width: 110
  },
  col4: {
    lineHeight: '52px',
    width: 210,
    borderRightWidth: 0,
  },
  col4Rtl: {
    lineHeight: '52px',
    width: 210
  },
  colText: {
    color: color.charcoal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
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
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        linkToProgress: React.PropTypes.string.isRequired,
        assignedTitle: React.PropTypes.string,
        linkToAssigned: React.PropTypes.string,
        numberOfStudents: React.PropTypes.number.isRequired,
        linkToStudents: React.PropTypes.string.isRequired,
        sectionCode: React.PropTypes.string.isRequired
      })
    ),
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { sections, isRtl } = this.props;

    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={{...styles.col, ...styles.col1}}>
              <div style={styles.colText}>
                {i18n.section()}
              </div>
            </td>
            <td style={{...styles.col, ...styles.col2}}>
              <div style={styles.colText}>
                {i18n.course()}
              </div>
            </td>
            <td style={{...styles.col, ...styles.col3}}>
              <div style={styles.colText}>
                {i18n.students()}
              </div>
            </td>
            <td style={{...styles.col, ...(isRtl? styles.col4Rtl: styles.col4)}}>
              <div style={styles.colText}>
                {i18n.sectionCode()}
              </div>
            </td>
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
              <td style={{...styles.col, ...styles.col1}}>
                <a href={section.linkToProgress} style={styles.link}>
                  {section.name}
                </a>
              </td>
              <td style={{...styles.col, ...styles.col2}}>
                <a href={section.linkToAssigned} style={styles.link}>
                  {section.assignedTitle}
                </a>
              </td>
              <td style={{...styles.col, ...styles.col3}}>
                <a href={section.linkToStudents} style={styles.link}>
                  {section.numberOfStudents}
                </a>
              </td>
              <td style={{...styles.col, ...(isRtl? styles.col4Rtl: styles.col4)}}>
                {section.sectionCode}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
});

export default SectionsTable;
