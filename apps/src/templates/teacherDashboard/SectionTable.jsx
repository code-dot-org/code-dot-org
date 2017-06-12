import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import SectionRow from './SectionRow';
import { sectionShape, assignmentShape } from './shapes';

const styles = {
  table: {
    width: '100%',
    tableLayout: 'auto',
    backgroundColor: 'transparent',
    borderSpacing: 0,
    borderCollapse: 'collapse'
  },
  headerRow: {
    height: 45,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: color.teal,
    color: color.white,
    borderColor: color.white,
    borderWidth: 1,
    borderStyle: 'solid',
    borderTopColor: color.teal,
    borderLeftColor: color.teal,
    borderRightColor: color.teal,
    textAlign: 'left'
  },
  link: {
    color: color.white
  }
};

class SectionTable extends Component {
  static propTypes = {
    validGrades: PropTypes.arrayOf(PropTypes.string).isRequired,
    validCourses: PropTypes.arrayOf(assignmentShape).isRequired,
    validScripts: PropTypes.arrayOf(assignmentShape).isRequired,
    sections: PropTypes.arrayOf(sectionShape).isRequired,

    // redux provided
    validLoginTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  render() {
    const { sections, validLoginTypes, validGrades, validCourses, validScripts } = this.props;

    // TODO: i18n
    return (
      <table style={styles.table}>
        <colgroup>
          <col width="200"/>
          <col width="130"/>
          <col width="98"/>
          <col width="130"/>
          <col/>
          <col/>
          <col/>
          <col/>
          <col/>
        </colgroup>
        <tbody>
          <tr>
            <th style={styles.headerRow}>
              <a style={styles.link} href>Section</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>Login Type</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>Grade</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>Course</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>Stage Extras</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>Pair Programming</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>Students</a>
            </th>
            <th style={styles.headerRow}>
              Section Code
            </th>
            <th style={styles.headerRow}>
            </th>
          </tr>
          {sections.map((s, index) => (
            <SectionRow
              key={index}
              validLoginTypes={validLoginTypes}
              validGrades={validGrades}
              validCourses={validCourses}
              validScripts={validScripts}
              section={s}
            />
          ))}
        </tbody>

      </table>
    );
  }
}

export const UnconnectedSectionTable = SectionTable;

export default connect(state => ({
  validLoginTypes: state.teacherSections.validLoginTypes
}))(SectionTable);
