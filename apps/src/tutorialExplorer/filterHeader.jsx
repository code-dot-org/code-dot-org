/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import PropTypes from 'prop-types';
import React from 'react';
import BackButton from './backButton';
import FilterGroupHeaderSelection from './filterGroupHeaderSelection';
import {getResponsiveValue} from './responsive';
import {Sticky} from 'react-sticky';
import i18n from '@cdo/tutorialExplorer/locale';

export default class FilterHeader extends React.Component {
  static propTypes = {
    mobileLayout: PropTypes.bool.isRequired,
    filterGroups: PropTypes.array.isRequired,
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
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
    const tutorialCountString =
      tutorialCount === 1
        ? i18n.filterHeaderTutorialCountSingle()
        : i18n.filterHeaderTutorialCountPlural({tutorial_count: tutorialCount});

    // There are two filters which can appear in this header at desktop width.
    // Check explicitly for each.
    let filterGroupGrade = null;
    let filterGroupHeaderStudentExperience = null;
    if (!this.props.mobileLayout) {
      filterGroupGrade = this.props.filterGroups.find(
        item => item.name === 'grade'
      );
      filterGroupHeaderStudentExperience = this.props.filterGroups.find(
        item => item.name === 'student_experience'
      );
    }

    return (
      <div style={styles.header}>
        {this.props.backButton && <BackButton />}

        <Sticky>
          {({style}) => (
            <div
              style={{
                ...style,
                zIndex: 1,
                ...getResponsiveValue({
                  xs: styles.barMobile,
                  md: styles.barDesktop
                })
              }}
            >
              {!this.props.mobileLayout && (
                <div style={styles.full}>
                  {filterGroupGrade && (
                    <FilterGroupHeaderSelection
                      containerStyle={styles.filterGroupGradeContainer}
                      filterGroup={filterGroupGrade}
                      selection={this.props.selection['grade']}
                      onUserInput={this.props.onUserInputFilter}
                    />
                  )}
                  {filterGroupHeaderStudentExperience && (
                    <FilterGroupHeaderSelection
                      containerStyle={
                        styles.filterGroupStudentExperienceContainer
                      }
                      filterGroup={filterGroupHeaderStudentExperience}
                      selection={this.props.selection['student_experience']}
                      onUserInput={this.props.onUserInputFilter}
                    />
                  )}
                </div>
              )}

              {this.props.mobileLayout && (
                <div>
                  <div style={styles.left}>
                    <span style={styles.mobileCount}>
                      {tutorialCountString}
                    </span>
                  </div>

                  <div style={styles.right}>
                    {this.shouldShowOpenFiltersButton() && (
                      <span>
                        <button
                          type="button"
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
                          type="button"
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
              )}
            </div>
          )}
        </Sticky>
      </div>
    );
  }
}

const styles = {
  header: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: 'white'
  },
  barDesktop: {
    color: 'dimgrey',
    height: 46,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  barMobile: {
    color: 'white',
    height: 46,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  button: {
    backgroundColor: '#2799a4',
    color: 'white',
    borderColor: 'white',
    height: 34
  },
  full: {
    float: 'left',
    width: '100%'
  },
  left: {
    float: 'left',
    marginLeft: 6
  },
  right: {
    float: 'right',
    marginTop: 6,
    marginRight: 6
  },
  mobileCount: {
    lineHeight: '46px',
    paddingLeft: 6,
    color: 'dimgrey'
  },
  filterGroupGradeContainer: {
    width: '68%',
    float: 'left'
  },
  filterGroupStudentExperienceContainer: {
    width: '28%',
    float: 'right'
  }
};
