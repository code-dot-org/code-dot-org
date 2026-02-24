import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import SearchBar from '@cdo/apps/sharedComponents/SearchBar';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import msg from '@cdo/locale';

import experiments from '../../util/experiments';
import {WarningType} from '../constants';
import {showWarning} from '../redux/data';
import {storageBackend} from '../storage';

import {getDatasetInfo} from './dataUtils';
import LibraryCategory from './LibraryCategory';
import {refreshCurrentDataView} from './loadDataForView';
import PreviewModal from './PreviewModal';

import style from './data-library-pane.module.scss';

class DataLibraryPane extends React.Component {
  static propTypes = {
    // Provided via redux
    libraryManifest: PropTypes.object.isRequired,
    onShowWarning: PropTypes.func.isRequired,
  };

  state = {
    search: '',
  };

  onError = error => {
    if (
      error.type === WarningType.DUPLICATE_TABLE_NAME ||
      error.type === WarningType.MAX_TABLES_EXCEEDED
    ) {
      this.props.onShowWarning(error.msg);
    }
  };

  importTable = datasetInfo =>
    storageBackend()
      .addSharedTable(datasetInfo.name)
      .then(() => refreshCurrentDataView());

  search = e => {
    let searchValue = '';
    if (e !== undefined) {
      searchValue = e.target.value.toLowerCase();
    }
    this.setState({
      search: searchValue,
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
      experiments.SHOW_UNPUBLISHED_DATASET_TABLES
    );
    let categories = (this.props.libraryManifest.categories || []).filter(
      category => showUnpublishedTables || category.published
    );
    categories = this.filterCategories(_.cloneDeep(categories));
    return (
      <div className={style.container}>
        <SafeMarkdown
          markdown={msg.dataLibraryDescription()}
          openExternalLinksInNewTab
        />
        <SearchBar
          placeholderText={msg.dataLibrarySearchPlacholder()}
          onChange={this.search}
          clearButton={this.state.search.length > 0}
        />
        <hr className={style.divider} />
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
    libraryManifest: state.data.libraryManifest || {},
  }),
  dispatch => ({
    onShowWarning(warningMsg, warningTitle) {
      dispatch(showWarning(warningMsg, warningTitle));
    },
  })
)(DataLibraryPane);
