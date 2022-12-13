import React from 'react';

const baseUrl = window.location.origin + '/musiclab';

const optionsList = [
  {
    name: 'blocks',
    type: 'radio',
    values: [
      {value: 'advanced', description: 'The default set of advanced blocks.'},
      {value: 'simple', description: 'A simple set of blocks.'}
    ]
  },
  {
    name: 'instructions-position',
    type: 'radio',
    values: [
      {value: 'top', description: 'Instructions begin at the top.'},
      {value: 'left', description: 'Instructions begin on the left.'},
      {value: 'right', description: 'Instructions begin on the right.'}
    ]
  },
  {
    name: 'library',
    type: 'string',
    description: 'Use a specific music library file.'
  },
  {
    name: 'show-upload',
    type: 'radio',
    values: [
      {value: 'false', description: "Default: don't show upload option."},
      {value: 'true', description: 'Show upload option.'}
    ]
  }
];

export default class MusicMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: {},
      values: {}
    };
  }

  handleCheckChange(e) {
    const name = e.target.name;
    const isChecked = e.target.checked;

    let checked = {...this.state.checked};
    if (isChecked) {
      checked[name] = true;
    } else {
      delete checked[name];
    }
    this.setState({checked});
  }

  handleRadioChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    let values = {...this.state.values};
    values[name] = value;
    this.setState({values});
  };

  handleStringChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    let values = {...this.state.values};
    values[name] = value;
    this.setState({values});
  };

  renderRadio(option) {
    return (
      <div>
        {option.values.map(value => {
          return (
            <div key={value.value}>
              <input
                type="radio"
                style={{marginTop: -3, marginRight: 5}}
                name={option.name}
                value={value.value}
                onChange={this.handleRadioChange}
              />
              <b>{value.value}</b>: {value.description}
            </div>
          );
        })}
      </div>
    );
  }

  renderString(option) {
    return (
      <div>
        <input
          type="text"
          style={{marginRight: 10}}
          name={option.name}
          value={this.state.values[option.name]}
          onChange={this.handleStringChange}
        />
        {option.description}
      </div>
    );
  }

  renderResults() {
    return (
      <div style={{fontSize: 18, margin: '20px 0'}}>
        {baseUrl}?
        {optionsList
          .map(option => {
            return (
              this.state.checked[option.name] &&
              option.name + '=' + this.state.values[option.name]
            );
          })
          .filter(entry => entry)
          .join('&')}
      </div>
    );
  }

  renderOptions() {
    return optionsList.map(option => {
      return (
        <div key={option.name}>
          <input
            type="checkbox"
            name={option.name}
            checked={this.state.checked[option.name]}
            style={{marginTop: -3, marginRight: 5}}
            onChange={e => this.handleCheckChange(e)}
          />
          {option.name}
          <div style={{padding: 10}}>
            {option.type === 'radio' && this.renderRadio(option)}
            {option.type === 'string' && this.renderString(option)}
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        <h1>Music Lab options</h1>
        {this.renderResults()}
        {this.renderOptions()}
      </div>
    );
  }
}
