import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import _ from 'lodash';
import {standardShape} from './lessonPlanShapes';

export default class LessonStandards extends PureComponent {
  render() {
    const {standards} = this.props;
    const standardsByFramework = _(standards)
      .orderBy('frameworkName')
      .groupBy('frameworkName')
      .value();
    return (
      <div>
        {Object.keys(standardsByFramework).map(frameworkName => {
          const standards = standardsByFramework[frameworkName];
          return (
            <Framework
              name={frameworkName}
              key={frameworkName}
              standards={standards}
            />
          );
        })}
      </div>
    );
  }
}
LessonStandards.propTypes = {
  standards: PropTypes.arrayOf(standardShape).isRequired
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
      <details key={name}>
        <summary>{name}</summary>
        <ul style={{listStyleType: 'none'}}>
          {Object.keys(standardsByCategory).map(categoryShortcode => {
            const standards = standardsByCategory[categoryShortcode];
            return (
              <CategoryClass
                key={categoryShortcode}
                shortcode={categoryShortcode}
                standards={standards}
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
  standards: PropTypes.arrayOf(standardShape).isRequired
};

class ParentCategory extends PureComponent {
  render() {
    const {shortcode, standards} = this.props;
    const description = standards[0].parentCategoryDescription;
    const standardsByCategory = _(standards)
      .orderBy('categoryShortcode', 'shortcode')
      .groupBy('categoryShortcode')
      .value();
    return (
      <li key={shortcode}>
        <details>
          <summary>
            {shortcode}
            {' - '}
            {description}
          </summary>
          <ul style={{listStyleType: 'none'}}>
            {Object.keys(standardsByCategory).map(categoryShortcode => {
              const standards = standardsByCategory[categoryShortcode];
              return (
                <Category
                  key={categoryShortcode}
                  shortcode={categoryShortcode}
                  standards={standards}
                />
              );
            })}
          </ul>
        </details>
      </li>
    );
  }
}
ParentCategory.propTypes = {
  shortcode: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired
};

class Category extends PureComponent {
  render() {
    const {shortcode, standards} = this.props;
    const description = standards[0].categoryDescription;
    return (
      <li key={shortcode}>
        <details>
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
  standards: PropTypes.arrayOf(standardShape).isRequired
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
