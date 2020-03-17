import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import PublishSuccessDisplay from '@cdo/apps/code-studio/components/libraries/PublishSuccessDisplay.jsx';

describe('PublishSuccessDisplay', () => {
  const CHANNEL_ID_SELECTOR = 'input[type="text"]';
  const channelId = '123';
  it('displays channel id when in published state', () => {
    let wrapper = shallow(
      <PublishSuccessDisplay libraryName="name" channelId={channelId} />
    );

    expect(wrapper.find(CHANNEL_ID_SELECTOR).props().value).to.equal(channelId);
  });
});
