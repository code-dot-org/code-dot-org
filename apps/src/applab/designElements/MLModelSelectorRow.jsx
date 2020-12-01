import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {actions} from '../redux/applab';

class MLModelSelectorRow extends React.Component {
  static propTypes = {
    modelIds: PropTypes.array,
    selectedId: PropTypes.string,
    setMLModelId: PropTypes.function
  };

  handleChange = event => {
    event.preventDefault();
    this.props.setMLModelId(event.target.value);
  };

  render() {
    return (
      <div>
        <select
          onChange={event => this.handleChange(event)}
          value={this.props.selectedId}
        >
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

export default connect(
  state => ({
    selectedId: state.mlModelDetails.modelId
  }),
  dispatch => ({
    setMLModelId(modelId) {
      dispatch(actions.setMLModelId(modelId));
    }
  })
)(MLModelSelectorRow);
