import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import _ from 'lodash';
import {standardShape} from './lessonPlanShapes';
import color from '@cdo/apps/util/color';
import Radium from 'radium';

export const styles = {
  frameworkName: {
    fontFamily: "'Gotham 5r', sans-serif",
    fontWeight: 'bold',
    color: color.dark_charcoal
  },
  categoryShortcode: {
    fontFamily: "'Gotham 7r', sans-serif",
    fontWeight: 'bold',
    color: color.link_color,
    ':hover': {
      textDecoration: 'underline'
    }
  },
  standardShortcode: {
    fontFamily: "'Gotham 5r', sans-serif",
    fontWeight: 'bold',
    color: color.dark_charcoal
  },
  summary: {
    padding: 3
  },
  standard: {
    padding: 3
  }
};

export const ExpandMode = {
  NONE: 'none',
  ALL: 'all'
};

const expandModeShape = PropTypes.oneOf([
  // The component should not be expanded.
  ExpandMode.NONE,

  // This component and all its descendants should be expanded.
  ExpandMode.ALL
]);

/**
 * Given the parents expand mode and the index of the child, returns what the
 * expand mode of the child should be.
 * @param parentExpandMode {ExpandMode} Expand mode of parent component
 * @param index {number} index of the child with respect to parent
 * @returns {ExpandMode} Expand mode of child component
 */
function getChildExpandMode(parentExpandMode, index) {
  switch (parentExpandMode) {
    case ExpandMode.ALL:
      return ExpandMode.ALL;
    case ExpandMode.NONE:
      return ExpandMode.NONE;
  }
}

/**
 * @param expandMode {ExpandMode} The expand mode of the component
 * @returns {boolean} Whether the component's details element should be expanded
 */
function getDetailsOpen(expandMode) {
  return expandMode === ExpandMode.ALL;
}

export default class LessonStandards extends PureComponent {
  render() {
    const {standards} = this.props;
    const standardsByFramework = _(standards)
      .orderBy('frameworkName')
      .groupBy('frameworkName')
      .value();
    return (
      <div>
        {Object.keys(standardsByFramework).map((frameworkName, index) => {
          const standards = standardsByFramework[frameworkName];
          const expandMode = getChildExpandMode(this.props.expandMode, index);
          return (
            <Framework
              name={frameworkName}
              key={frameworkName}
              standards={standards}
              expandMode={expandMode}
            />
          );
        })}
      </div>
    );
  }
}
LessonStandards.propTypes = {
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};

class Framework extends PureComponent {
  render() {
    const {name, standards} = this.props;
    // Whether all standards in this framework have parent categories.
    const hasParentCategories = !!standards[0].parentCategoryShortcode;
    const CategoryClass = hasParentCategories ? ParentCategory : Category;
    const categoryKey = hasParentCategories
      ? 'parentCategoryShortcode'
      : 'categoryShortcode';
    const standardsByCategory = _(standards)
      .orderBy(categoryKey, 'shortcode')
      .groupBy(categoryKey)
      .value();
    return (
      <div>
        <span style={styles.frameworkName}>{name}</span>
        <ul style={{listStyleType: 'none'}}>
          {Object.keys(standardsByCategory).map((categoryShortcode, index) => {
            const standards = standardsByCategory[categoryShortcode];
            const expandMode = getChildExpandMode(this.props.expandMode, index);
            return (
              <CategoryClass
                key={categoryShortcode}
                shortcode={categoryShortcode}
                standards={standards}
                expandMode={expandMode}
              />
            );
          })}
        </ul>
      </div>
    );
  }
}
Framework.propTypes = {
  name: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};

class UnconnectedParentCategory extends PureComponent {
  render() {
    const {shortcode, standards} = this.props;
    const description = standards[0].parentCategoryDescription;
    const standardsByCategory = _(standards)
      .orderBy('categoryShortcode', 'shortcode')
      .groupBy('categoryShortcode')
      .value();
    const isOpen = getDetailsOpen(this.props.expandMode);
    return (
      <li key={shortcode}>
        <details open={isOpen}>
          <summary style={styles.summary}>
            <span style={styles.categoryShortcode}>{shortcode}</span>
            {' - '}
            {description}
          </summary>
          <ul style={{listStyleType: 'none'}}>
            {Object.keys(standardsByCategory).map(
              (categoryShortcode, index) => {
                const standards = standardsByCategory[categoryShortcode];
                const expandMode = getChildExpandMode(
                  this.props.expandMode,
                  index
                );
                return (
                  <Category
                    key={categoryShortcode}
                    shortcode={categoryShortcode}
                    standards={standards}
                    expandMode={expandMode}
                  />
                );
              }
            )}
          </ul>
        </details>
      </li>
    );
  }
}
UnconnectedParentCategory.propTypes = {
  shortcode: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};
const ParentCategory = Radium(UnconnectedParentCategory);

class UnconnectedCategory extends PureComponent {
  render() {
    const {shortcode, standards} = this.props;
    const description = standards[0].categoryDescription;
    const isOpen = getDetailsOpen(this.props.expandMode);
    return (
      <li key={shortcode}>
        <details open={isOpen}>
          <summary style={styles.summary}>
            <span style={styles.categoryShortcode}>{shortcode}</span>
            {' - '}
            {description}
          </summary>
          <ul>
            {standards.map(standard => (
              <Standard key={standard.shortcode} standard={standard} />
            ))}
          </ul>
        </details>
      </li>
    );
  }
}
UnconnectedCategory.propTypes = {
  shortcode: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};
const Category = Radium(UnconnectedCategory);

class Standard extends PureComponent {
  render() {
    const {standard} = this.props;
    return (
      <li key={standard.shortcode} style={styles.standard}>
        <span style={styles.standardShortcode}>{standard.shortcode}</span>
        {' - '}
        {standard.description}
      </li>
    );
  }
}
Standard.propTypes = {standard: standardShape.isRequired};
