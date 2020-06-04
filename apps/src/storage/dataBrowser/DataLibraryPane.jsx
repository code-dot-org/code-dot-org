import Radium from 'radium';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {showWarning} from '../redux/data';
import LibraryCategory from './LibraryCategory';
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

  onError = error => {
    if (error.type === WarningType.DUPLICATE_TABLE_NAME) {
      this.props.onShowWarning(error.msg);
    }
  };

  importTable = datasetInfo => {
    if (datasetInfo.current) {
      FirebaseStorage.addCurrentTableToProject(
        datasetInfo.name,
        () => console.log('success'),
        this.onError
      );
    } else {
      FirebaseStorage.copyStaticTable(
        datasetInfo.name,
        () => console.log('success'),
        this.onError
      );
    }
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
