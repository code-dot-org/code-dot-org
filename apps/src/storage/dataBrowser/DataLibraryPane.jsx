import Radium from 'radium';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {showWarning} from '../redux/data';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import LibraryCategory from './LibraryCategory';
import SearchBar from '@cdo/apps/templates/SearchBar';
import {getDatasetInfo} from './dataUtils';
import color from '../../util/color';
import msg from '@cdo/locale';
import PreviewModal from './PreviewModal';
import FirebaseStorage from '../firebaseStorage';
import {WarningType} from '../constants';
import experiments from '../../util/experiments';
import _ from 'lodash';

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 270,
    boxSizing: 'border-box',
    borderRight: '1px solid gray',
    overflowY: 'auto',
    padding: 10
  },
  divider: {
    borderColor: color.light_gray,
    margin: '5px 0px 10px 0px'
  }
};

class DataLibraryPane extends React.Component {
  static propTypes = {
    // Provided via redux
    libraryManifest: PropTypes.object.isRequired,
    onShowWarning: PropTypes.func.isRequired
  };

  state = {
    search: ''
  };

  onError = error => {
    if (
      error.type === WarningType.DUPLICATE_TABLE_NAME ||
      error.type === WarningType.MAX_TABLES_EXCEEDED
    ) {
      this.props.onShowWarning(error.msg);
    }
  };

  importTable = datasetInfo => {
    if (datasetInfo.current) {
      FirebaseStorage.addCurrentTableToProject(
        datasetInfo.name,
        () => {},
        this.onError
      );
    } else {
      FirebaseStorage.copyStaticTable(datasetInfo.name, () => {}, this.onError);
    }
  };

  search = e => {
    let searchValue = '';
    if (e !== undefined) {
      searchValue = e.target.value.toLowerCase();
    }
    this.setState({
      search: searchValue
    });
  };

  filterCategories = allCategories => {
    const searchRegExp = new RegExp('(?:\\s+|^)' + this.state.search, 'i');
    let potentialCategories = allCategories.reduce(
      (filteredCategories, category) => {
        category.datasets = category.datasets.filter(dataset => {
          const datasetInfo = getDatasetInfo(
            dataset,
            this.props.libraryManifest.tables
          );
          return (
            searchRegExp.test(dataset) ||
            searchRegExp.test(datasetInfo.description)
          );
        });
        if (category.datasets.length > 0) {
          filteredCategories.push(category);
        }
        return filteredCategories;
      },
      []
    );
    return potentialCategories;
  };

  render() {
    const showUnpublishedTables = experiments.isEnabled(
      experiments.SHOW_UNPUBLISHED_FIREBASE_TABLES
    );
    let categories = (this.props.libraryManifest.categories || []).filter(
      category => showUnpublishedTables || category.published
    );
    categories = this.filterCategories(_.cloneDeep(categories));
    return (
      <div style={styles.container}>
        <SafeMarkdown
          markdown={msg.dataLibraryDescription()}
          openExternalLinksInNewTab
        />
        <SearchBar
          placeholderText={msg.dataLibrarySearchPlacholder()}
          onChange={this.search}
          clearButton={this.state.search.length > 0}
        />
        <hr style={styles.divider} />
        {categories.map(category => (
          <LibraryCategory
            key={category.name}
            name={category.name}
            datasets={category.datasets}
            description={category.description}
            importTable={this.importTable}
            forceExpanded={this.state.search.length > 0}
          />
        ))}
        <PreviewModal importTable={this.importTable} />
      </div>
    );
  }
}

export default connect(
  state => ({
    libraryManifest: state.data.libraryManifest || {}
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    }
  })
)(Radium(DataLibraryPane));
