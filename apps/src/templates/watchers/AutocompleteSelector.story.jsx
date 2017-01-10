import React from 'react';
import AutocompleteSelector from './AutocompleteSelector';

export default storybook => {
  storybook
    .storiesOf('AutocompleteSelector', module)
    .addStoryTable([
      {
        name: 'with no selection',
        story: () => (
          <AutocompleteSelector
            currentText="test"
            currentIndex={-1}
            options={['one', 'two']}
            onOptionClicked={storybook.action("click")}
            onOptionHovered={storybook.action("hover")}
            onClickOutside={storybook.action("click outside")}
          />
        )
      },
      {
        name: 'with one selected',
        story: () => (
          <AutocompleteSelector
            currentText="test"
            currentIndex={0}
            options={['one', 'two']}
            onOptionClicked={storybook.action("click")}
            onOptionHovered={storybook.action("hover")}
            onClickOutside={storybook.action("click outside")}
          />
        )
      }
    ]);
};
