import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import SectionRow from './SectionRow';
import i18n from '@cdo/locale';
import { styles as tableStyles } from '@cdo/apps/templates/studioHomepages/SectionsTable';
import styleConstants from '@cdo/apps/styleConstants';

const styles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
  },
  headerRow: tableStyles.headerRow,
  col: tableStyles.col,
  colText: tableStyles.colText,
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
    onEdit: PropTypes.func
  };

  render() {
    const { sectionIds } = this.props;
    const sectionFlow2017 = experiments.isEnabled(SECTION_FLOW_2017);

    const tableStyle = {
      ...styles.table,
      ...(sectionFlow2017 && {width: styleConstants['content-width']}),
    };

    return (
      <table style={tableStyle}>
        <thead>
          <tr style={styles.headerRow}>
            <td style={styles.col}>
              <div style={styles.colText}>
                {i18n.section()}
              </div>
            </td>
            {!sectionFlow2017 &&
              <td style={styles.col}>
                <div style={styles.colText}>
                  {i18n.loginType()}
                </div>
              </td>
            }
            <td style={styles.col}>
              <div style={styles.colText}>
                {i18n.grade()}
              </div>
            </td>
            <td style={styles.col}>
              <div style={styles.colText}>
                {i18n.course()}
              </div>
            </td>
            {!sectionFlow2017 &&
              <td style={styles.col}>
                <div style={styles.colText}>
                  {i18n.stageExtras()}
                </div>
              </td>
            }
            {!sectionFlow2017 &&
              <td style={styles.col}>
                <div style={styles.colText}>
                  {i18n.pairProgramming()}
                </div>
              </td>
            }
            <td style={styles.col}>
              <div style={styles.colText}>
                {i18n.students()}
              </div>
            </td>
            <td style={styles.col}>
              <div style={styles.colText}>
                {i18n.sectionCode()}
              </div>
            </td>
            <td style={styles.col}>
            </td>
          </tr>
        </thead>
        <tbody>
          {sectionIds.map((sid, index) => (
            <SectionRow
              key={sid}
              sectionId={sid}
              lightRow={index % 2 === 0}
              handleEdit={this.props.onEdit}
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
