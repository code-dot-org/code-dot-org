import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

export default class StandardsReportHeader extends Component {
  static propTypes = {
    teacherName: PropTypes.string,
    sectionName: PropTypes.string
  };

  render() {
    return (
      <div style={styles.header}>
        <div style={styles.imageAndTitle}>
          <img src="/shared/images/CodeLogo_White.png" style={styles.logo} />
          <div style={styles.headerName}>{i18n.standardsReportHeader()}</div>
        </div>
        <div style={styles.headerRightColumn}>
          <div style={styles.headerRightColumnTitles}>
            <div>{i18n.teacherWithColon()}</div>
            <div>{i18n.sectionWithColon()}</div>
            <div>{i18n.dateWithColon()}</div>
          </div>
          <div style={styles.headerRightColumnItems}>
            <span style={styles.infoStrings}>{this.props.teacherName}</span>
            <span style={styles.infoStrings}>{this.props.sectionName}</span>
            <span style={styles.infoStrings}>
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: color.teal,
    color: color.white
  },
  headerRightColumn: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 20px'
  },
  headerRightColumnTitles: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingRight: 10
  },
  headerRightColumnItems: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Gotham 7r", sans-serif',
    alignItems: 'flex-start',
    paddingRight: 25
  },
  headerName: {
    fontSize: 40,
    marginLeft: 15
  },
  logo: {
    height: 30,
    marginLeft: 30
  },
  imageAndTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoStrings: {
    width: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};
