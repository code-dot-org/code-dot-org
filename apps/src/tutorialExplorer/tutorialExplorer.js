/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * tutorialExplorer.  Includes the TutorialExplorer React class.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import FilterHeader from './filterHeader';
import FilterSet from './filterSet';
import TutorialSet from './tutorialSet';
import ToggleAllTutorialsButton from './toggleAllTutorialsButton';
import { TutorialsSortBy, mobileCheck } from './util';
import { getResponsiveContainerWidth, isResponsiveCategoryInactive, getResponsiveValue } from '../responsive';
import i18n from './locale';
import _ from 'lodash';
import queryString from 'query-string';
import { StickyContainer } from 'react-sticky';

const styles = {
  bottomLinksContainer: {
    padding: '10px 7px 40px 7px',
    fontSize: 13,
    lineHeight: "17px",
    clear: "both"
  },
  bottomLinksLink: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  bottomLinksLinkFirst: {
    paddingBottom: 10
  }
};

const TutorialExplorer = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.array.isRequired,
    filterGroups: React.PropTypes.array.isRequired,
    initialFilters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    hideFilters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)),
    locale: React.PropTypes.string.isRequired,
    backButton: React.PropTypes.bool,
    roboticsButtonUrl: React.PropTypes.string,
    showSortDropdown: React.PropTypes.bool.isRequired,
    disabledTutorials: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    defaultSortBy: React.PropTypes.oneOf(Object.keys(TutorialsSortBy)).isRequired
  },

  shouldScrollToTop: false,

  getInitialState() {
    let filters = {};
    for (const filterGroupName in this.props.filterGroups) {
      const filterGroup = this.props.filterGroups[filterGroupName];
      filters[filterGroup.name] = [];
      const initialFiltersForGroup = this.props.initialFilters[filterGroup.name];
      if (initialFiltersForGroup) {
        filters[filterGroup.name] = initialFiltersForGroup;
      }
    }

    const sortBy = TutorialsSortBy.default;
    const filteredTutorials = this.filterTutorialSet(filters, sortBy);
    const filteredTutorialsForLocale = this.filterTutorialSetForLocale();
    const showingAllTutorials = this.isLocaleEnglish();

    return {
      filters: filters,
      filteredTutorials: filteredTutorials,
      filteredTutorialsCount: filteredTutorials.length,
      filteredTutorialsForLocale: filteredTutorialsForLocale,
      windowWidth: $(window).width(),
      windowHeight: $(window).height(),
      mobileLayout: isResponsiveCategoryInactive('md'),
      showingModalFilters: false,
      sortBy: sortBy,
      showingAllTutorials: showingAllTutorials
    };
  },

  /**
   * Called when a filter in a filter group has its checkbox
   * checked or unchecked.
   *
   * @param {string} filterGroup - The name of the filter group.
   * @param {string} filterEntry - The name of the filter entry.
   * @param {bool} value - Whether the entry was checked or not.
   */
  handleUserInputFilter(filterGroup, filterEntry, value) {
    const state = Immutable.fromJS(this.state);

    let newState = {};
    if (value) {
      // Add value to end of array.
      newState = state.updateIn(['filters', filterGroup], arr => arr.push(filterEntry));
    } else {
      // Find and remove specific value from array.
      const itemIndex = this.state.filters[filterGroup].indexOf(filterEntry);
      newState = state.updateIn(['filters', filterGroup], arr => arr.splice(itemIndex, 1));
    }

    newState = newState.toJS();

    const filteredTutorials = this.filterTutorialSet(newState.filters, this.state.sortBy);
    this.setState({
      ...newState,
      filteredTutorials,
      filteredTutorialsCount: filteredTutorials.length
    });
  },

  /**
   * Called when the sort order is changed via dropdown.
   *
   * @param {SortBy} value - The new sort order.
   */
  handleUserInputSortBy(value) {
    const filteredTutorials = this.filterTutorialSet(this.state.filters, value);
    this.setState({
      filteredTutorials,
      filteredTutorialsCount: filteredTutorials.length,
      sortBy: value
    });

    this.scrollToTop();
  },

  /*
   * Now that we've re-rendered changes, check to see if there's a pending
   * scroll to the top of all tutorials.
   * jQuery is used to do the scrolling, which is a little unusual, but
   * ensures a smooth, well-eased movement.
   */
  componentDidUpdate() {
    if (this.shouldScrollToTop) {
      $('html, body').animate({scrollTop: $(this.allTutorials).offset().top});
      this.shouldScrollToTop = false;
    }
  },

  /**
   * Set up a smooth scroll to the top of all tutorials once we've re-rendered the
   * relevant changes.
   * Note that if that next render never comes, we won't actually do the scroll.
   *
   * Also note that this is currently disabled unless URL parameter "scrolltotop" is
   * provided, due to flicker and mispositioning of the sticky header after scrolling
   * on iOS devices.
   */
  scrollToTop() {
    if (window.location.search.indexOf("scrolltotop") !== -1) {
      this.shouldScrollToTop = true;
    }
  },

  /*
   * The main tutorial set is returned with the given filters and sort order.
   *
   * Whether en or non-en user, this filters as though the user is of "en-US" locale.
   */
  filterTutorialSet(filters, sortBy) {
    const filterProps = {
      filters: filters,
      hideFilters: this.props.hideFilters,
      locale: "en-US"
    };

    // If the user hasn't chosen a sorting option yet (and the dropdown is still in its
    // default state) then use whatever we know to be the default sort criteria.
    // But if the user has chosen a sorting option, then use that.
    filterProps.sortBy = sortBy === TutorialsSortBy.default ? this.props.defaultSortBy : sortBy;

    return TutorialExplorer.filterTutorials(this.props.tutorials, filterProps);
  },

  /*
   * The extra set of tutorials for a specific locale, shown at top for non-en user
   * with no filter options.
   * If not robotics page, show all tutorials including robotics.  If robotics page,
   * then use that filter.
   */
  filterTutorialSetForLocale() {
    const filterProps = {
      sortBy: this.props.defaultSortBy
    };

    if (!this.props.roboticsButtonUrl) {
      filterProps.filters = {
        activity_type: ["robotics"]
      };
    }

    filterProps.specificLocale = true;
    filterProps.locale = this.props.locale;
    return TutorialExplorer.filterTutorials(this.props.tutorials, filterProps);
  },

  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.onResize, 100));
  },

  showModalFilters() {
    this.setState({showingModalFilters: true});

    if (this.state.mobileLayout) {
      this.scrollToTop();
    }
  },

  hideModalFilters() {
    this.setState({showingModalFilters: false});

    if (this.state.mobileLayout) {
      this.scrollToTop();
    }
  },

  showAllTutorials() {
    this.setState({showingAllTutorials: true});
  },

  hideAllTutorials() {
    this.setState({showingAllTutorials: false});
  },

  shouldShowFilters() {
    return !this.state.mobileLayout || this.state.showingModalFilters;
  },

  shouldShowTutorials() {
    return !this.state.mobileLayout || !this.state.showingModalFilters;
  },

  shouldShowTutorialsForLocale() {
    return !this.isLocaleEnglish();
  },

  shouldShowAllTutorialsToggleButton() {
    return !this.isLocaleEnglish();
  },

  isLocaleEnglish() {
    return this.props.locale.substring(0,2) === "en";
  },

  /**
   * Called when the window resizes. Look to see if width/height changed, then
   * call adjustTopPaneHeight as our maxHeight may need adjusting.
   */
  onResize() {
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    // We fire window resize events when the grippy is dragged so that non-React
    // controlled components are able to rerender the editor. If width/height
    // didn't change, we don't need to do anything else here
    if (windowWidth === this.state.windowWidth &&
        windowHeight === this.state.windowHeight) {
      return;
    }

    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });

    this.setState({mobileLayout: isResponsiveCategoryInactive('md')});
  },

  statics: {
    /**
     * Filters a given array of tutorials by the given filter props.
     *
     * It goes through all active filter categories.  If no filters are set for
     * a filter group, then that item will default to showing, so long as no other
     * filter group prevents it from showing.
     * hideFilters is an explicit list of filters that we actually hide if matched.
     * But if we do have a filter set for a filter group, and the tutorial is tagged
     * for that filter group, then at least one of the active filters must match a tag.
     * e.g. If the user chooses two platforms, then at least one of the platforms
     * must match a platform tag on the tutorial.
     * A similar check for language is done first.
     * In the case that filterProps.specificLocale is true, we do something slightly
     * different.  We don't show tutorials that don't have any language tags, and we
     * reject tutorials that don't have the current locale explicitly listed.  This
     * allows us to return a set of tutorials that have explicit support for the
     * current locale.
     *
     * @param {Array} tutorials - Array of tutorials.  Each contains a variety of
     *   strings, each of which is a list of tags separated by commas, no spaces.
     * @param {object} filterProps - Object containing filter properties.
     * @param {string} filterProps.locale - The current locale.
     * @param {bool} filterProps.specificLocale - Whether we filter to only allow
     *   through tutorials matching the current locale.
     * @param {object} filterProps.filters - Contains arrays of strings identifying
     *   the currently active filters.  Each array is named for its filter group.
     */
    filterTutorials(tutorials, filterProps) {
      const { locale, specificLocale, filters, hideFilters, sortBy } = filterProps;

      const filteredTutorials = tutorials.filter(tutorial => {
        // Check that the tutorial isn't marked as do-not-show.  If it does,
        // it's hidden.
        if (tutorial.tags.split(',').indexOf("do-not-show") !== -1) {
          return false;
        }

        // First check that the tutorial language doesn't exclude it immediately.
        // If the tags contain some languages, and we don't have a match, then
        // hide the tutorial.
        if (locale && tutorial.languages_supported) {
          const languageTags = tutorial.languages_supported.split(',');
          if (languageTags.length > 0 &&
            languageTags.indexOf(locale) === -1 &&
            languageTags.indexOf(locale.substring(0,2)) === -1) {
            return false;
          }
        } else if (specificLocale) {
          // If the tutorial doesn't have language tags, but we're only looking
          // for specific matches to our current locale, then don't show this
          // tutorial.  i.e. don't let non-locale-specific tutorials through.
          return false;
        }

        // If we are explicitly hiding a matching filter, then don't show the
        // the tutorial.
        for (const filterGroupName in hideFilters) {
          const tutorialTags = tutorial["tags_" + filterGroupName];
          const filterGroup = hideFilters[filterGroupName];

          if (filterGroup.length !== 0 &&
              tutorialTags &&
              tutorialTags.length > 0 &&
              TutorialExplorer.findMatchingTag(filterGroup, tutorialTags)) {
            return false;
          }
        }

        // If we miss any active filter group, then we don't show the tutorial.
        let filterGroupsSatisfied = true;

        for (const filterGroupName in filters) {
          const tutorialTags = tutorial["tags_" + filterGroupName];
          const filterGroup = filters[filterGroupName];

          if (filterGroup.length !== 0 &&
              tutorialTags &&
              tutorialTags.length > 0 &&
              !TutorialExplorer.findMatchingTag(filterGroup, tutorialTags)) {
            filterGroupsSatisfied = false;
          }
        }

        return filterGroupsSatisfied;
      }).sort((tutorial1, tutorial2) => {
        if (sortBy === TutorialsSortBy.popularityrank) {
          return tutorial1.popularityrank - tutorial2.popularityrank;
        } else {
          return tutorial2.displayweight - tutorial1.displayweight;
        }
      });

      return filteredTutorials;
    },

    /* Given a filter group, and the tutorial's relevant tags for that filter group,
     * see if there's at least a single match.
     * @param {Array} filterGroup - Array of strings, each of which is a selected filter
     *   for the group.  e.g. ["beginner", "experienced"].
     * @param {string} tutorialTags - Comma-separated tags for a tutorial.
     *   e.g. "beginner,experienced".
     * @return {bool} - true if the tutorial had at least one tag matching at least
     *   one of the filterGroup's values.
     */
    findMatchingTag(filterGroup, tutorialTags) {
      return filterGroup.some(filterName => tutorialTags.split(',').indexOf(filterName) !== -1);
    }

  },

  render() {
    const bottomLinksContainerStyle = {
      ...styles.bottomLinksContainer,
      textAlign: getResponsiveValue({xs: "left", md: "right"}),
      visibility: this.shouldShowTutorials() ? "visible" : "hidden"
    };

    return (
      <StickyContainer>
        <div style={{width: getResponsiveContainerWidth(), margin: "0 auto", paddingBottom: 0}}>

          {this.shouldShowTutorialsForLocale() && (
            <div>
              <h1>{i18n.headingTutorialsYourLanguage()}</h1>
              {this.state.filteredTutorialsForLocale.length === 0 &&
                i18n.noTutorialsYourLanguage()
              }

              {this.state.filteredTutorialsForLocale.length > 0 && (
                <TutorialSet
                  tutorials={this.state.filteredTutorialsForLocale}
                  filters={this.state.filters}
                  locale={this.props.locale}
                  specificLocale={true}
                  localeEnglish={this.isLocaleEnglish()}
                  disabledTutorials={this.props.disabledTutorials}
                />
              )}
            </div>
          )}

          {this.shouldShowAllTutorialsToggleButton() && (
            <ToggleAllTutorialsButton
              showAllTutorials={this.showAllTutorials}
              hideAllTutorials={this.hideAllTutorials}
              showingAllTutorials={this.state.showingAllTutorials}
            />
          )}

          {this.state.showingAllTutorials && (
            <div ref={allTutorials => this.allTutorials = allTutorials}>
              <FilterHeader
                onUserInput={this.handleUserInputSortBy}
                sortBy={this.state.sortBy}
                backButton={this.props.backButton}
                filteredTutorialsCount={this.state.filteredTutorialsCount}
                mobileLayout={this.state.mobileLayout}
                showingModalFilters={this.state.showingModalFilters}
                showModalFilters={this.showModalFilters}
                hideModalFilters={this.hideModalFilters}
                showSortDropdown={this.props.showSortDropdown}
                defaultSortBy={this.props.defaultSortBy}
              />
              <div style={{clear: "both"}}/>

              {this.shouldShowFilters() && (
                <div style={{float: "left", width: getResponsiveValue({xs: 100, md: 20})}}>
                  <FilterSet
                    filterGroups={this.props.filterGroups}
                    onUserInput={this.handleUserInputFilter}
                    selection={this.state.filters}
                    roboticsButtonUrl={this.props.roboticsButtonUrl}
                  />
                </div>
              )}

              <div style={{float: 'left', width: getResponsiveValue({xs: 100, md: 80})}}>
                {this.shouldShowTutorials() && (
                  <TutorialSet
                    tutorials={this.state.filteredTutorials}
                    filters={this.state.filters}
                    locale={this.props.locale}
                    localeEnglish={this.isLocaleEnglish()}
                    disabledTutorials={this.props.disabledTutorials}
                  />
                )}
              </div>

              <div style={bottomLinksContainerStyle}>
                <div style={styles.bottomLinksLinkFirst}>
                  <a style={styles.bottomLinksLink} href="https://hourofcode.com/activity-guidelines">
                    {i18n.bottomGuidelinesLink()}
                  </a>
                </div>
                <div>
                  <a style={styles.bottomLinksLink} href="https://hourofcode.com/supporting-special-needs-students">
                    {i18n.bottomSpecialNeedsLink()}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </StickyContainer>
    );
  }
});

function getFilters({robotics, mobile}) {
  const filters = [
    { name: "grade",
      text: i18n.filterGrades(), //"Grades",
      entries: [
        {name: "pre",             text: i18n.filterGradesPre()},
        {name: "2-5",             text: i18n.filterGrades25()},
        {name: "6-8",             text: i18n.filterGrades68()},
        {name: "9+",              text: i18n.filterGrades9()}]},
    { name: "teacher_experience",
      text: i18n.filterTeacherExperience(),
      entries: [
        {name: "beginner",        text: i18n.filterTeacherExperienceBeginner()},
        {name: "comfortable",     text: i18n.filterTeacherExperienceComfortable()}]},
    { name: "student_experience",
      text: i18n.filterStudentExperience(),
      entries: [
        {name: "beginner",        text: i18n.filterStudentExperienceBeginner()},
        {name: "comfortable",     text: i18n.filterStudentExperienceComfortable()}]},
    { name: "platform",
      text: i18n.filterPlatform(),
      entries: [
        {name: "computers",       text: i18n.filterPlatformComputers()},
        {name: "android",         text: i18n.filterPlatformAndroid()},
        {name: "ios",             text: i18n.filterPlatformIos()},
        {name: "no-internet",     text: i18n.filterPlatformNoInternet()},
        {name: "no-computers",    text: i18n.filterPlatformNoComputers()}]},
    { name: "subject",
      text: i18n.filterTopics(),
      entries: [
        {name: "science",         text: i18n.filterTopicsScience()},
        {name: "math",            text: i18n.filterTopicsMath()},
        {name: "history",         text: i18n.filterTopicsHistory()},
        {name: "la",              text: i18n.filterTopicsLa()},
        {name: "art",             text: i18n.filterTopicsArt()},
        {name: "cs-only",         text: i18n.filterTopicsCsOnly()}]},
    { name: "activity_type",
      text: i18n.filterActivityType(),
      entries: [
        {name: "online-tutorial", text: i18n.filterActivityTypeOnlineTutorial()},
        {name: "lesson-plan",     text: i18n.filterActivityTypeLessonPlan()}]},
    { name: "length",
      text: i18n.filterLength(),
      entries: [
        {name: "1hour",           text: i18n.filterLength1Hour()},
        {name: "1hour-follow",    text: i18n.filterLength1HourFollow()},
        {name: "few-hours",       text: i18n.filterLengthFewHours()}]},
    { name: "programming_language",
      text: i18n.filterProgrammingLanguage(),
      entries: [
        {name: "blocks",          text: i18n.filterProgrammingLanguageBlocks()},
        {name: "typing",          text: i18n.filterProgrammingLanguageTyping()},
        {name: "other",           text: i18n.filterProgrammingLanguageOther()}]}];

  const initialFilters = {
    teacher_experience: ["beginner"],
    student_experience: ["beginner"]
  };

  const hideFilters = {
    activity_type: ["robotics"]
  };

  if (robotics) {
    filters.forEach(filterGroup => {
      if (filterGroup.name === "activity_type") {
        filterGroup.entries = [{name: "robotics", text: i18n.filterActivityTypeRobotics()}];
        filterGroup.display = false;
      }
    });

    initialFilters.activity_type = ["robotics"];
    initialFilters.teacher_experience = [];
    initialFilters.student_experience = [];

    hideFilters.activity_type = [];
  }

  if (mobile) {
    initialFilters.platform = ["android", "ios"];
  }

  return {filters, initialFilters, hideFilters};
}

/*
 * Parse URL parameters to retrieve an override of initialFilters.
 *
 * @param {Array} filters - Array of filterGroup objects.
 * @param {bool} robotics - whether on the robotics page.
 *
 * @return {object} - Returns an object containing arrays of strings.  Each
 *   array is named for a filterGroup name, and each string inside is named
 *   for a filter entry.  Note that this is not currently white-listed against
 *   our known name of filterGroups/entries, but invalid entries should be
 *   ignored in the filtering user experience.
 */
function getUrlParameters(filters, robotics) {
  // Create a result object that has a __proto__ so that React validation will work
  // properly.
  let parametersObject = {};

  let parameters = queryString.parse(location.search);
  for (const name in parameters) {
    const filterGroup = filters.find(item => item.name === name);

    // Validate filterGroup name.
    if (filterGroup) {
      let entryNames = [];
      if (typeof parameters[name] === "string") {
        // Convert item with single filter entry into array containing the string.
        entryNames = [parameters[name]];
      } else {
        entryNames = parameters[name];
      }

      for (const entry in entryNames) {
        const entryName = entryNames[entry];

        // Validate entry name.
        if (filterGroup.entries.find(item => item.name === entryName)) {
          if (!parametersObject[name]) {
            parametersObject[name] = [];
          }
          parametersObject[name].push(entryName);
        }
      }
    }
  }

  if (robotics) {
    // The robotics page remains dedicated to robotics activities.
    parametersObject.activity_type = ["robotics"];
  }

  return parametersObject;
}

window.TutorialExplorerManager = function (options) {
  options.mobile = mobileCheck();
  let {filters, initialFilters, hideFilters} = getFilters(options);

  // Check for URL-based override of initialFilters.
  const providedParameters = getUrlParameters(filters, !options.roboticsButtonUrl);
  if (!_.isEmpty(providedParameters)) {
    initialFilters = providedParameters;
  }

  // The caller can provide defaultSortByPopularity, and when true, the default sort will
  // be by popularity.  Otherwise, the default sort will be by display weight.
  const defaultSortBy = options.defaultSortByPopularity ? TutorialsSortBy.popularityrank : TutorialsSortBy.displayweight;

  this.renderToElement = function (element) {
    ReactDOM.render(
      <TutorialExplorer
        tutorials={options.tutorials}
        filterGroups={filters}
        initialFilters={initialFilters}
        hideFilters={hideFilters}
        locale={options.locale}
        backButton={options.backButton}
        roboticsButtonUrl={options.roboticsButtonUrl}
        showSortDropdown={true}
        disabledTutorials={options.disabledTutorials}
        defaultSortBy={defaultSortBy}
      />,
      element
    );
  };
};

export default TutorialExplorer;
