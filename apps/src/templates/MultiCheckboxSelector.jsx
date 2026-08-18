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
    style: PropTypes.any,
    disabled: PropTypes.bool,
    noHeader: PropTypes.bool,
    // For cases where items are objects and we need to do a deep comparison to
    // determine if they're selected.
    checkById: PropTypes.bool,
  };

  static defaultProps = {
    itemPropName: 'item',
    selected: [],
    items: [],
    onChange: () => {},
    disabled: false,
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
    return (
      <div style={this.props.style}>
        {!this.props.noHeader && (
          <MuiTypography
            variant="h3"
            component="h2"
            className={moduleStyles.header}
            sx={{
              borderBottom: '1px solid var(--borders-neutral-primary)',
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <Checkbox
              style={{alignItems: 'center'}}
              checked={this.areAllSelected()}
              onChange={this.toggleSelectAll}
              disabled={this.props.disabled}
            />
            {this.props.header}
          </MuiTypography>
        )}
        <ul className={moduleStyles.list}>
          {this.props.items.map((item, index) => (
            <li className={moduleStyles.listItem} key={index}>
              <Checkbox
                checked={this.checked(item)}
                onChange={() => this.toggle(item)}
                disabled={this.props.disabled}
              />
              {React.cloneElement(this.props.children, {
                [this.props.itemPropName]: item,
              })}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default MultiCheckboxSelector;
