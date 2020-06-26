import Radium from 'radium';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {showWarning} from '../redux/data';
import LibraryCategory from './LibraryCategory';
import SearchBar from '@cdo/apps/templates/SearchBar';
import {getDatasetInfo} from './dataUtils';
import color from '../../util/color';
import msg from '@cdo/locale';
import PreviewModal from './PreviewModal';
import FirebaseStorage from '../firebaseStorage';
import {WarningType} from '../constants';
import experiments from '../../util/experiments';

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
    allCategories: this.props.libraryManifest.categories
  };

  onError = error => {
    if (error.type === WarningType.DUPLICATE_TABLE_NAME) {
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
    //console.log(e.target.value.toLowerCase());
    const searchRegExp = new RegExp(
      '(?:\\s+|_|^|-)' + e.target.value.toLowerCase(),
      'i'
    );
    //console.log(this.props.libraryManifest.categories);
    let potentialCategories = this.props.libraryManifest.categories.map(
      category => {
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
        return category;
      }
    );
    potentialCategories = potentialCategories.filter(
      category => category.datasets.length > 0
    );
    console.log(potentialCategories);
    // at this level we can filter
    /*potentialCategories.forEach(category => {
      let filteredDatasets = category.datasets.filter(dataset => {
        const datasetInfo = getDatasetInfo(
          dataset,
          this.props.libraryManifest.tables
        );
        return searchRegExp.test(dataset) || searchRegExp.test(datasetInfo.description);
      });
      console.log(filteredDatasets);
    });*/
  };

  render() {
    const showUnpublishedTables = experiments.isEnabled(
      experiments.SHOW_UNPUBLISHED_FIREBASE_TABLES
    );
    const categories = (this.props.libraryManifest.categories || []).filter(
      category => showUnpublishedTables || category.published
    );
    return (
      <div style={styles.container}>
        <p>{msg.dataLibraryDescription()}</p>
        <SearchBar placeholderText={'Search'} onChange={this.search} />
        <hr style={styles.divider} />
        {categories.map(category => (
          <LibraryCategory
            key={category.name}
            name={category.name}
            datasets={category.datasets}
            description={category.description}
            importTable={this.importTable}
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
