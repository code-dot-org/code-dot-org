import React from 'react';
import {LOCAL_STORAGE, REMOTE_STORAGE} from '../music/constants';

const baseUrl = window.location.origin + '/musiclab';

const optionsList = [
  {
    name: 'blocks',
    type: 'radio',
    values: [
      {value: 'simple', description: 'A simple set of blocks.'},
      {
        value: 'simple2',
        description:
          'A simple set of blocks, with together/sequential and functions.',
      },
      {value: 'advanced', description: 'An advanced set of blocks.'},
      {value: 'tracks', description: 'A tracks-based model set of blocks.'},
    ],
  },
  {
    name: 'instructions-position',
    type: 'radio',
    values: [
      {value: 'top', description: 'Instructions begin at the top.'},
      {value: 'left', description: 'Instructions begin on the left.'},
      {value: 'right', description: 'Instructions begin on the right.'},
    ],
  },
  {
    name: 'local-library',
    type: 'radio',
    values: [
      {value: 'false', description: 'Use online library file.'},
      {value: 'true', description: 'Use local library file.'},
    ],
  },
  {
    name: 'library',
    type: 'string',
    description: 'Use a specific music library file.',
  },
  {
    name: 'show-upload',
    type: 'radio',
    values: [
      {value: 'false', description: "Don't show upload option."},
      {value: 'true', description: 'Show upload option.'},
    ],
  },
  {
    name: 'show-instructions',
    type: 'radio',
    values: [
      {value: 'false', description: "Don't show instructions."},
      {value: 'true', description: 'Show instructions.'},
    ],
  },
  {
    name: 'show-video',
    type: 'radio',
    values: [
      {value: 'false', description: "Don't show video."},
      {value: 'true', description: 'Show video.'},
    ],
  },
  {
    name: 'storage-type',
    type: 'radio',
    values: [
      {value: LOCAL_STORAGE, description: 'Save to local storage.'},
      {value: REMOTE_STORAGE, description: 'Save to remote storage (default).'},
    ],
  },
  {
    name: 'BPM',
    type: 'string',
    description: 'Set a specific BPM',
  },
  {
    name: 'key',
    type: 'string',
    description: 'Set a specific key by name (i.e. "C", "C#", "D", etc)',
  },
  {
    name: 'skip-controls-enabled',
    type: 'radio',
    values: [
      {value: 'false', description: 'Disable skip controls.'},
      {value: 'true', description: 'Enable skip controls.'},
    ],
  },
  {
    name: 'keyboard-shortcuts-enabled',
    type: 'radio',
    values: [
      {value: 'false', description: 'Disable keyboard shortcuts.'},
      {value: 'true', description: 'Enable keyboard shortcuts.'},
    ],
  },
];

export default class MusicMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: {},
      values: {},
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
            <div key={value.value} style={{paddingBottom: 3}}>
              <label>
                <input
                  type="radio"
                  style={{marginTop: -3, marginRight: 5}}
                  name={option.name}
                  value={value.value}
                  onChange={this.handleRadioChange}
                />
                {value.value}: {value.description}
              </label>
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
      <div
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          margin: '20px 0',
          userSelect: 'all',
        }}
      >
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
    return (
      <div style={{userSelect: 'none'}}>
        {optionsList.map(option => {
          return (
            <div key={option.name}>
              <label>
                <input
                  type="checkbox"
                  name={option.name}
                  checked={this.state.checked[option.name]}
                  style={{marginTop: -3, marginRight: 5}}
                  onChange={e => this.handleCheckChange(e)}
                />
                {option.name}
              </label>
              <div style={{padding: '5px 10px 15px 18px'}}>
                {option.type === 'radio' && this.renderRadio(option)}
                {option.type === 'string' && this.renderString(option)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="main" style={{maxWidth: 970, margin: '0 auto 80px auto'}}>
        <h1>Music Lab options</h1>
        {this.renderResults()}
        {this.renderOptions()}
      </div>
    );
  }
}
