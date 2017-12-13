import Radium from 'radium';
import React, {PropTypes} from 'react';
import msg from '@cdo/locale';
import * as dataStyles from './dataStyles';

const INITIAL_STATE = {
  newTableName: ''
};

class AddTableListRow extends React.Component {
  static propTypes = {
    onTableAdd: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  handleAdd = () => {
    if (this.state.newTableName) {
      this.props.onTableAdd(this.state.newTableName);
      this.setState(INITIAL_STATE);
    }
  };

  handleInputChange = (event) => {
    this.setState({newTableName: event.target.value});
  };

  handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleAdd();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            placeholder={msg.dataTableNamePlaceholder()}
            value={this.state.newTableName}
            onChange={this.handleInputChange}
            onKeyUp={this.handleKeyUp}
          />
        </td>
        <td style={dataStyles.cell}>
          <button
            style={dataStyles.blueButton}
            onClick={this.handleAdd}
          >
            Add
          </button>
        </td>
      </tr>
    );
  }
}

export default Radium(AddTableListRow);
