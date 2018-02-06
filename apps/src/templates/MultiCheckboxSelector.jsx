import React, {PropTypes} from 'react';
import Radium from 'radium';
import Immutable from 'immutable';
import color from "../util/color";

const MARGIN = 10;
export const styles = {
  header: {
    color: color.purple,
    fontWeight: 'normal',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: color.purple,
  },
  checkbox: {
    marginRight: MARGIN,
    marginTop: 0,
  },
  selectAllCheckbox: {
    position: 'relative',
    bottom: 4,
  },
  list: {
    marginLeft: 0,
  },
  listItem: {
    listStyleType: 'none',
    display: 'flex',
    alignItems: 'center',
    marginBottom: MARGIN,
  },
};

const MultiCheckboxSelector = Radium(React.createClass({
  propTypes: {
    header: PropTypes.node,
    selected: PropTypes.array,
    items: PropTypes.array,
    onChange: PropTypes.func,
    children: PropTypes.element,
    itemPropName: PropTypes.string,
    style: PropTypes.any,
    disabled: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      itemPropName: 'item',
      selected: [],
      items: [],
      onChange: function () {},
      disabled: false,
    };
  },

  areAllSelected() {
    return Immutable.Set(this.props.selected).isSuperset(this.props.items);
  },

  toggleSelectAll() {
    if (this.areAllSelected()) {
      this.props.onChange([]);
    } else {
      this.props.onChange(this.props.items.slice());
    }
  },

  toggle(item) {
    const index = this.props.selected.indexOf(item);
    if (index >= 0) {
      // remove it
      this.props.onChange(
        [...this.props.selected.slice(0, index), ...this.props.selected.slice(index+1)]
      );
    } else {
      // add it
      this.props.onChange(this.props.selected.concat([item]));
    }
  },

  render() {
    return (
      <div style={this.props.style}>
        <h2 style={styles.header}>
          <input
            type="checkbox"
            style={[styles.checkbox, styles.selectAllCheckbox]}
            checked={this.areAllSelected()}
            onChange={this.toggleSelectAll}
            disabled={this.props.disabled}
          />
          {this.props.header}
        </h2>
        <ul style={styles.list}>
          {this.props.items.map((item, index) => (
             <li style={styles.listItem} key={index}>
               <input
                 style={styles.checkbox}
                 type="checkbox"
                 checked={this.props.selected.includes(item)}
                 onChange={() => this.toggle(item)}
                 disabled={this.props.disabled}
               />
               {React.cloneElement(this.props.children, {[this.props.itemPropName]:item})}
             </li>
           ))}
        </ul>
      </div>
    );
  }
}));

export default MultiCheckboxSelector;
