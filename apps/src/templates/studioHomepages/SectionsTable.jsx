import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: 940
  },
  headerRow: {
    backgroundColor: color.table_header,
    fontWeight: 'bold',
    borderBottomColor: color.border_light_gray,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
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
  col1: {
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
    lineHeight: '52px',
    color: color.charcoal,
    paddingLeft: 20,
    paddingRight: 20,
    width: 310
  },
  col2: {
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
    color: color.charcoal,
    paddingLeft: 20,
    paddingRight: 20,
    width: 310
  },
  col3: {
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
    lineHeight: '52px',
    color: color.charcoal,
    paddingLeft: 20,
    paddingRight: 20,
    width: 110
  },
  col4: {
    lineHeight: '52px',
    color: color.charcoal,
    paddingLeft: 20,
    paddingRight: 20,
    width: 210
  },
  colText: {
    color: color.charcoal,
    fontFamily: 'Gotham 5r',
    fontSize: 14,
  },
  link: {
    color: color.teal,
    fontFamily: 'Gotham 5r',
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
    )
  },

  render() {
    const { sections } = this.props;

    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={styles.col1}>
              <div style={styles.colText}>
                {i18n.section()}
              </div>
            </td>
            <td style={styles.col2}>
              <div style={styles.colText}>
                {i18n.course()}
              </div>
            </td>
            <td style={styles.col3}>
              <div style={styles.colText}>
                {i18n.students()}
              </div>
            </td>
            <td style={styles.col4}>
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
                ...(!index%2 && styles.lightRow),
                ...(index%2 && styles.darkRow), ...styles.row
              }}
              key={index}
            >
              <td style={styles.col1}>
                <a href={section.linkToProgress} style={styles.link}>
                  {section.name}
                </a>
              </td>
              <td style={styles.col2}>
                <a href={section.linkToAssigned} style={styles.link}>
                  {section.assignedTitle}
                </a>
              </td>
              <td style={styles.col3}>
                <a href={section.linkToStudents} style={styles.link}>
                  {section.numberOfStudents}
                </a>
              </td>
              <td style={styles.col4}>
                <div style={styles.colText}>
                  {section.sectionCode}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
});

export default SectionsTable;
