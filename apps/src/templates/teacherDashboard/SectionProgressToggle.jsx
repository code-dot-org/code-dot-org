import React, { PropTypes } from 'react';
import ToggleGroup from '../ToggleGroup';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

/**
 * A toggle that provides a way to switch between detail and summary views of
 * the progress a section of students have made in a course. Teacher view.
 */
class SectionProgrsesToggle extends React.Component {
  static propTypes = {
    isSummaryView: PropTypes.bool.isRequired,
    toggleView: PropTypes.func.isRequired,
  };

  onChange = () => {
    this.props.toggleView(!this.props.isSummaryView);
  };

  render() {
    const { isSummaryView } = this.props;

    return (
      <ToggleGroup
        selected={isSummaryView ? "summary" : "detail"}
        activeColor={color.teal}
        onChange={this.onChange}
      >
        <button value="summary">
          <FontAwesome icon="search-minus"/>
        </button>
        <button value="detail">
          <FontAwesome icon="search-plus"/>
        </button>
      </ToggleGroup>
    );

  }
}

export default SectionProgrsesToggle;
