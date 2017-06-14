import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import SectionRow from './SectionRow';

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
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  render() {
    const { sectionIds } = this.props;

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
          {sectionIds.map((sid, index) => (
            <SectionRow
              key={index}
              sectionId={sid}
            />
          ))}
        </tbody>
      </table>
    );
  }
}

export const UnconnectedSectionTable = SectionTable;

export default connect(state => ({
  sectionIds: state.teacherSections.sectionIds
}))(SectionTable);
