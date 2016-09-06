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

  options.tutorials.contents = options.tutorials.contents.splice(0,5);

  const FilterChoice = React.createClass({
    handleChange: function() {
      this.props.onUserInput(
        this.props.groupName, this.props.name,
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
              style={{marginRight: '5px'}}
            />
            {this.props.text}
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
            {this.props.text}
          </div>
          {this.props.filterEntries.map(item => <FilterChoice groupName={this.props.name} name={item.name} text={item.text} selected={this.props.selection && this.props.selection.includes(item.name)} onUserInput={this.props.onUserInput} key={item.name}/>)}
        </div>
      )
    }
  });

  const FilterSet = React.createClass({
    render() {
      return (
        <div>
          <div className='col-25'>
            {this.props.filterGroups.map(item => <FilterGroup name={item.name} text={item.text} filterEntries={item.entries} onUserInput={this.props.onUserInput} selection={this.props.selection[item.name]} key={item.name}/>)}
          </div>
        </div>
      )
    }
  });

  const Tutorial = React.createClass({
    propTypes: {
      item: React.PropTypes.object.isRequired
    },

  render() {
      return (
        <div style={{width: '25%', float: 'left', padding: '2px'}}>
          <div style={{backgroundColor: 'grey', color: 'white', padding: '5px'}}>
            <img src={this.props.item.image} style={{width: '100%'}}/>
            {this.props.item.code}
          </div>
        </div>
      )
    }
  });

  const TutorialSet = React.createClass({
    propTypes: {
      tutorials: React.PropTypes.arrayOf(
        React.PropTypes.object
      ).isRequired
    },

    render() {
      // Should we show this item based on current filter settings?

      // Go through all active filter categories.
        // No filters set for a category, then show everything that might match.
        // Tutorial has no tags, then it'll show.
        // But if we actually have filters for a category, and the tutorial does too,
        // then at least one filter must have a tag.
        //   e.g. if the user chooses two platforms, then at least one of the
        //   platforms must match the tutorial.

      function filterFn(tutorial, index, array) {
        //console.log("filterFn", tutorial, index, this.props.filters);

        var filterMiss = false;

        for (var filterGroupName in this.props.filters) {

          var tutorialTags = tutorial["tags_" + filterGroupName];

          if (tutorialTags && tutorialTags.length > 0) {
            console.log("  filterGroupName - ", filterGroupName, " - for tutorial - ", tutorial["tags_" + filterGroupName]);

            var tutorialTagsSplit = tutorialTags.split(',');
            console.log("  tutorialTagsSplit", tutorialTagsSplit);

            // now check all the filter group's tags

            var filterGroup = this.props.filters[filterGroupName];
            console.log("      filterGroup", filterGroup);

            // For this filter group, we've not yet found a matching tag between
            // user selected otions and tutorial tags.
            var filterGroupHit = false;

            for (var filterName of filterGroup) {
              console.log("        filterName", filterName);

              if (tutorialTagsSplit.includes(filterName)) {
                console.log("          tutorial tag match");

                // The tutorial had a matching tag.
                filterGroupHit = true;
              } else {
                console.log("          tutorial tag MISS");
                //filterMiss = true;
              }
            }

            // Each filter group needs at least one user-selected filter to hit
            // on the tutorial.
            if (filterGroup.length !== 0 && !filterGroupHit) {
              filterMiss = true;
            }
          }
        }

        return !filterMiss;
      }

      return (
        <div style={{width: '75%', float: 'left'}}>
          {this.props.tutorials.filter(filterFn, this).map(item => <Tutorial item={item} filters={this.props.filters} key={item.code}/>)}
        </div>
      )
    }
  });

  const TutorialExplorer = React.createClass({
    getInitialState: function() {
      var filters = {};

      for (let filterGroup of this.props.filterGroups) {
        filters[filterGroup.name] = [];

      }
      return {
        filters: filters
      };
    },

    handleUserInput: function(filterGroup, filterEntry, value) {
      var filterEntryChange = {};

      if (value) {
        // Add value to end of array.
        filterEntryChange["$push"] = [filterEntry];

      } else {
        var itemIndex = this.state.filters[filterGroup].indexOf(filterEntry);

        console.log("Removing value ", filterEntry, "at index", itemIndex, "from", this.state.filters[filterGroup]);

        // Find and remove specific value from array.
        filterEntryChange["$splice"] = [[itemIndex, 1]];
      }


      var filterGroupChange = {};
      filterGroupChange[filterGroup] = filterEntryChange;

      var stateChange = {};
      stateChange["filters"] = filterGroupChange;

      var newState = update(this.state, stateChange);

      console.log("new state", newState);

      this.setState(newState);
    },

    render() {
      return (
        <div>
          <FilterSet filterGroups={this.props.filterGroups} onUserInput={this.handleUserInput} selection={this.state.filters}/>
          <TutorialSet tutorials={this.props.tutorials} filters={this.state.filters}/>
        </div>
      )
    }
  });

  window.ReactDOM.render(
    <TutorialExplorer filterGroups={options.filters} tutorials={options.tutorials.contents}/>,
    document.getElementById('tutorials')
  );

};
