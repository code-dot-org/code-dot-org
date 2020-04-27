import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import Immutable from 'immutable';
import color from '../util/color';
import _ from 'lodash';

const MARGIN = 10;
export const styles = {
  header: {
    color: color.purple,
    fontWeight: 'normal',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: color.purple
  },
  checkbox: {
    marginRight: MARGIN,
    marginTop: 0
  },
  selectAllCheckbox: {
    position: 'relative',
    bottom: 4
  },
  list: {
    marginLeft: 0
  },
  listItem: {
    listStyleType: 'none',
    display: 'flex',
    alignItems: 'center',
    marginBottom: MARGIN
  }
};

class MultiCheckboxSelector extends Component {
  static propTypes = {
    header: PropTypes.node,
    selected: PropTypes.array,
    items: PropTypes.array,
    onChange: PropTypes.func,
    children: PropTypes.element,
    itemPropName: PropTypes.string,
    style: PropTypes.any,
    disabled: PropTypes.bool,
    noHeader: PropTypes.bool,
    // For cases where items are objects and we need to do a deep comparison to
    // determine if they're selected.
    checkById: PropTypes.bool
  };

  static defaultProps = {
    itemPropName: 'item',
    selected: [],
    items: [],
    onChange: () => {},
    disabled: false
  };

  areAllSelected = () => {
    return Immutable.Set(this.props.selected).isSuperset(this.props.items);
  };

  toggleSelectAll = () => {
    if (this.areAllSelected()) {
      this.props.onChange([]);
    } else {
      this.props.onChange(this.props.items.slice());
    }
  };

  toggle = item => {
    if (this.props.checkById) {
      let selectedItems = [];
      if (_.map(this.props.selected, 'id').includes(item.id)) {
        selectedItems = _.remove(this.props.selected, function(selection) {
          return selection.id !== item.id;
        });
      } else {
        selectedItems = _.concat(this.props.selected, item);
      }
      this.props.onChange(selectedItems, item);
    } else {
      const index = this.props.selected.indexOf(item);
      if (index >= 0) {
        // remove it
        this.props.onChange([
          ...this.props.selected.slice(0, index),
          ...this.props.selected.slice(index + 1)
        ]);
      } else {
        // add it
        this.props.onChange(this.props.selected.concat([item]));
      }
    }
  };

  checked = item => {
    return this.props.checkById
      ? _.map(this.props.selected, 'id').includes(item.id)
      : this.props.selected.includes(item);
  };

  render() {
    return (
      <div style={this.props.style}>
        {!this.props.noHeader && (
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
        )}
        <ul style={styles.list}>
          {this.props.items.map((item, index) => (
            <li style={styles.listItem} key={index}>
              <input
                style={styles.checkbox}
                type="checkbox"
                checked={this.checked(item)}
                onChange={() => this.toggle(item)}
                disabled={this.props.disabled}
              />
              {React.cloneElement(this.props.children, {
                [this.props.itemPropName]: item
              })}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Radium(MultiCheckboxSelector);
