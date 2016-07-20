import React from 'react';
import Radium from 'radium';
import Immutable from 'immutable';
import color from '../color';

const MARGIN = 10;
const styles = {
  header: {
    color: color.purple,
    fontWeight: 'normal',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: color.purple,
  },
  checkbox: {
    marginRight: MARGIN,
  },
  selectAllCheckbox: {
    position: 'relative',
    bottom: 4,
  },
  screenList: {
    marginLeft: 0,
  },
  screenListItem: {
    listStyleType: 'none',
    display: 'flex',
    marginBottom: MARGIN,
  },
};

const MultiCheckboxSelector = Radium(React.createClass({
  propTypes: {
    header: React.PropTypes.node,
    selected: React.PropTypes.array,
    items: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    children: React.PropTypes.element,
    itemPropName: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      itemPropName: 'item',
      selected: [],
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
      <div>
        <h2 style={styles.header}>
          <input
              type="checkbox"
              style={[styles.checkbox, styles.selectAllCheckbox]}
              checked={this.areAllSelected()}
              onChange={this.toggleSelectAll}/>
          {this.props.header}
        </h2>
        <ul style={styles.screenList}>
          {this.props.items.map((item, index) => (
             <li style={styles.screenListItem} key={index}>
               <input style={styles.checkbox}
                      type="checkbox"
                      checked={this.props.selected.includes(item)}
                      onChange={() => this.toggle(item)} />
               {React.cloneElement(this.props.children, {[this.props.itemPropName]:item})}
             </li>
           ))}
        </ul>
      </div>
    );
  }
}));

export default MultiCheckboxSelector;

if (BUILD_STYLEGUIDE) {
  const ItemComponent = function ({item}) {
    return <strong>{item}</strong>;
  };
  ItemComponent.propTypes = {item: React.PropTypes.string.isRequired};
  const ComplexItemComponent = function ({style, screen}) {
    return <div style={style}><strong>{screen.id}</strong> - {screen.name}</div>;
  };
  ComplexItemComponent.propTypes = {
    style: React.PropTypes.object,
    screen: React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string,
    }).isRequired
  };
  MultiCheckboxSelector.styleGuideExamples = storybook => {
    storybook
      .storiesOf("MultiCheckboxSelector", module)
      .addStoryTable([
        {
          name: 'with some selected',
          story: () => (
            <MultiCheckboxSelector
                header="Some Items"
                items={["one", "two", "three"]}
                selected={["two"]}
                onChange={storybook.action("onChange")}>
              <ItemComponent />
            </MultiCheckboxSelector>
          )
        }, {
          name: 'with all selected',
          story: () => (
            <MultiCheckboxSelector
                header="Some Items"
                items={["one", "two", "three"]}
                selected={["two", "one", "three"]}
                onChange={storybook.action("onChange")}>
              <ItemComponent />
            </MultiCheckboxSelector>
          )
        }, {
          name: 'with complex item component',
          story: () => (
            <MultiCheckboxSelector
                header="Some Items"
                items={[
                  {id: 'one', name: 'Item the First'},
                  {id: 'two', name: 'Item the Second!'},
                ]}
                itemPropName="screen"
                selected={[]}
                onChange={storybook.action("onChange")}>
              <ComplexItemComponent style={{color:'red'}} />
            </MultiCheckboxSelector>
          )
        },
      ]);
  };
}
