import PropTypes from 'prop-types';
import React from 'react';

export default class MLModelSelectorRow extends React.Component {
  static propTypes = {
    modelIds: PropTypes.array,
    selectedId: PropTypes.string
  };

  state = {
    selectedId: this.props.selectedId
  };

  render() {
    return (
      <div>
        <select>
          {this.props.modelIds.map((modelId, index) => {
            return (
              <option key={index} value={modelId}>
                {modelId}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}
