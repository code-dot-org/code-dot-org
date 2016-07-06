/**
 * @overview Component for editing key/value pairs.
 */

import { DataView } from './constants';
import FirebaseStorage from './firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { castValue } from './dataUtils';
import { changeView } from './redux/data';
import { connect } from 'react-redux';
import * as dataStyles from './dataStyles';

const DataProperties = React.createClass({
  propTypes: {
    // from redux state
    view: React.PropTypes.oneOf(Object.keys(DataView)),
    keyValueData: React.PropTypes.object.isRequired,

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  getValue(key) {
    return String(JSON.parse(this.props.keyValueData[key]));
  },

  render() {
    const visible = (DataView.PROPERTIES === this.props.view);
    return (
      <div id='dataProperties' style={{display: visible ? 'block' : 'none'}}>
        <h4>
         <a
             href='#'
             style={dataStyles.link}
             onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
         >
           Data
         </a>
         &nbsp;&gt; Key/value pairs
        </h4>

        {/* placeholder display of key-value pairs */}
        <table>
          <colgroup>
            <col width='200'/>
            <col width='200'/>
            <col width='162'/>
          </colgroup>
          <tbody>
            <tr>
              <th style={dataStyles.headerCell}>Key</th>
              <th style={dataStyles.headerCell}>Value</th>
              <th style={dataStyles.headerCell}></th>
            </tr>

            <AddKeyRow/>

            {
              Object.keys(this.props.keyValueData).map(key => (
                <EditKeyRow key={key} keyName={key} value={this.getValue(key)}/>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  }
});

const AddKeyRow = Radium(React.createClass({
  getInitialState() {
    return {
      key: '',
      value: ''
    };
  },

  handleKeyChange(event) {
    this.setState({key: event.target.value});
  },

  handleValueChange(event) {
    this.setState({value: event.target.value});
  },

  handleAdd() {
    FirebaseStorage.setKeyValue(
      this.state.key,
      castValue(this.state.value),
      () => this.setState(this.getInitialState()),
      msg => console.warn(msg));
  },

  render() {
    return (
      <tr style={dataStyles.addRow}>
        <td style={dataStyles.cell}>
          <input
              style={dataStyles.input}
              onChange={this.handleKeyChange}
              value={this.state.key}
          ></input>
        </td>
        <td style={dataStyles.cell}>
          <input
              style={dataStyles.input}
              onChange={this.handleValueChange}
              value={this.state.value}
          ></input>
        </td>
        <td style={dataStyles.cell}>
          <button
              className="btn btn-primary"
              style={dataStyles.button}
              onClick={this.handleAdd}
          >
            Add pair
          </button>
        </td>
      </tr>
    );
  }
}));

const EditKeyRow = Radium(React.createClass({
  propTypes: {
    keyName: React.PropTypes.string.isRequired,
    value: React.PropTypes.any.isRequired
  },

  getInitialState() {
    return {
      isEditing: false,
      newValue: this.props.value
    };
  },

  handleChange(event) {
    this.setState({newValue: event.target.value});
  },

  handleEdit() {
    this.setState({
      isEditing: true,
      newValue: this.props.value
    });
  },

  handleSave() {
    const value = castValue(this.state.newValue);
    FirebaseStorage.setKeyValue(this.props.keyName, value, this.handleSaveComplete,
      this.handleError);
  },

  handleSaveComplete() {
    this.setState({isEditing: false});
  },

  handleError(msg) {
    console.warn(msg);
  },

  handleDelete() {
    FirebaseStorage.deleteKeyValue(this.props.keyName, undefined, this.handleError);
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        <td style={dataStyles.cell}>{this.props.keyName}</td>
        <td style={dataStyles.cell}>
          {this.state.isEditing ?
            <input
                style={dataStyles.input}
                value={this.state.newValue}
                onChange={this.handleChange}
            ></input> :
            this.props.value}
        </td>
        <td style={dataStyles.cell}>
          {
            this.state.isEditing ?
              <button
                  className="btn btn-primary"
                  style={dataStyles.editButton}
                  onClick={this.handleSave}
              >
                Save
              </button> :
              <button
                className="btn"
                style={dataStyles.editButton}
                onClick={this.handleEdit}
              >
                Edit
              </button>
          }

          <button
              className="btn btn-danger"
              style={dataStyles.button}
              onClick={this.handleDelete}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
}));

export default connect(state => ({
  view: state.data.view,
  keyValueData: state.data.keyValueData || {}
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataProperties));
