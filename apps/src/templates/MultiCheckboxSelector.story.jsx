import PropTypes from 'prop-types';
import React from 'react';
import MultiCheckboxSelector from './MultiCheckboxSelector';
import {action} from '@storybook/addon-actions';

const ItemComponent = function({item}) {
  return <strong>{item}</strong>;
};
ItemComponent.propTypes = {item: PropTypes.string};
const ComplexItemComponent = function({style, screen}) {
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
    name: PropTypes.string
  })
};

export default storybook => {
  storybook.storiesOf('MultiCheckboxSelector', module).addStoryTable([
    {
      name: 'with some selected',
      story: () => (
        <MultiCheckboxSelector
          header="Some Items"
          items={['one', 'two', 'three']}
          selected={['two']}
          onChange={action('onChange')}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      )
    },
    {
      name: 'with all selected',
      story: () => (
        <MultiCheckboxSelector
          header="Some Items"
          items={['one', 'two', 'three']}
          selected={['two', 'one', 'three']}
          onChange={action('onChange')}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      )
    },
    {
      name: 'with complex item component',
      story: () => (
        <MultiCheckboxSelector
          header="Some Items"
          items={[
            {id: 'one', name: 'Item the First'},
            {id: 'two', name: 'Item the Second!'}
          ]}
          itemPropName="screen"
          selected={[]}
          onChange={action('onChange')}
        >
          <ComplexItemComponent
            style={{border: '1px solid black', padding: 10}}
          />
        </MultiCheckboxSelector>
      )
    },
    {
      name: 'disabled',
      story: () => (
        <MultiCheckboxSelector
          header="Some Items"
          items={['one', 'two', 'three']}
          selected={['two']}
          onChange={action('onChange')}
          disabled={true}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      )
    },
    {
      name: 'no header',
      story: () => (
        <MultiCheckboxSelector
          noHeader={true}
          items={['one', 'two', 'three']}
          selected={['two']}
          onChange={action('onChange')}
        >
          <ItemComponent />
        </MultiCheckboxSelector>
      )
    }
  ]);
};
