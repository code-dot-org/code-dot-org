import PropTypes from 'prop-types';
import React, {Component} from 'react';

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

  render() {
    return (
      <div>
        {this.props.standards.map(standard => (
          <li key={standard.shortcode}>{standard.description}</li>
        ))}
      </div>
    );
  }
}
