import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryIdCopier from '@cdo/apps/code-studio/components/libraries/LibraryIdCopier.jsx';

describe('LibraryIdCopier', () => {
  const CHANNEL_ID_SELECTOR = 'input[type="text"]';
  const channelId = '123';
  it('displays the channel id', () => {
    let wrapper = shallow(
      <LibraryIdCopier libraryName="name" channelId={channelId} />
    );

    expect(wrapper.find(CHANNEL_ID_SELECTOR).props().value).to.equal(channelId);
  });
});
