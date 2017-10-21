/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import React, {PropTypes} from 'react';
import BackButton from './backButton';
import FilterGroupHeaderStudentExperience from './filterGroupHeaderStudentExperience';
import FilterGroupHeaderGrade from './filterGroupHeaderGrade';
import { getResponsiveValue } from './responsive';
import { Sticky } from 'react-sticky';
import i18n from '@cdo/tutorialExplorer/locale';

const styles = {
  header: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: 'white'
  },
  barDesktop: {
    color: "dimgrey",
    height: 46,
    overflow: "hidden",
    backgroundColor: "rgb(0, 178, 192)"
  },
  barMobile: {
    color: "white",
    height: 46,
    overflow: "hidden",
    backgroundColor: "rgb(0, 178, 192)",
  },
  button: {
    backgroundColor: "rgb(101, 205, 214)",
    color: "white",
    borderColor: "white",
    height: 34
  },
  filterBy: {
    float: "left",
  },
  left: {
    float: "left",
    marginLeft: 6
  },
  right: {
    float: "right",
    marginTop: 6,
    marginRight: 6
  },
  mobileCount: {
    lineHeight: '46px',
    paddingLeft: 6
  }
};


export default class FilterHeader extends React.Component {
  static propTypes = {
    mobileLayout: PropTypes.bool.isRequired,
    filterGroups: PropTypes.array.isRequired,
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    onUserInputFilter: PropTypes.func.isRequired,
    backButton: PropTypes.bool,
    filteredTutorialsCount: PropTypes.number.isRequired,
    showingModalFilters: PropTypes.bool.isRequired,
    showModalFilters: PropTypes.func.isRequired,
    hideModalFilters: PropTypes.func.isRequired
  };

  shouldShowOpenFiltersButton() {
    return this.props.mobileLayout && !this.props.showingModalFilters;
  }

  shouldShowCloseFiltersButton() {
    return this.props.mobileLayout && this.props.showingModalFilters;
  }

  render() {
    const tutorialCount = this.props.filteredTutorialsCount;
    const tutorialCountString = tutorialCount === 1 ?
      i18n.filterHeaderTutorialCountSingle() :
      i18n.filterHeaderTutorialCountPlural({tutorial_count: tutorialCount});

    // There are two filters which can appear in this header at desktop width.
    // Check explicitly for each of them.
    let filterGroupGrade = null;
    let filterGroupStudentExperience = null;
    if (!this.props.mobileLayout) {
      filterGroupGrade = this.props.filterGroups.find(item => item.name === "grade");
      filterGroupStudentExperience = this.props.filterGroups.find(item => item.name === "student_experience");
    }

    return (
      <div style={styles.header}>
        {this.props.backButton && <BackButton/>}

        <Sticky style={{zIndex: 1}}>
          <div style={getResponsiveValue({xs: styles.barMobile, md: styles.barDesktop})}>
            <div style={styles.left}>
              {this.props.mobileLayout && (
                <span style={styles.mobileCount}>
                  {tutorialCountString}
                </span>
              )}

              {!this.props.mobileLayout && (
                <div style={styles.filterBy}>
                  {filterGroupGrade && (
                    <FilterGroupHeaderGrade
                      filterGroup={filterGroupGrade}
                      selection={this.props.selection["grade"]}
                      onUserInput={this.props.onUserInputFilter}
                    />
                  )}
                </div>
              )}
            </div>

            <div style={styles.right}>
              {!this.props.mobileLayout && (
                <div>
                  {filterGroupStudentExperience && (
                    <FilterGroupHeaderStudentExperience
                      filterGroup={filterGroupStudentExperience}
                      selection={this.props.selection["student_experience"]}
                      onUserInput={this.props.onUserInputFilter}
                    />
                  )}
                </div>
              )}

              {this.shouldShowOpenFiltersButton() && (
                <span>
                  <button
                    onClick={this.props.showModalFilters}
                    style={styles.button}
                    className="noFocusButton"
                  >
                    {i18n.filterHeaderShowFilters()}
                  </button>
                </span>
              )}

              {this.shouldShowCloseFiltersButton() && (
                <span>
                  <button
                    onClick={this.props.hideModalFilters}
                    style={styles.button}
                    className="noFocusButton"
                  >
                    {i18n.filterHeaderHideFilters()}
                  </button>
                </span>
              )}
            </div>
          </div>
        </Sticky>
      </div>
    );
  }
}
