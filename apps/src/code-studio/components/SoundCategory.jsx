import React from 'react';

/**
 * A component for displaying a sound category.
 */
var SoundCategory = React.createClass({
  propTypes: {
    displayName: React.PropTypes.string,
    category: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired
  },

  selectCategory: function () {
    this.props.onSelect(this.props.category);
  },

  render: function () {
    var styles = {
      category: {
        backgroundColor: '#0094ca',
        border: 'solid 0px',
        borderRadius: '5px',
        width: '175px',
        padding: '10px',
        margin: '10px',
        color: 'white',
        float: 'left',
        cursor: 'pointer'
      },
      categoryArea: {
        width: '100%'
      }
    };

    return (
      <div style={styles.category} onClick={this.selectCategory}>
        {this.props.displayName}
      </div>
    );
  }
});
module.exports = SoundCategory;
