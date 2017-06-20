import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import SectionRow from './SectionRow';
import i18n from '@cdo/locale';

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

/**
 * This is a component that shows information about the sections that a teacher
 * owns, and allows for editing them.
 * It shows some of the same information as the SectionsTable used on the teacher
 * homepage. However, for historical reasons it unfortunately has a somewhat
 * different set/shape of input data. This component gets its data from
 * section_api_helpers in pegasus via an AJAX call, whereas that component gets
 * its data from section.summarize on page load.
 * Both ultimately source data from the dashboard db.
 * Long term it would be ideal if section_api_helpers went away and both components
 * used dashboard.
 */
class SectionTable extends Component {
  static propTypes = {
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  render() {
    const { sectionIds } = this.props;

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
              <a style={styles.link} href>{i18n.section()}</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>{i18n.loginType()}</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>{i18n.grade()}</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>{i18n.course()}</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>{i18n.stageExtras()}</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>{i18n.pairProgramming()}</a>
            </th>
            <th style={styles.headerRow}>
              <a style={styles.link}>{i18n.students()}</a>
            </th>
            <th style={styles.headerRow}>
              {i18n.sectionCode()}
            </th>
            <th style={styles.headerRow}>
            </th>
          </tr>
          {sectionIds.map((sid, index) => (
            <SectionRow
              key={sid}
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
