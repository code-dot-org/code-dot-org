import Link from '@code-dot-org/component-library/link';
import {SectionLoginType} from '@code-dot-org/shared-constants';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import styleConstants from '../../styleConstants';
import {plTableLayoutStyles} from '../tables/tableConstants';

import shapes from './shapes';

class SectionsAsStudentTable extends React.Component {
  static propTypes = {
    sections: shapes.participantSections,
    isRtl: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
    updateSections: PropTypes.func,
    updateSectionsResult: PropTypes.func,
    isPlSections: PropTypes.bool,
  };

  renderSectionCodeCell(section) {
    if (section.login_type === SectionLoginType.clever) {
      return i18n.loginTypeClever();
    } else if (section.login_type === SectionLoginType.google_classroom) {
      return i18n.loginTypeGoogleClassroom();
    } else if (!section.code) {
      // Demo sections have no join code; students are pre-enrolled.
      return i18n.notApplicable();
    } else {
      return section.code;
    }
  }

  onLeave(sectionCode, sectionName) {
    $.post({
      url: `/api/v1/sections/${sectionCode}/leave`,
      dataType: 'json',
    }).done(data => {
      this.props.updateSections(data.studentSections, data.plSections);
      this.props.updateSectionsResult(
        'leave',
        data.result,
        sectionName,
        sectionCode
      );
    });
  }

  render() {
    const {sections, isRtl, canLeave} = this.props;
    const styles = this.props.isPlSections
      ? plTableLayoutStyles
      : studentSectionsStyles;

    return (
      <table
        style={styles.table}
        className={
          this.props.isPlSections
            ? 'ui-test-joined-pl-sections-table'
            : 'ui-test-joined-student-sections-table'
        }
      >
        <thead>
          <tr style={styles.headerRow}>
            <th
              style={{
                ...styles.col,
                ...styles.colHeader,
                ...styles.sectionNameCol,
                ...styles.headerRowPadding,
              }}
            >
              <div style={styles.colText}>{i18n.section()}</div>
            </th>
            <th
              style={{...styles.col, ...styles.colHeader, ...styles.courseCol}}
            >
              <div style={styles.colText}>{i18n.course()}</div>
            </th>
            <th
              style={{...styles.col, ...styles.colHeader, ...styles.teacherCol}}
            >
              <div style={styles.colText}>{i18n.teacher()}</div>
            </th>
            <th
              style={{
                ...styles.col,
                ...styles.colHeader,
                ...(isRtl ? styles.sectionCodeColRtl : styles.sectionCodeCol),
              }}
            >
              <div style={styles.colText}>{i18n.sectionCode()}</div>
            </th>
            {canLeave && (
              <th
                style={{...styles.col, ...styles.colHeader, ...styles.leaveCol}}
              >
                <div style={styles.colText} />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sections.map((section, index) => (
            <tr
              style={{
                ...(index % 2 === 0 ? styles.lightRow : styles.darkRow),
                ...styles.row,
              }}
              key={index}
              className="test-row"
            >
              <td style={{...styles.col, ...styles.sectionNameCol}}>
                <div>{section.name}</div>
              </td>
              <td style={{...styles.col, ...styles.courseCol}}>
                <Link href={section.linkToAssigned} size="s">
                  {section.assignedTitle}
                </Link>
                {!section.is_assigned_single_unit_course &&
                  section.currentUnitTitle && (
                    <div style={styles.currentUnit}>
                      <div>{i18n.currentUnit()}</div>
                      <Link href={section.linkToCurrentUnit} size="s">
                        {section.currentUnitTitle}
                      </Link>
                    </div>
                  )}
              </td>
              <td style={{...styles.col, ...styles.col3Student}}>
                {section.teacherName}
              </td>
              <td
                style={{
                  ...styles.col,
                  ...(isRtl ? styles.sectionCodeColRtl : styles.sectionCodeCol),
                }}
              >
                {this.renderSectionCodeCell(section)}
              </td>
              {canLeave && (
                <td style={{...styles.col, ...styles.leaveCol}}>
                  {section.code && (
                    <MuiButton
                      style={styles.leaveButton}
                      variant="outlined"
                      color="tertiary"
                      size="small"
                      onClick={this.onLeave.bind(
                        this,
                        section.code,
                        section.name
                      )}
                    >
                      {i18n.leaveSection()}
                    </MuiButton>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

// When this table gets converted to reacttabular, it should also
// use styles from /tables/tableConstants.js
const studentSectionsStyles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--borders-neutral-primary)',
    width: styleConstants['content-width'],
  },
  headerRow: {
    fontWeight: 'bold',
    borderColor: 'var(--borders-neutral-primary)',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 1,
  },
  headerRowPadding: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  lightRow: {
    backgroundColor: 'var(--background-neutral-primary)',
  },
  darkRow: {
    backgroundColor: 'var(--background-neutral-secondary)',
  },
  row: {
    borderBottomColor: 'var(--borders-neutral-primary)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    paddingTop: 20,
    paddingBottom: 20,
  },
  col: {
    borderRightWidth: 1,
    borderRightColor: 'var(--borders-neutral-primary)',
    borderRightStyle: 'solid',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    color: 'var(--text-neutral-tertiary)',
    paddingLeft: 20,
    paddingRight: 20,
  },
  colHeader: {
    backgroundColor: 'var(--background-neutral-tertiary)',
  },
  sectionNameCol: {
    width: 310,
  },
  courseCol: {
    width: 310,
  },
  teacherCol: {
    lineHeight: '52px',
    width: 160,
  },
  studentsCol: {
    width: 110,
  },
  sectionCodeCol: {
    lineHeight: '52px',
    whiteSpace: 'nowrap',
    width: 135,
    borderRightWidth: 0,
  },
  sectionCodeColRtl: {
    lineHeight: '52px',
    whiteSpace: 'nowrap',
    width: 210,
  },
  leaveCol: {
    width: 110,
    borderLeftWidth: 1,
    borderLeftColor: 'var(--borders-neutral-primary)',
    borderLeftStyle: 'solid',
  },
  leaveButton: {
    marginLeft: 5,
  },
  colText: {
    color: 'var(--text-neutral-tertiary)',
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    lineHeight: '22px',
  },
  currentUnit: {
    marginTop: 10,
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(SectionsAsStudentTable);
