import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

export default class ResourcesEditor extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(resourceShape)
  };

  constructor(props) {
    super(props);

    console.log(props);
    this.state = {
      resources: props.resources || [],
      resourceInput: ''
    };
  }

  addResource = e => {
    e.preventDefault();
    var {resources, resourceInput} = this.state;
    resources.push({key: resourceInput});
    this.setState({resources});
  };

  handleResourceInputChange = e => {
    this.setState({resourceInput: e.target.value});
  };

  render() {
    return (
      <div>
        <input
          type="hidden"
          name="resources"
          value={JSON.stringify(this.state.resources.map(r => r.key))}
        />
        <label>Select a resource or add a new one</label>
        <input
          type="text"
          onChange={this.handleResourceInputChange}
          value={this.state.resourceInput}
        />
        <button onClick={this.addResource} type="button">
          Add
        </button>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th style={{width: '20%'}}>Key</th>
              <th style={{width: '35%'}}>Name</th>
              <th style={{width: '45%'}}>URL</th>
            </tr>
          </thead>
          <tbody>
            {this.state.resources.map((resource, index) => (
              <tr key={resource.key}>
                <td>{resource.key}</td>
                <td>{resource.name}</td>
                <td>{resource.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
