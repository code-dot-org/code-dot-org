import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import _ from 'lodash';
import {standardShape} from './lessonPlanShapes';

export const ExpandMode = {
  NONE: 'none',
  FIRST: 'first',
  ALL: 'all'
};

const expandModeShape = PropTypes.oneOf(
  // The component should not be expanded.
  ExpandMode.NONE,

  // The component should be expanded. Its first child and the first child of
  // each of its descendants should also be expanded.
  ExpandMode.FIRST,

  // This component and all its descendants should be expanded.
  ExpandMode.ALL
);

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
    case ExpandMode.FIRST:
      return index === 0 ? ExpandMode.FIRST : ExpandMode.NONE;
    case ExpandMode.NONE:
      return ExpandMode.NONE;
  }
}

/**
 * @param expandMode {ExpandMode} The expand mode of the component
 * @returns {boolean} Whether the component's details element should be expanded
 */
function getDetailsOpen(expandMode) {
  return expandMode === ExpandMode.ALL || expandMode === ExpandMode.FIRST;
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
    const isOpen = getDetailsOpen(this.props.expandMode);
    return (
      <details key={name} open={isOpen}>
        <summary>{name}</summary>
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
      </details>
    );
  }
}
Framework.propTypes = {
  name: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};

class ParentCategory extends PureComponent {
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
          <summary>
            {shortcode}
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
ParentCategory.propTypes = {
  shortcode: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};

class Category extends PureComponent {
  render() {
    const {shortcode, standards} = this.props;
    const description = standards[0].categoryDescription;
    const isOpen = getDetailsOpen(this.props.expandMode);
    return (
      <li key={shortcode}>
        <details open={isOpen}>
          <summary>{`${shortcode} - ${description}`}</summary>
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
Category.propTypes = {
  shortcode: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  expandMode: expandModeShape
};

class Standard extends PureComponent {
  render() {
    const {standard} = this.props;
    return (
      <li key={standard.shortcode}>
        {standard.shortcode}
        {' - '}
        {standard.description}
      </li>
    );
  }
}
Standard.propTypes = {standard: standardShape.isRequired};
