import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import DatasetListEntry from './DatasetListEntry';
import FirebaseStorage from '../../storage/firebaseStorage';

const styles = {
  root: {
    margin: '0 0 0 5px'
  },
  divider: {
    borderColor: color.purple,
    margin: '5px 0'
  },
  warning: {
    color: color.red,
    fontSize: 13,
    fontWeight: 'bold'
  }
};

/**
 * A component for managing access to Code.org hosted datasets
 */
export default class DatasetPicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func
  };

  chooseAsset = (name, url) => {
    console.log('here!!');
    FirebaseStorage.createTable(
      name,
      () => console.log('createTable onSuccess'),
      () => console.log('createTable onError')
    );
    FirebaseStorage.importCsv(
      name,
      url,
      () => console.log('importCsv onSuccess'),
      () => console.log('importCsv onError')
    );
    this.props.assetChosen(name);
  };

  render() {
    let datasets = [
      {name: 'Dogs', description: 'something about dogs', url: 'dogUrl'},
      {
        name: 'Words',
        description: 'something something words',
        url:
          'word,partOfSpeech,Frequency,Rank\nthe,article,22038615,1\nbe,verb,12545825,2\nand,conjunction,10741073,3'
      }
    ];

    const datasetEntries = datasets.map(d => {
      const choose =
        this.chooseAsset && this.chooseAsset.bind(this, d.name, d.url);
      return (
        <DatasetListEntry
          key={d.name}
          name={d.name}
          description={d.description}
          url={d.url}
          onChoose={choose}
        />
      );
    });

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
