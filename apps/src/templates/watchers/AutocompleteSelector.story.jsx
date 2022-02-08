import React from 'react';
import AutocompleteSelector from './AutocompleteSelector';
import {action} from '@storybook/addon-actions';
import {allowConsoleWarnings} from '../../../test/util/testUtils';

export default storybook => {
  if (IN_UNIT_TEST) {
    allowConsoleWarnings();
  }

  storybook.storiesOf('AutocompleteSelector', module).addStoryTable([
    {
      name: 'with no selection',
      story: () => (
        <AutocompleteSelector
          currentText="test"
          currentIndex={-1}
          options={['one', 'two']}
          onOptionClicked={action('click')}
          onOptionHovered={action('hover')}
          onClickOutside={action('click outside')}
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
          onOptionClicked={action('click')}
          onOptionHovered={action('hover')}
          onClickOutside={action('click outside')}
        />
      )
    }
  ]);
};
