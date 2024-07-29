import moment from 'moment/moment';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import msg from '@cdo/locale';

import FontAwesome from '../../templates/FontAwesome';
import color from '../../util/color';
import experiments from '../../util/experiments';
import {showPreview} from '../redux/data';

import {getDatasetInfo} from './dataUtils';
import TableDescription from './TableDescription';

class LibraryTable extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    importTable: PropTypes.func.isRequired,

    // Provided via redux
    libraryManifest: PropTypes.object.isRequired,
    locale: PropTypes.string,
    onShowPreview: PropTypes.func.isRequired,
  };

  state = {
    collapsed: true,
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed,
    });

  render() {
    const {name, libraryManifest, locale, onShowPreview, importTable} =
      this.props;
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    const datasetInfo = getDatasetInfo(name, libraryManifest.tables);
    const shouldShowTable =
      datasetInfo &&
      (datasetInfo.published ||
        experiments.isEnabled(experiments.SHOW_UNPUBLISHED_DATASET_TABLES));
    if (!shouldShowTable) {
      return null;
    }

    if (locale) {
      moment.locale(locale);
    }

    return (
      <div>
        <a
          style={styles.tableName}
          onClick={this.toggleCollapsed}
          className="uitest-dataset-table-link"
        >
          <FontAwesome className="fa fa-fw" icon={icon} />
          <span>{name}</span>
        </a>
        {!this.state.collapsed && (
          <div style={styles.collapsibleContainer}>
            <div style={styles.tableDescription}>
              {datasetInfo.lastUpdated && (
                <span style={styles.lastUpdated}>
                  {msg.lastUpdatedWithTime({
                    time: moment(datasetInfo.lastUpdated).fromNow(),
                  })}
                </span>
              )}
              <TableDescription
                tableName={name}
                libraryTables={libraryManifest.tables}
              />
              {datasetInfo.sourceUrl && (
                <span style={{display: 'block'}}>
                  {msg.dataSource() + ': '}
                  <a href={datasetInfo.sourceUrl}>
                    {datasetInfo.sourceText || datasetInfo.sourceUrl}
                  </a>
                </span>
              )}
            </div>
            <div>
              <button
                style={styles.preview}
                type="button"
                onClick={() => onShowPreview(this.props.name)}
                className="uitest-dataset-preview-btn"
              >
                {msg.preview()}
              </button>
              <button
                style={styles.import}
                type="button"
                onClick={() => importTable(datasetInfo)}
              >
                {msg.import()}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  tableName: {
    ...fontConstants['main-font-bold'],
    cursor: 'pointer',
    color: color.dark_charcoal,
  },
  tableDescription: {
    ...fontConstants['main-font-regular'],
    color: color.dark_charcoal,
    wordBreak: 'break-word',
  },
  preview: {
    backgroundColor: color.background_gray,
    borderColor: color.lighter_gray,
    ...fontConstants['main-font-regular'],
    fontSize: '14px',
    padding: '1px 7px 2px',
    height: '30px',
    width: '90px',
    margin: 10,
    marginLeft: 0,
  },
  import: {
    backgroundColor: color.orange,
    border: 'none',
    ...fontConstants['main-font-semi-bold'],
    fontSize: '14px',
    color: color.white,
    padding: '1px 7px 2px',
    height: '30px',
    width: '90px',
    margin: 10,
    marginRight: 0,
  },
  collapsibleContainer: {
    paddingLeft: '16px',
  },
  lastUpdated: {
    ...fontConstants['main-font-regular'],
    fontSize: '12px',
    color: color.light_gray,
    display: 'inline-block',
  },
};

export default connect(
  state => ({
    libraryManifest: state.data.libraryManifest || {},
    locale: state.pageConstants && state.pageConstants.locale,
  }),
  dispatch => ({
    onShowPreview(tableName) {
      dispatch(showPreview(tableName));
    },
  })
)(LibraryTable);
