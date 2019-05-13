import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import DatasetListEntry from './DatasetListEntry';
import FirebaseStorage from '../../storage/firebaseStorage';
import datasetLibrary from '../datasetLibrary.json';

const styles = {
  modal: {
    margin: '0 0 0 5px'
  },
  divider: {
    borderColor: color.purple,
    margin: '5px 0'
  }
};

/**
 * A component for managing access to Code.org hosted datasets
 */
export default class DatasetPicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired
  };

  chooseAsset = (name, url) => {
    FirebaseStorage.importDataset(
      name,
      url,
      () => console.log('importDataset onSuccess'),
      () => console.log('importDataset onError')
    );
    this.props.assetChosen(name);
  };

  render() {
    const datasetEntries = datasetLibrary.datasets.map(dataset => (
      <DatasetListEntry
        key={dataset.name}
        name={dataset.name}
        description={dataset.description}
        url={dataset.url}
        onChoose={this.chooseAsset}
      />
    ));

    return (
      <div className="modal-content" style={styles.root}>
        <p>{i18n.chooseDataset()}</p>
        <hr style={styles.divider} />
        <table>
          <tbody>{datasetEntries}</tbody>
        </table>
      </div>
    );
  }
}
