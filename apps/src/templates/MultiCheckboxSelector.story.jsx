import PropTypes from 'prop-types';
import React from 'react';
import MultiCheckboxSelector from './MultiCheckboxSelector';
import {action} from '@storybook/addon-actions';

const ItemComponent = function ({item}) {
  return <strong>{item}</strong>;
};
ItemComponent.propTypes = {item: PropTypes.string};

const ComplexItemComponent = function ({style, screen}) {
  return (
    <div style={style}>
      <h2>{screen.name}</h2>
      <p>{screen.id}</p>
    </div>
  );
};
ComplexItemComponent.propTypes = {
  style: PropTypes.object,
  screen: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

const defaultExport = {
  component: MultiCheckboxSelector,
};

const stories = {};

const ItemComponentTemplate = args => (
  <MultiCheckboxSelector {...args}>
    <ItemComponent />
  </MultiCheckboxSelector>
);

const ComplexComponentTemplate = args => (
  <MultiCheckboxSelector {...args}>
    <ComplexItemComponent style={{border: '1px solid black', padding: 10}} />
  </MultiCheckboxSelector>
);

const WithSomeSelected = ItemComponentTemplate.bind({});
WithSomeSelected.args = {
  header: 'Some Items',
  items: ['one', 'two', 'three'],
  selected: ['two'],
  onChange: action('onChange'),
};

stories['WithSomeSelected'] = WithSomeSelected;

const WithAllSelected = ItemComponentTemplate.bind({});
WithAllSelected.args = {
  header: 'Some Items',
  items: ['one', 'two', 'three'],
  selected: ['one', 'two', 'three'],
  onChange: action('onChange'),
};

stories['WithAllSelected'] = WithAllSelected;

const WithComplextItemComponent = ComplexComponentTemplate.bind({});
WithComplextItemComponent.args = {
  header: 'Some Items',
  itemPropName: 'screen',
  items: [
    {id: 'one', name: 'Item the First'},
    {id: 'two', name: 'Item the Second!'},
  ],
  selected: [],
  onChange: action('onChange'),
};

stories['WithComplexItemComponent'] = WithComplextItemComponent;

const DisabledMultiCheckboxSelector = ItemComponentTemplate.bind({});
DisabledMultiCheckboxSelector.args = {
  header: 'Some Items',
  items: ['one', 'two', 'three'],
  selected: ['two'],
  onChange: action('onChange'),
  disabled: true,
};

stories['DisabledMultiCheckboxSelector'] = DisabledMultiCheckboxSelector;

const NoHeaderMultiCheckboxSelector = ItemComponentTemplate.bind({});
NoHeaderMultiCheckboxSelector.args = {
  noHeader: true,
  items: ['one', 'two', 'three'],
  selected: ['two'],
  onChange: action('onChange'),
};

stories['NoHeaderMultiCheckboxSelector'] = NoHeaderMultiCheckboxSelector;

module.exports = {
  ...stories,
  default: defaultExport,
};
