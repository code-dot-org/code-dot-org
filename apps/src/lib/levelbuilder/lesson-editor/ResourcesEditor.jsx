import React, {Component} from 'react';

export default class ResourcesEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      resourceInput: ''
    };
  }

  addResource = e => {
    console.log('why');
    e.preventDefault();
    var {resources, resourceInput} = this.state;
    resources.push(resourceInput);
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
          value={JSON.stringify(this.state.resources)}
        />
        {this.state.resources.map((resource, index) => (
          <span key={index}>
            {resource}
            {'\n'}
          </span>
        ))}
        <label>Select a resource or add a new one</label>
        <input
          type="text"
          onChange={this.handleResourceInputChange}
          value={this.state.resourceInput}
        />
        <button onClick={this.addResource} type="button">
          Add
        </button>
      </div>
    );
  }
}
