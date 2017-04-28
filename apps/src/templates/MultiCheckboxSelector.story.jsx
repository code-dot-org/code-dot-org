import React from 'react';
import MultiCheckboxSelector from './MultiCheckboxSelector';

const ItemComponent = function ({item}) {
  return <strong>{item}</strong>;
};
ItemComponent.propTypes = {item: React.PropTypes.string};
const ComplexItemComponent = function ({style, screen}) {
  return (
    <div style={style}>
      <h2>{screen.name}</h2>
      <p>{screen.id}</p>
    </div>
  );
};
ComplexItemComponent.propTypes = {
  style: React.PropTypes.object,
  screen: React.PropTypes.shape({
    id: React.PropTypes.string,
    name: React.PropTypes.string,
  })
};

export default storybook => {
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
            onChange={storybook.action("onChange")}
          >
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
            onChange={storybook.action("onChange")}
          >
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
            onChange={storybook.action("onChange")}
          >
            <ComplexItemComponent style={{border: '1px solid black', padding: 10}} />
          </MultiCheckboxSelector>
        )
      }, {
        name: 'disabled',
        story: () => (
          <MultiCheckboxSelector
            header="Some Items"
            items={["one", "two", "three"]}
            selected={["two"]}
            onChange={storybook.action("onChange")}
            disabled={true}
          >
            <ItemComponent />
          </MultiCheckboxSelector>
        )
      },
    ]);
};
