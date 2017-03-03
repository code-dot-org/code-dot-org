import React from 'react';
import SoundList from './SoundList';

/**
 * A component for managing sounds, searching sounds, and categories of sounds.
 */
var SoundLibrary = React.createClass({
  propTypes: {
    alignment: React.PropTypes.string,
    assetChosen: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {search: '', selectedSound: {}};
  },

  search: function (e) {
    this.setState({
      search: e.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '')
    });
  },

  selectSound: function (sound) {
    this.setState({
      selectedSound: sound
    });
  },

  onClickChoose: function () {
    this.props.assetChosen(this.state.selectedSound.sourceUrl);
  },

  render: function () {
    var styles = {
      root: {
        float: this.props.alignment || 'right',
        position: 'relative',
        margin: '10px 0'
      },
      input: {
        width: '300px',
        border: '1px solid #999',
        borderRadius: '4px',
        padding: '3px 7px'
      },
      sound: {
        position: 'absolute',
        right: '5px',
        top: '5px',
        fontSize: '16px',
        color: '#999'
      },
      button: {
        float: 'right',
        margin: '20px 0px'
      }
    };

    return (
      <div>
        <div style={styles.root}>
          <input
            onChange={this.search}
            style={styles.input}
            placeholder={'Search for a sound...'}
          />
          <i className="fa fa-search" style={styles.sound}/>
        </div>
        <SoundList
          assetChosen={this.selectSound}
          search={this.state.search}
          selectedSound={this.state.selectedSound}
        />
        <button className={"primary"} onClick={this.onClickChoose} style={styles.button}>{'Choose'}</button>
      </div>
    );
  }
});
module.exports = SoundLibrary;
