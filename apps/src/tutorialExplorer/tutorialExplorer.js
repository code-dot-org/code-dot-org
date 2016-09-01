/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * tutorialExplorer.
 */
require('babel-polyfill');
window.React = require('react');
window.ReactDOM = require('react-dom');
window.Radium = require('radium');
var update = require('react-addons-update');

window.TutorialExplorerManager = function (options) {
  this.options = options;
  var self = this;

  const FilterChoice = React.createClass({
    handleChange: function() {
      this.props.onUserInput(
        "grade", this.props.name,
        this.refs.isCheckedInput.checked
      );
    },

    render() {
      return (
        <div>
          <label>
            <input
              type="checkbox"
              value={this.props.value}
              checked={this.props.selected}
              ref="isCheckedInput"
              onChange={this.handleChange}
            />
            {this.props.name}
          </label>
        </div>
      )
    }
  });

  const FilterGroup = React.createClass({
    render() {
      return (
        <div style={{paddingBottom: '20px'}}>
          <div>
            {this.props.name}
          </div>
          {this.props.filterEntries.map(item => <FilterChoice name={item.name} selected={this.props.selection && this.props.selection.includes(item.name)} onUserInput={this.props.onUserInput} key={item.name}/>)}
        </div>
      )
    }
  });

  const FilterSet = React.createClass({
    render() {
      return (
        <div>
          <div style={{position: 'fixed'}}>
            {this.props.filterGroups.map(item => <FilterGroup name={item.name} filterEntries={item.entries} onUserInput={this.props.onUserInput} selection={this.props.selection[item.name]} key={item.name}/>)}
          </div>
          <div className='col-25'>
            &nbsp;
          </div>
        </div>
      )
    }
  });

  const Tutorial = React.createClass({
    propTypes: {
      itemCode: React.PropTypes.string.isRequired
    },

    render() {
      if (this.props.filters.grade.includes("k-5") || this.props.itemCode.match("^k")) {
        return (
          <div style={{width: '25%', float: 'left', padding: '2px'}}>
            <div style={{backgroundColor: 'grey', color: 'white', padding: '5px'}}>
              <img src={this.props.imageUrl} style={{width: '100%'}}/>
              {this.props.itemCode}
            </div>
          </div>
        )
      } else {
        return null;
      }
    }
  });

  const TutorialSet = React.createClass({
    propTypes: {
      tutorials: React.PropTypes.arrayOf(
        React.PropTypes.object
      ).isRequired
    },

    render() {
      return (
        <div style={{width: '75%', float: 'left'}}>
          {this.props.tutorials.map(item => <Tutorial itemCode={item.code} imageUrl={item.image} filters={this.props.filters} key={item.code}/>)}
        </div>
      )
    }
  });

  const TutorialExplorer = React.createClass({
    getInitialState: function() {
      return {
        filters: { grade: ["k-5"] }
      };
    },

    handleUserInput: function(filterGroup, filterEntry, value) {
      var filterEntryChange = {};

      if (value) {
        // Add value to end of array.
        filterEntryChange["$push"] = [filterEntry];
      } else {
        // Find and remove specific value from array.
        filterEntryChange["$splice"] = [[0, 1]];
      }

      var filterGroupChange = {};
      filterGroupChange[filterGroup] = filterEntryChange;

      var stateChange = {};
      stateChange["filters"] = filterGroupChange;

      var newState = update(this.state, stateChange);

      //var newState = React.addons.update(this.state, {
      //  filterGroup: {
      //    name: { (value ? $push : $unshift): filterEntry }
      //  }
      //});
      this.setState(newState);
    },

    render() {
      return (
        <div>
          <FilterSet filterGroups={options.filters} onUserInput={this.handleUserInput} selection={this.state.filters}/>
          <TutorialSet tutorials={options.tutorials.contents} filters={this.state.filters}/>
        </div>
      )
    }
  });

  window.ReactDOM.render(
    <TutorialExplorer/>,
    document.getElementById('tutorials')
  );

};
