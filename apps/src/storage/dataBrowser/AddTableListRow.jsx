import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import dataStyles from './data-styles.module.scss';

const INITIAL_STATE = {
  newTableName: '',
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

  handleInputChange = event => {
    this.setState({newTableName: event.target.value});
  };

  handleKeyUp = event => {
    if (event.key === 'Enter') {
      this.handleAdd();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  render() {
    return (
      <tr className={dataStyles.row}>
        <td className={dataStyles.cell}>
          <input
            className={classNames('uitest-add-table-input', dataStyles.input)}
            placeholder={msg.dataTableNamePlaceholder()}
            value={this.state.newTableName}
            onChange={this.handleInputChange}
            onKeyUp={this.handleKeyUp}
          />
        </td>
        <td className={dataStyles.cell}>
          <button
            className={classNames(
              'uitest-add-table-btn',
              dataStyles.button,
              dataStyles.buttonBlue
            )}
            type="button"
            onClick={this.handleAdd}
          >
            {msg.add()}
          </button>
        </td>
      </tr>
    );
  }
}

export default AddTableListRow;
