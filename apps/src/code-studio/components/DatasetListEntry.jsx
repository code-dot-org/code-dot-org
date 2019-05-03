import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';

/**
 * Component for a single dataset in the Dataset Picker
 * Used in App Lab
 */
export default class DatasetListEntry extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    name: PropTypes.string,
    description: PropTypes.string
  };

  chooseAsset() {
    console.log('here!!');
  }

  render() {
    return (
      <tr>
        <td width="250">{this.props.name}</td>
        <td width="250">{this.props.description}</td>
        <td width="250" style={{textAlign: 'right'}}>
          <button type="button" onClick={this.chooseAsset}>
            {i18n.choose()}
          </button>
        </td>
      </tr>
    );
  }
}
