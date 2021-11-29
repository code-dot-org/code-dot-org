import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import styleConstants from '../../styleConstants';
import i18n from '@cdo/locale';
import shapes from './shapes';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import Button from '@cdo/apps/templates/Button';
import {tableLayoutStyles} from '../tables/tableConstants';

class SectionsAsStudentTable extends React.Component {
  static propTypes = {
    sections: shapes.sections,
    isRtl: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
    updateSections: PropTypes.func,
    updateSectionsResult: PropTypes.func
  };

  onLeave(sectionCode, sectionName) {
    $.post({
      url: `/api/v1/sections/${sectionCode}/leave`,
      dataType: 'json'
    }).done(data => {
      this.props.updateSections(data.sections);
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

    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <td
              style={{
                ...styles.col,
                ...styles.sectionNameCol,
                ...styles.headerRowPadding
              }}
            >
              <div style={styles.colText}>{i18n.section()}</div>
            </td>
            <td style={{...styles.col, ...styles.courseCol}}>
              <div style={styles.colText}>{i18n.course()}</div>
            </td>
            <td style={{...styles.col, ...styles.teacherCol}}>
              <div style={styles.colText}>{i18n.teacher()}</div>
            </td>
            <td
              style={{
                ...styles.col,
                ...(isRtl ? styles.sectionCodeColRtl : styles.sectionCodeCol)
              }}
            >
              <div style={styles.colText}>{i18n.sectionCode()}</div>
            </td>
            {canLeave && (
              <td style={{...styles.col, ...styles.leaveCol}}>
                <div style={styles.colText} />
              </td>
            )}
          </tr>
        </thead>
        <tbody>
          {sections.map((section, index) => (
            <tr
              style={{
                ...(index % 2 === 0 ? styles.lightRow : styles.darkRow),
                ...styles.row
              }}
              key={index}
              className="test-row"
            >
              <td style={{...styles.col, ...styles.sectionNameCol}}>
                <div>{section.name}</div>
              </td>
              <td style={{...styles.col, ...styles.courseCol}}>
                <a href={section.linkToAssigned} style={styles.link}>
                  {section.assignedTitle}
                </a>
                {section.currentUnitTitle && (
                  <div style={styles.currentUnit}>
                    <div>{i18n.currentUnit()}</div>
                    <a
                      href={section.linkToCurrentUnit}
                      style={tableLayoutStyles.link}
                    >
                      {section.currentUnitTitle}
                    </a>
                  </div>
                )}
              </td>
              <td style={{...styles.col, ...styles.col3Student}}>
                {section.teacherName}
              </td>
              <td
                style={{
                  ...styles.col,
                  ...(isRtl ? styles.sectionCodeColRtl : styles.sectionCodeCol)
                }}
              >
                {section.login_type === SectionLoginType.clever
                  ? i18n.loginTypeClever()
                  : section.login_type === SectionLoginType.google_classroom
                  ? i18n.loginTypeGoogleClassroom()
                  : section.code}
              </td>
              {canLeave && (
                <td style={{...styles.col, ...styles.leaveCol}}>
                  {!/^(C|G)-/.test(section.code) && (
                    <Button
                      __useDeprecatedTag
                      style={{marginLeft: 5}}
                      text={i18n.leaveSection()}
                      onClick={this.onLeave.bind(
                        this,
                        section.code,
                        section.name
                      )}
                      color={Button.ButtonColor.gray}
                    />
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
const styles = {
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
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 1
  },
  headerRowPadding: {
    paddingTop: 20,
    paddingBottom: 20
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
    paddingTop: 20,
    paddingBottom: 20
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
    paddingRight: 20
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
    whiteSpace: 'nowrap',
    width: 135,
    borderRightWidth: 0
  },
  sectionCodeColRtl: {
    lineHeight: '52px',
    whiteSpace: 'nowrap',
    width: 210
  },
  leaveCol: {
    width: 110,
    borderLeftWidth: 1,
    borderLeftColor: color.border_light_gray,
    borderLeftStyle: 'solid'
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
  },
  currentUnit: {
    marginTop: 10
  }
};

export default connect(state => ({
  isRtl: state.isRtl
}))(SectionsAsStudentTable);
