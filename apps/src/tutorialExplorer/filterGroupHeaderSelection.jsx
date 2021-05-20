/* filterGroupHeaderSelection: A horizontal selection of filters for a given
 * filter group, shown in the header on desktop widths.
 */

import PropTypes from 'prop-types';
import React from 'react';

export default class FilterGroupHeaderSelection extends React.Component {
  static propTypes = {
    containerStyle: PropTypes.object.isRequired,
    filterGroup: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired,
    onUserInput: PropTypes.func.isRequired
  };

  handleChange = value => {
    this.props.onUserInput(this.props.filterGroup.name, value, true);
  };

  itemStyle(index) {
    const value = this.props.selection[0];
    const selectedIndex = this.props.filterGroup.entries.findIndex(
      item => item.name === value
    );

    // When we have two unselected items next to each other, we want to draw a grey
    // vertical divider between them, and that's done by rendering a border-left
    // of the item on the right.

    if (index === selectedIndex) {
      // The selected item.
      return styles.select;
    } else if (index === 0) {
      // The first item.
      return {};
    } else if (index - 1 !== selectedIndex) {
      // An item that is not immediately to the right of the selected item.
      return styles.borderOnLeft;
    } else {
      // An item immediately to the right of the selected item.
      return {};
    }
  }

  render() {
    return (
      <div style={{...styles.container, ...this.props.containerStyle}}>
        <div style={styles.flexContainer}>
          {this.props.filterGroup.entries.map((item, index) => (
            <div
              key={item.name}
              onClick={this.handleChange.bind(this, item.name)}
              style={{...styles.item, ...this.itemStyle(index)}}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'inline-block',
    marginTop: 6,
    overflow: 'hidden',
    height: 34,
    lineHeight: '34px',
    border: 'solid 1px #a2a2a2',
    borderRadius: 5
  },
  flexContainer: {
    display: 'flex',
    flexWrap: 'nowrap'
  },
  item: {
    backgroundColor: 'white',
    color: 'dimgrey',
    fontFamily: "'Gotham 4r', sans-serif",
    fontSize: 15,
    cursor: 'pointer',
    float: 'left',
    textAlign: 'center',
    flex: 1,
    userSelect: 'none',
    boxSizing: 'border-box',
    borderLeft: 'solid 1px white'
  },
  select: {
    backgroundColor: '#2799a4',
    color: 'white',
    borderLeft: 'solid 1px #2799a4'
  },
  borderOnLeft: {
    borderLeft: 'solid 1px #a2a2a2'
  }
};
