/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * tutorialExplorer.
 */
require('babel-polyfill');
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import update from 'react-addons-update';

const styles = {
  filterChoiceOuter: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    MsUserSelect: 'none'
  },
  filterChoiceLabel: {
    fontFamily: "\"Gotham 4r\", sans-serif",
    fontSize: 13,
    paddingBottom: 0,
    marginBottom: 0,
    cursor: 'pointer'
  },
  filterGroupOuter: {
    paddingTop: 20,
    paddingRight: 40
  },
  filterGroupText: {
    fontFamily: '"Gotham 5r", sans-serif',
    borderBottom: 'solid grey 1px'
  },
  tutorialDetailModalHeader: {
    borderBottomWidth: 0,
    paddingTop: 0,
    paddingBottom: 4,
    height: 48
  },
  tutorialDetailModalBody: {
    paddingTop: 0,
    overflow: 'hidden',
    textAlign: 'left'
  },
  popupFullWidth: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%'
  },
  tutorialDetailName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 22
  },
  tutorialDetailSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    paddingBottom: 20
  },
  tutorialDetailDescription: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 14
  },
  tutorialDetailsTable: {
    marginTop: 20,
    width: '100%'
  },
  tutorialDetailsTableTitle: {
    padding: 5,
    width: '40%',
    fontFamily: '"Gotham 5r", sans-serif',
    border: '1px solid lightgrey'
  },
  tutorialDetailsTableBody: {
    padding: 5,
    border: '1px solid lightgrey'
  },
  tutorialName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  tutorialSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    paddingBottom: 20
  },


};

const shapes = {
  tutorial: React.PropTypes.shape({
    tags_length: React.PropTypes.string,
    tags_subject: React.PropTypes.string,
    tags_teacher_experience: React.PropTypes.string,
    tags_student_experience: React.PropTypes.string,
    tags_activity_type: React.PropTypes.string,
    tags_international_languages: React.PropTypes.string,
    tags_grade: React.PropTypes.string,
    tags_programming_language: React.PropTypes.string
  })
};


window.TutorialExplorerManager = function (options) {
  this.options = options;

  const FilterChoice = React.createClass({
    propTypes: {
      onUserInput: React.PropTypes.func.isRequired,
      groupName: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      selected: React.PropTypes.bool.isRequired,
      text: React.PropTypes.string.isRequired
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
        <div style={styles.filterChoiceOuter}>
          <label style={styles.filterChoiceLabel}>
            <input
              type="checkbox"
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
      name: React.PropTypes.string.isRequired,
      text: React.PropTypes.string.isRequired,
      filterEntries: React.PropTypes.array.isRequired,
      selection: React.PropTypes.array.isRequired,
      onUserInput: React.PropTypes.func.isRequired
    },

    render() {
      return (
        <div style={styles.filterGroupOuter}>
          <div style={styles.filterGroupText}>
            {this.props.text}
          </div>
          {this.props.filterEntries.map(item => (
            <FilterChoice
              groupName={this.props.name}
              name={item.name}
              text={item.text}
              selected={this.props.selection && this.props.selection.includes(item.name)}
              onUserInput={this.props.onUserInput}
              key={item.name}
            />
          ))}
        </div>
      );
    }
  });

  const FilterSet = React.createClass({
    propTypes: {
      filterGroups: React.PropTypes.array.isRequired,
      onUserInput: React.PropTypes.func.isRequired,
      selection: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
    },

    render() {
      return (
        <div>
          <div className="col-20">
            <div style={{fontSize: 16}}>
              Filter By
            </div>
            {this.props.filterGroups.map(item => (
              <FilterGroup
                name={item.name}
                text={item.text}
                filterEntries={item.entries}
                onUserInput={this.props.onUserInput}
                selection={this.props.selection[item.name]}
                key={item.name}
              />
            ))}
          </div>
        </div>
      );
    }
  });

  /**
   * For a comma-separated string of tags, generate a comma-separated string of their friendly
   * names.
   * e.g. Given a prefix of "subject_" and a string of tags of "history,science",
   * generate the readable string "History, Science".  These friendly strings are
   * stored in the string table as "subject_history" and "subject_science".
   *
   * @param {string} prefix - The prefix applied to the tag in the string table.
   * @param {string} tagString - Comma-separated tags, no spaces.
   */
  function getTagString(prefix, tagString) {
    if (!tagString) {
      return "";
    }

    const tagToString = {
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

  const TutorialDetail = React.createClass({
    propTypes: {
      showing: React.PropTypes.bool.isRequired,
      item: shapes.tutorial.isRequired,
      closeClicked: React.PropTypes.func.isRequired,
    },

    render: function () {
      if (!this.props.showing) {
        // Disable body scrolling.
        $('body').css('overflow', 'auto');
        return null;
      }

      // Enable body scrolling.
      $('body').css('overflow', 'hidden');

      const tableEntries = [
        {key: 0, title: "Length",                  body: getTagString("length", this.props.item.tags_length)},
        {key: 1, title: "Subjects",                body: getTagString("subject", this.props.item.tags_subject)},
        {key: 2, title: "Educator Experience",     body: getTagString("teacher_experience", this.props.item.tags_teacher_experience)},
        {key: 3, title: "Student Experience",      body: getTagString("student_experience", this.props.item.tags_student_experience)},
        {key: 4, title: "Type of Activity",        body: getTagString("activity_type", this.props.item.tags_activity_type)},
        {key: 5, title: "International Languages", body: getTagString("international_languages", this.props.item.tags_international_languages)},
      ];

      return (
        <div
          id="tutorialPopupFullWidth"
          style={styles.popupFullWidth}
        >
          <div
            className="modal"
            id="tutorialPopup"
            style={{display: 'block'}}
            onClick={this.props.closeClicked}
          >
            <div
              className="modal-dialog modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={styles.tutorialDetailModalHeader}
                >
                  <button
                    className="close"
                    data-dismiss="modal"
                    style={{height: 48}}
                    type="button"
                    onClick={this.props.closeClicked}
                  >
                    <span
                      aria-hidden="true"
                      style={{fontSize: 48}}
                    >
                      ×
                    </span>
                    <span className="sr-only">Close</span>
                  </button>
                  <div style={{clear: 'both'}} />
                </div>
                <div
                  className="modal-body"
                  style={styles.tutorialDetailModalBody}
                >
                  <div className="col-50">
                    <img
                      src={this.props.item.image}
                      style={{width: '100%'}}
                    />
                  </div>
                  <div
                    className="col-50"
                    style={{paddingLeft: 20}}
                  >
                    <div style={styles.tutorialDetailName}>
                      {this.props.item.name}
                    </div>
                    <div style={styles.tutorialDetailSub}>
                      {getTagString("grade", this.props.item.tags_grade)} | {getTagString("programming_language", this.props.item.tags_programming_language)}
                    </div>
                    <div style={styles.tutorialDetailDescription}>
                      {this.props.item.longdescription}
                    </div>
                  </div>
                  <div style={{clear: 'both'}}/>
                  <table style={styles.tutorialDetailsTable}>
                    <tbody>
                      {tableEntries.map(item =>
                        <tr key={item.key}>
                          <td style={styles.tutorialDetailsTableTitle}>
                            {item.title}
                          </td>
                          <td style={styles.tutorialDetailsTableBody}>
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
      item: shapes.tutorial.isRequired
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
          <TutorialDetail
            showing={this.state.showingDetail}
            item={this.props.item}
            closeClicked={this.tutorialDetailClosed}
          />
          <div
            className="col-33"
            style={{float: 'left', padding: 2}}
          >
            <div style={{padding: 5}}>
              <div
                style={{cursor: 'pointer'}}
                onClick={this.tutorialClicked}
              >
                <img
                  src={this.props.item.image}
                  style={{width: '100%', height: 180}}
                />
                <div style={styles.tutorialName}>
                  {this.props.item.name}
                </div>
                <div style={styles.tutorialSub}>
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
      tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
      filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
      locale: React.PropTypes.string.isRequired
    },

    /**
     * Returns true if we should show this item based on current filter settings.
     * It goes through all active filter categories.  If no filters are set for
     * a filter group, then that item will default to showing, so long as no other
     * filter group prevents it from showing.
     * But if we do have a filter set for a filter group, and the tutorial is tagged
     * for that filter group, then at least one of the active filters must match a tag.
     * e.g. If the user chooses two platforms, then at least one of the platforms
     * must match a platform tag on the tutorial.
     * A similar check for language is done first.
     *
     * @param {object} tutorial - Single tutorial, containing a variety of
     *   strings, each of which is a list of tags separated by commas, no spaces.
     */
    filterFn: function (tutorial) {

      // First check that the tutorial language doesn't exclude it immediately.
      // If the tags contain some languages, and we don't have a match, then
      // hide the tutorial.
      if (tutorial.languages_supported) {
        const languageTags = tutorial.languages_supported.split(',');
        const currentLocale = this.props.locale;
        if (languageTags.length > 0 &&
          !languageTags.includes(currentLocale) &&
          !languageTags.includes(currentLocale.substring(0,2))) {
          return false;
        }
      }

      // If we miss any filter group, then we don't show the tutorial.
      let filterGroupMiss = false;

      for (const filterGroupName in this.props.filters) {
        const tutorialTags = tutorial["tags_" + filterGroupName];
        if (tutorialTags && tutorialTags.length > 0) {
          const tutorialTagsSplit = tutorialTags.split(',');

          // Now check all the filter group's tags.
          const filterGroup = this.props.filters[filterGroupName];

          // For this filter group, we've not yet found a matching tag between
          // user selected otions and tutorial tags.
          let filterHit = false;

          for (const filterName of filterGroup) {
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
    },

    render() {
      return (
        <div
          className="col-80"
          style={{float: 'left'}}
        >
          {this.props.tutorials.filter(this.filterFn, this).map(item => (
            <Tutorial
              item={item}
              filters={this.props.filters}
              key={item.code}
            />
          ))}
        </div>
      );
    }
  });

  const TutorialExplorer = React.createClass({
    propTypes: {
      filterGroups: React.PropTypes.array.isRequired,
      tutorials: React.PropTypes.array.isRequired,
      locale: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
      let filters = {};

      for (const filterGroup of this.props.filterGroups) {
        filters[filterGroup.name] = [];
      }
      return {
        filters: filters
      };
    },

    /**
     * Called when a filter in a filter group has its checkbox
     * checked or unchecked.  Updates the filters in state.
     *
     * @param {string} filterGroup - The name of the filter group.
     * @param {string} filterEntry - The name of the filter entry.
     * @param {bool} value - Whether the entry was checked or not.
     */
    handleUserInput: function (filterGroup, filterEntry, value) {
      let filterEntryChange = {};

      if (value) {
        // Add value to end of array.
        filterEntryChange["$push"] = [filterEntry];

      } else {
        const itemIndex = this.state.filters[filterGroup].indexOf(filterEntry);

        // Find and remove specific value from array.
        filterEntryChange["$splice"] = [[itemIndex, 1]];
      }

      const stateChange = {
        filters: {
          [filterGroup]: filterEntryChange
        }
      };

      const newState = update(this.state, stateChange);

      this.setState(newState);
    },

    render() {
      return (
        <div>
          <FilterSet
            filterGroups={this.props.filterGroups}
            onUserInput={this.handleUserInput}
            selection={this.state.filters}
          />
          <TutorialSet
            tutorials={this.props.tutorials}
            filters={this.state.filters}
            locale={this.props.locale}
          />
        </div>
      );
    }
  });

  ReactDOM.render(
    <TutorialExplorer
      filterGroups={options.filters}
      tutorials={options.tutorials.contents}
      locale={options.locale}
    />,
    document.getElementById('tutorials')
  );
};
