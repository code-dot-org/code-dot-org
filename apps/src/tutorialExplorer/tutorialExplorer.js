import React from 'react';

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
    propTypes: {
      onUserInput: React.PropTypes.func,
      groupName: React.PropTypes.string,
      name: React.PropTypes.string,
      isCheckedInput: React.PropTypes.bool,
      value: React.PropTypes.string,
      selected: React.PropTypes.bool,
      text: React.PropTypes.string
    },

    handleChange: function () {
      this.props.onUserInput(
        this.props.groupName,
        this.props.name,
        this.refs.isCheckedInput.checked
      );
    },

    render() {
      return (
        <div  style={{userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', MsUserSelect: 'none'}}>
          <label style={{fontFamily: "\"Gotham 4r\", sans-serif", fontSize: 13, paddingBottom: 0, marginBottom: 0, cursor: 'pointer'}}>
            <input
              type="checkbox"
              value={this.props.value}
              checked={this.props.selected}
              ref="isCheckedInput"
              onChange={this.handleChange}
              style={{marginRight: 5}}
            />
            {this.props.text}
          </label>
        </div>
      );
    }
  });

  const FilterGroup = React.createClass({
    propTypes: {
      name: React.PropTypes.string,
      text: React.PropTypes.string,
      filterEntries: React.PropTypes.array,
      selection: React.PropTypes.array,
      onUserInput: React.PropTypes.func
    },

    render() {
      return (
        <div style={{paddingTop: 20, paddingRight: 40}}>
          <div style={{fontFamily: '"Gotham 5r", sans-serif', borderBottom: 'solid grey 1px'}}>
            {this.props.text}
          </div>
          {this.props.filterEntries.map(item => <FilterChoice groupName={this.props.name} name={item.name} text={item.text} selected={this.props.selection && this.props.selection.includes(item.name)} onUserInput={this.props.onUserInput} key={item.name}/>)}
        </div>
      );
    }
  });

  const FilterSet = React.createClass({
    propTypes: {
      filterGroups: React.PropTypes.array,
      onUserInput: React.PropTypes.func,
      selection: React.PropTypes.object
    },

    render() {
      return (
        <div>
          <div className="col-20">
            <div style={{fontSize: 16}}>
              Filter By
            </div>
            {this.props.filterGroups.map(item => <FilterGroup name={item.name} text={item.text} filterEntries={item.entries} onUserInput={this.props.onUserInput} selection={this.props.selection[item.name]} key={item.name}/>)}
          </div>
        </div>
      );
    }
  });

  // For a string of tags, generate a string of their friendly names.
  function getTagString(prefix, tagString) {
    if (!tagString) {
      return "";
    }

    var tagToString = {
      length_1_hour: "One hour",
      subject_english: "English",
      subject_history: "History",
      teacher_experience_expert: "Expert",
      teacher_experience_beginner: "Beginner",
      student_experience_expert: "Expert",
      student_experience_beginner: "Beginner",
      activity_type_programming: "Programming tutorial",
      grade_pre: "Pre",
      "grade_2-5": "2-5",
      "grade_6-8": "6-8",
      programming_language_javascript: "JavaScript",
      programming_language_c: "C",
    };

    return tagString.split(',').map(tag => tagToString[`${prefix}_${tag}`]).join(', ');
  }

  var TutorialDetail = React.createClass({
    propTypes: {
      showing: React.PropTypes.bool,
      item: React.PropTypes.object,
      closeClicked: React.PropTypes.func,
    },

    render: function () {
      if (!this.props.showing) {
        // Disable body scrolling.
        $('body').css('overflow', 'auto');
        return null;
      }

      // Enable body scrolling.
      $('body').css('overflow', 'hidden');

      var tableEntries = [
        {key: 0, title: "Length",                  body: getTagString("length", this.props.item.tags_length)},
        {key: 1, title: "Subjects",                body: getTagString("subject", this.props.item.tags_subject)},
        {key: 2, title: "Educator Experience",     body: getTagString("teacher_experience", this.props.item.tags_teacher_experience)},
        {key: 3, title: "Student Experience",      body: getTagString("student_experience", this.props.item.tags_student_experience)},
        {key: 4, title: "Type of Activity",        body: getTagString("activity_type", this.props.item.tags_activity_type)},
        {key: 5, title: "International Languages", body: getTagString("international_languages", this.props.item.tags_international_languages)},
      ];

      return (
        <div id="tutorialPopupFullWidth" style={{position: 'absolute', left: 0, top: 0, width: '100%'}}>
          <div className="modal" id="tutorialPopup" style={{display: 'block'}} onClick={this.props.closeClicked}>
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header" style={{borderBottomWidth: 0, paddingTop: 0, paddingBottom: 4, height: 48}}>
                  <button className="close" data-dismiss="modal" style={{height: 48}} type="button" onClick={this.props.closeClicked}>
                    <span aria-hidden="true" style={{fontSize: 48}}>×</span>
                    <span className="sr-only">Close</span>
                  </button>
                  <div style={{clear: 'both'}} />
                </div>
                <div className="modal-body" style={{paddingTop: 0, overflow: 'hidden', textAlign: 'left'}}>
                  <div className="col-50">
                    <img src={this.props.item.image} style={{width: '100%'}}/>
                  </div>
                  <div className="col-50" style={{paddingLeft: 20}}>
                    <div style={{fontFamily: '"Gotham 5r", sans-serif', fontSize: 22}}>
                      {this.props.item.name}
                    </div>
                    <div style={{fontFamily: '"Gotham 3r", sans-serif', fontSize: 12, paddingBottom: 20}}>
                      {getTagString("grade", this.props.item.tags_grade)} | {getTagString("programming_language", this.props.item.tags_programming_language)}
                    </div>
                    <div style={{fontFamily: '"Gotham 3r", sans-serif', fontSize: 14}}>
                      {this.props.item.longdescription}
                    </div>
                  </div>
                  <div style={{clear: 'both'}}/>
                  <table style={{marginTop: 20, width: '100%'}}>
                    <tbody>
                      {tableEntries.map(item =>
                        <tr key={item.key}>
                          <td style={{padding: 5, width: '40%', fontFamily: '"Gotham 5r", sans-serif', border: '1px solid lightgrey'}}>
                            {item.title}
                          </td>
                          <td style={{padding: 5, border: '1px solid lightgrey'}}>
                            {item.body}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  const Tutorial = React.createClass({
    propTypes: {
      item: React.PropTypes.object.isRequired
    },

    getInitialState: function () {
      return {
        showingDetail: false
      };
    },

    tutorialClicked: function () {
      this.setState({showingDetail: true});
    },

    tutorialDetailClosed: function () {
      this.setState({showingDetail: false});
    },

    render() {
      return (
        <div>
          <TutorialDetail showing={this.state.showingDetail} item={this.props.item} closeClicked={this.tutorialDetailClosed}/>
          <div className="col-33" style={{float: 'left', padding: 2}}>
            <div style={{padding: 5}}>
              <div style={{cursor: 'pointer'}} onClick={this.tutorialClicked}>
                <img src={this.props.item.image} style={{width: '100%', height: 180}}/>
                <div style={{fontFamily: '"Gotham 5r", sans-serif', fontSize: 15, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                  {this.props.item.name}
                </div>
                <div style={{fontFamily: '"Gotham 3r", sans-serif', fontSize: 12, paddingBottom: 20}}>
                  {getTagString("grade", this.props.item.tags_grade)} | {getTagString("programming_language", this.props.item.tags_programming_language)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  const TutorialSet = React.createClass({
    propTypes: {
      tutorials: React.PropTypes.arrayOf(
        React.PropTypes.object
      ).isRequired,
      filters: React.PropTypes.object,
      locale: React.PropTypes.string
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

        // First check that the tutorial language doesn't exclude it immediately.
        // If the tags contain some languages, and we don't have a match, then
        // hide the tutorial.
        if (tutorial.languages_supported) {
          var languageTags = tutorial.languages_supported.split(',');
          var currentLocale = this.props.locale;
          if (languageTags.length > 0 &&
            !languageTags.includes(currentLocale) &&
            !languageTags.includes(currentLocale.substring(0,2))) {
            return false;
          }
        }

        // If we miss any filter group, then we don't show the tutorial.
        var filterGroupMiss = false;

        for (var filterGroupName in this.props.filters) {
          var tutorialTags = tutorial["tags_" + filterGroupName];
          if (tutorialTags && tutorialTags.length > 0) {
            var tutorialTagsSplit = tutorialTags.split(',');

            // now check all the filter group's tags
            var filterGroup = this.props.filters[filterGroupName];

            // For this filter group, we've not yet found a matching tag between
            // user selected otions and tutorial tags.
            var filterHit = false;

            for (var filterName of filterGroup) {
              if (tutorialTagsSplit.includes(filterName)) {
                // The tutorial had a matching tag.
                filterHit = true;
              }
            }

            // The filter group needs at least one user-selected filter to hit
            // on the tutorial.
            if (filterGroup.length !== 0 && !filterHit) {
              filterGroupMiss = true;
            }
          }
        }

        return !filterGroupMiss;
      }

      return (
        <div className="col-80" style={{float: 'left'}}>
          {this.props.tutorials.filter(filterFn, this).map(item => <Tutorial item={item} filters={this.props.filters} key={item.code}/>)}
        </div>
      );
    }
  });

  const TutorialExplorer = React.createClass({
    propTypes: {
      filterGroups: React.PropTypes.array,
      tutorials: React.PropTypes.array,
      locale: React.PropTypes.string
    },

    getInitialState: function () {
      var filters = {};

      for (let filterGroup of this.props.filterGroups) {
        filters[filterGroup.name] = [];

      }
      return {
        filters: filters
      };
    },

    handleUserInput: function (filterGroup, filterEntry, value) {
      var filterEntryChange = {};

      if (value) {
        // Add value to end of array.
        filterEntryChange["$push"] = [filterEntry];

      } else {
        var itemIndex = this.state.filters[filterGroup].indexOf(filterEntry);

        // Find and remove specific value from array.
        filterEntryChange["$splice"] = [[itemIndex, 1]];
      }

      var filterGroupChange = {};
      filterGroupChange[filterGroup] = filterEntryChange;

      var stateChange = {};
      stateChange["filters"] = filterGroupChange;

      var newState = update(this.state, stateChange);

      this.setState(newState);
    },

    render() {
      return (
        <div>
          <FilterSet filterGroups={this.props.filterGroups} onUserInput={this.handleUserInput} selection={this.state.filters}/>
          <TutorialSet tutorials={this.props.tutorials} filters={this.state.filters} locale={this.props.locale}/>
        </div>
      );
    }
  });

  window.ReactDOM.render(
    <TutorialExplorer filterGroups={options.filters} tutorials={options.tutorials.contents} locale={options.locale}/>,
    document.getElementById('tutorials')
  );

};
