import {action} from '@storybook/addon-actions';
import PropTypes from 'prop-types';
import React from 'react';

import MultiCheckboxSelector from './MultiCheckboxSelector';

export default {
  component: MultiCheckboxSelector,
};

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

export const WithSomeSelected = ItemComponentTemplate.bind({});
WithSomeSelected.args = {
  header: 'Some Items',
  items: ['one', 'two', 'three'],
  selected: ['two'],
  onChange: action('onChange'),
};

export const WithAllSelected = ItemComponentTemplate.bind({});
WithAllSelected.args = {
  header: 'Some Items',
  items: ['one', 'two', 'three'],
  selected: ['one', 'two', 'three'],
  onChange: action('onChange'),
};

export const WithComplexItemComponent = ComplexComponentTemplate.bind({});
WithComplexItemComponent.args = {
  header: 'Some Items',
  itemPropName: 'screen',
  items: [
    {id: 'one', name: 'Item the First'},
    {id: 'two', name: 'Item the Second!'},
  ],
  selected: [],
  onChange: action('onChange'),
};

export const DisabledMultiCheckboxSelector = ItemComponentTemplate.bind({});
DisabledMultiCheckboxSelector.args = {
  header: 'Some Items',
  items: ['one', 'two', 'three'],
  selected: ['two'],
  onChange: action('onChange'),
  disabled: true,
};

export const NoHeaderMultiCheckboxSelector = ItemComponentTemplate.bind({});
NoHeaderMultiCheckboxSelector.args = {
  noHeader: true,
  items: ['one', 'two', 'three'],
  selected: ['two'],
  onChange: action('onChange'),
};
