import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import poems from './poems.json';

export const INITIAL_STATE = {
  isOpen: false,
  selectedPoem: null
};

function PoemTile(props) {
  function selectPoem() {
    const {onSelect, name, author, lines} = props;
    onSelect(name, author, lines);
  }

  return (
    <div style={styles.poemTile} onClick={selectPoem}>
      <p style={styles.tileTitle}>{props.name}</p>
      <p>{props.author}</p>
      {props.lines.map((line, i) => (
        <div key={line + i}>{line}</div>
      ))}
    </div>
  );
}

PoemTile.propTypes = {
  name: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired
};

export default class PoemBank extends React.Component {
  state = {...INITIAL_STATE};

  handleOpen = () => this.setState({isOpen: true});

  handleClose = () => this.setState({isOpen: false});

  onSelect = (name, author, lines) =>
    this.setState({selectedPoem: {name, author, lines}, isOpen: false});

  renderPoem() {
    return (
      <div style={styles.selectedPoem}>
        <h3 style={styles.title}>{this.state.selectedPoem.name}</h3>
        <p>{this.state.selectedPoem.author}</p>
        {this.state.selectedPoem.lines.map((line, i) => (
          <div key={line + i}>{line}</div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <span style={styles.container}>
        {this.state.selectedPoem && this.renderPoem()}

        <button type="button" onClick={this.handleOpen}>
          {this.state.selectedPoem ? 'Change Poem' : 'Pick Poem'}
        </button>
        <BaseDialog
          isOpen={this.state.isOpen}
          handleClose={this.handleClose}
          fullWidth
          fullHeight
        >
          <div>
            <h1>Choose a Poem</h1>
            {poems.map(poem => (
              <PoemTile
                key={poem.name + poem.author}
                name={poem.name}
                author={poem.author}
                lines={poem.lines}
                onSelect={this.onSelect}
              />
            ))}
          </div>
        </BaseDialog>
      </span>
    );
  }
}

const styles = {
  container: {
    display: 'inline-block',
    width: '95%'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  poemTile: {
    border: '1px solid black',
    padding: 5,
    margin: 5,
    display: 'inline-block',
    width: '25%',
    cursor: 'pointer'
  },
  tileTitle: {
    fontFamily: 'Gotham 7r',
    fontSize: 16,
    marginBottom: 0
  },
  selectedPoem: {
    overflow: 'auto',
    border: '1px solid black',
    height: '125px',
    padding: '0px 5px'
  },
  title: {
    margin: 0,
    marginTop: 10,
    lineHeight: '20px'
  }
};
