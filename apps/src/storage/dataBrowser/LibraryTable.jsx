import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React from 'react';
import FontAwesome from '../../templates/FontAwesome';
import msg from '@cdo/locale';
import color from '../../util/color';
import {showPreview} from '../redux/data';
import {getDatasetInfo} from './dataUtils';
import experiments from '../../util/experiments';

const styles = {
  tableName: {
    fontFamily: '"Gotham 7r", sans-serif',
    cursor: 'pointer',
    color: color.dark_charcoal
  },
  tableDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.dark_charcoal,
    wordBreak: 'break-word'
  },
  preview: {
    backgroundColor: color.background_gray,
    borderColor: color.lighter_gray,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: '14px',
    padding: '1px 7px 2px',
    height: '30px',
    width: '95px',
    margin: 10,
    marginLeft: 0
  },
  import: {
    backgroundColor: color.orange,
    border: 'none',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: '14px',
    color: color.white,
    padding: '1px 7px 2px',
    height: '30px',
    width: '95px',
    margin: 10,
    marginRight: 0
  },
  collapsibleContainer: {
    paddingLeft: '16px'
  },
  lastUpdated: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: '12px',
    color: color.light_gray
  },
  lastUpdatedTime: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: '12px',
    color: color.light_gray
  }
};

class LibraryTable extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    importTable: PropTypes.func.isRequired,

    // Provided via redux
    libraryManifest: PropTypes.object.isRequired,
    onShowPreview: PropTypes.func.isRequired
  };

  state = {
    collapsed: true
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  render() {
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    const datasetInfo = getDatasetInfo(
      this.props.name,
      this.props.libraryManifest.tables
    );
    const shouldShowTable =
      datasetInfo &&
      (datasetInfo.published ||
        experiments.isEnabled(experiments.SHOW_UNPUBLISHED_FIREBASE_TABLES));
    if (!shouldShowTable) {
      return null;
    }

    return (
      <div>
        <a style={styles.tableName} onClick={this.toggleCollapsed}>
          <FontAwesome className="fa fa-fw" icon={icon} />
          <span>{this.props.name}</span>
        </a>
        {!this.state.collapsed && (
          <div style={styles.collapsibleContainer}>
            {/* TODO: Add last updated time */}
            <div style={styles.tableDescription}>
              {datasetInfo.description}
              {datasetInfo.sourceUrl && (
                <span style={{display: 'inline-block'}}>
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
                onClick={() => this.props.onShowPreview(this.props.name)}
              >
                {msg.preview()}
              </button>
              <button
                style={styles.import}
                type="button"
                onClick={() => this.props.importTable(datasetInfo)}
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

export default connect(
  state => ({
    libraryManifest: state.data.libraryManifest || {}
  }),
  dispatch => ({
    onShowPreview(tableName) {
      dispatch(showPreview(tableName));
    }
  })
)(LibraryTable);
