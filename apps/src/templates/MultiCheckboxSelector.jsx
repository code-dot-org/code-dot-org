import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography as MuiTypography} from '@mui/material';
import Immutable from 'immutable';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import moduleStyles from './multiCheckboxSelector.module.css';

class MultiCheckboxSelector extends Component {
  static propTypes = {
    header: PropTypes.node,
    selected: PropTypes.array,
    items: PropTypes.array,
    onChange: PropTypes.func,
    children: PropTypes.element,
    itemPropName: PropTypes.string,
    // Names an item's checkbox for screen readers. The rendered item is a
    // sibling of its checkbox rather than its label, so without this the
    // checkbox is announced with no name at all. Defaults to the item itself
    // when items are strings.
    itemLabel: PropTypes.func,
    style: PropTypes.any,
    disabled: PropTypes.bool,
    noHeader: PropTypes.bool,
    // For cases where items are objects and we need to do a deep comparison to
    // determine if they're selected.
    checkById: PropTypes.bool,
  };

  static defaultProps = {
    itemPropName: 'item',
    itemLabel: item => (typeof item === 'string' ? item : undefined),
    selected: [],
    items: [],
    onChange: () => {},
    disabled: false,
  };

  // Ids for the labelling relationships below. Several selectors can share a
  // page, so the ids have to be unique per instance.
  id = _.uniqueId('multiCheckboxSelector-');

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
        selectedItems = _.remove(this.props.selected, function (selection) {
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
          ...this.props.selected.slice(index + 1),
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
    // The header is usually the plain text naming what is being selected, in
    // which case the select-all box can say what it selects all of.
    const selectAllLabel =
      typeof this.props.header === 'string'
        ? `Select all ${this.props.header}`
        : 'Select all';

    return (
      <div style={this.props.style}>
        {!this.props.noHeader && (
          // The checkbox sits beside the heading rather than inside it: text
          // inside a heading becomes part of the heading's name, and "Select
          // all Screens Screens" is not a useful thing to hear while
          // navigating by heading.
          <div className={moduleStyles.header}>
            <Checkbox
              name={`${this.props.itemPropName}-select-all`}
              ariaLabel={selectAllLabel}
              checked={this.areAllSelected()}
              onChange={this.toggleSelectAll}
              disabled={this.props.disabled}
            />
            <MuiTypography variant="h3" component="h2">
              {this.props.header}
            </MuiTypography>
          </div>
        )}
        <ul className={moduleStyles.list}>
          {this.props.items.map((item, index) => {
            const itemLabel = this.props.itemLabel(item);
            const itemId = `${this.id}-item-${index}`;
            return (
              <li
                className={moduleStyles.listItem}
                key={`${itemLabel ?? ''}-${itemId}`}
              >
                <Checkbox
                  name={`${this.props.itemPropName}-${index}`}
                  // With no label of its own, the checkbox borrows the name of
                  // whatever the item renders.
                  ariaLabel={itemLabel}
                  aria-labelledby={itemLabel ? undefined : itemId}
                  checked={this.checked(item)}
                  onChange={() => this.toggle(item)}
                  disabled={this.props.disabled}
                />
                <div id={itemId}>
                  {React.cloneElement(this.props.children, {
                    [this.props.itemPropName]: item,
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default MultiCheckboxSelector;
