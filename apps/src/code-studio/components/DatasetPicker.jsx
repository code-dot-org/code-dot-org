import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';
import DatasetLibrary from './DatasetLibrary';
import i18n from '@cdo/locale';

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
 * A component for managing hosted sounds and the Sound Library.
 */
export default class DatasetPicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func
  };
  getAssetNameWithPrefix = dataset => {
    console.log('here');
    this.props.assetChosen(dataset);
  };
  render() {
    let title = <p>{i18n.chooseSounds()}</p>;

    const body = <DatasetLibrary assetChosen={this.getAssetNameWithPrefix} />;
    return (
      <div className="modal-content" style={styles.root}>
        {title}
        <hr style={styles.divider} />
        {body}
      </div>
    );
  }
}
