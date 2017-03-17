import React from 'react';
import color from "@cdo/apps/util/color";

const styles = {
  category: {
    backgroundColor: color.cyan,
    border: 'solid 0px',
    borderRadius: 5,
    width: 175,
    padding: 10,
    margin: 10,
    color: color.white,
    float: 'left',
    cursor: 'pointer'
  },
  categoryArea: {
    width: '100%'
  }
};

/**
 * A component for displaying a sound category.
 */
const SoundCategory = React.createClass({
  propTypes: {
    displayName: React.PropTypes.string,
    category: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired
  },

  selectCategory() {
    this.props.onSelect(this.props.category);
  },

  render() {
    return (
      <div style={styles.category} onClick={this.selectCategory}>
        {this.props.displayName}
      </div>
    );
  }
});
module.exports = SoundCategory;
