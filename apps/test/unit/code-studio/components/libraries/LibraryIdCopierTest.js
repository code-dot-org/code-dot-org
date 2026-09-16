import TextField from '@code-dot-org/component-library/textField';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LibraryIdCopier from '@cdo/apps/code-studio/components/libraries/LibraryIdCopier.jsx';

describe('LibraryIdCopier', () => {
  const channelId = '123';
  it('displays the channel id', () => {
    let wrapper = shallow(
      <LibraryIdCopier libraryName="name" channelId={channelId} />
    );

    expect(wrapper.find(TextField).props().value).toBe(channelId);
  });
});
