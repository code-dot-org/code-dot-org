import FirebaseStorage from '../firebaseStorage';
import PendingButton from '../../templates/PendingButton';
import Radium from 'radium';
import React from 'react';
import { castValue } from './dataUtils';
import * as dataStyles from './dataStyles';
import _ from 'lodash';

const AddTableRow = React.createClass({
  propTypes: {
    columnNames: React.PropTypes.array.isRequired,
    tableName: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      isAdding: false,
      // An object whose keys are column names and values are the raw user input.
      newInput: {},
    };
  },

  handleChange(columnName, event) {
    const newInput = Object.assign({}, this.state.newInput, {
      [columnName]: event.target.value
    });
    this.setState({ newInput });
  },

  handleAdd() {
    this.setState({isAdding: true});
    FirebaseStorage.createRecord(
      this.props.tableName,
      _.mapValues(this.state.newInput, castValue),
      () => this.setState(this.getInitialState()),
      msg => console.warn(msg));
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleAdd();
    } else if (event.key === 'Escape') {
      this.setState(this.getInitialState());
    }
  },

  render() {
    return (
      <tr style={dataStyles.row} id="addDataTableRow">
        {
          this.props.columnNames.map(columnName => (
            <td key={columnName} style={dataStyles.cell}>
              {
                (columnName === 'id') ?
                  <span style={{color: 'darkgray'}}>#</span> :
                  <input
                    style={dataStyles.input}
                    value={this.state.newInput[columnName] || ''}
                    placeholder="enter text"
                    onChange={event => this.handleChange(columnName, event)}
                    onKeyUp={this.handleKeyUp}
                  />
              }
            </td>
          ))
        }

        <td style={dataStyles.cell}/>

        <td style={dataStyles.addButtonCell}>
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText="Adding..."
            style={dataStyles.blueButton}
            text="Add Row"
          />
        </td>
      </tr>
    );
  }
});

export default Radium(AddTableRow);
