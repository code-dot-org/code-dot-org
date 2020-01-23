import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

const styles = {
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: color.teal,
    color: color.white
  },
  headerRightColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  headerName: {
    fontSize: 40
  }
};

export default class StandardsReportHeader extends Component {
  static propTypes = {
    teacherName: PropTypes.string,
    sectionName: PropTypes.string
  };

  render() {
    return (
      <div style={styles.header}>
        <div style={styles.headerName}>{i18n.standardsReportHeader()}</div>
        <div style={styles.headerRightColumn}>
          <span>
            {i18n.teacherWithColon({teacher: this.props.teacherName})}
          </span>
          <span>
            {i18n.sectionAndName({sectionName: this.props.sectionName})}
          </span>
          <span>{i18n.dateAndDate({date: new Date().toLocaleString()})}</span>
        </div>
      </div>
    );
  }
}
