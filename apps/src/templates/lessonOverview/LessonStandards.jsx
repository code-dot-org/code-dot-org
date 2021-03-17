import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';

export default class LessonStandards extends Component {
  static propTypes = {
    standards: PropTypes.arrayOf(
      PropTypes.shape({
        framework_name: PropTypes.string.isRequired,
        category_shortcode: PropTypes.string.isRequired,
        category_description: PropTypes.string.isRequired,
        shortcode: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
      })
    )
  };

  constructor(props) {
    super(props);

    this.state = {
      // Standards ordered and grouped by framework and category. Since we do
      // not expect standards to change, use initial state to avoid recomputing
      // these on every render.
      groupedStandards: this.groupStandardsByFramework(props.standards)
    };
  }

  groupStandardsByFramework = standards =>
    _(standards)
      .values()
      .orderBy('framework_name')
      .groupBy('framework_name')
      .mapValues(this.groupStandardsByCategory)
      .value();

  groupStandardsByCategory = standards =>
    _(standards)
      .values()
      .orderBy('category_shortcode', 'shortcode')
      .groupBy('category_shortcode')
      .value();

  render() {
    return (
      <ul>
        {_.transform(
          this.state.groupedStandards,
          (elements, standardsByCategory, frameworkName) => {
            elements.push(
              <li key={frameworkName}>
                {frameworkName}
                <ul>
                  {_.transform(
                    standardsByCategory,
                    (elements, standards, categoryShortcode) => {
                      elements.push(
                        <li key={categoryShortcode}>
                          {categoryShortcode}
                          {' - '}
                          {standards[0].category_description}
                          <ul>
                            {standards.map(standard => (
                              <li key={standard.shortcode}>
                                {standard.shortcode}
                                {' - '}
                                {standard.description}
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    },
                    []
                  )}
                </ul>
              </li>
            );
          },
          []
        )}
      </ul>
    );
  }
}
