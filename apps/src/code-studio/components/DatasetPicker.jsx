import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import i18n from '@cdo/locale';
import DatasetListEntry from './DatasetListEntry';

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
  render() {
    let datasets = [
      {name: 'Dogs', description: 'something about dogs', url: 'dogUrl'},
      {name: 'Words', description: 'something something words', url: 'wordUrl'}
    ];

    const datasetEntries = datasets.map(d => {
      return (
        <DatasetListEntry
          key={d.name}
          name={d.name}
          description={d.description}
          url={d.url}
          assetChosen={this.props.assetChosen}
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
