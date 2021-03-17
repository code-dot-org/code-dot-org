import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import _ from 'lodash';

const standardShape = PropTypes.shape({
  framework_name: PropTypes.string.isRequired,
  category_shortcode: PropTypes.string.isRequired,
  category_description: PropTypes.string.isRequired,
  shortcode: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
});

export default class LessonStandards extends PureComponent {
  render() {
    const {standards} = this.props;
    const standardsByFramework = _(standards)
      .orderBy('framework_name')
      .groupBy('framework_name')
      .value();
    return (
      <ul>
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
      </ul>
    );
  }
}
LessonStandards.propTypes = {
  standards: PropTypes.arrayOf(standardShape).isRequired
};

class Framework extends PureComponent {
  render() {
    const {name, standards} = this.props;
    const standardsByCategory = _(standards)
      .orderBy('category_shortcode', 'shortcode')
      .groupBy('category_shortcode')
      .value();
    return (
      <li key={name}>
        {name}
        <ul>
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
      </li>
    );
  }
}
Framework.propTypes = {
  name: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired
};

class Category extends PureComponent {
  render() {
    const {shortcode, standards} = this.props;
    const description = standards[0].category_description;
    return (
      <li key={shortcode}>
        {`${shortcode} - ${description}`}
        <ul>
          {standards.map(standard => (
            <Standard key={standard.shortcode} standard={standard} />
          ))}
        </ul>
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
