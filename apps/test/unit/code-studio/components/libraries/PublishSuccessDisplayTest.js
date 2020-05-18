import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import PublishSuccessDisplay from '@cdo/apps/code-studio/components/libraries/PublishSuccessDisplay.jsx';

describe('PublishSuccessDisplay', () => {
  it('displays a button when onShareTeacherLibrary is passed', () => {
    let wrapper = shallow(
      <PublishSuccessDisplay
        libraryName="name"
        channelId="123"
        onShareTeacherLibrary={() => {}}
      />
    );

    expect(wrapper.find('Button')).to.have.lengthOf(1);
  });

  it('does not display a button when onShareTeacherLibrary is passed', () => {
    let wrapper = shallow(
      <PublishSuccessDisplay libraryName="name" channelId="123" />
    );

    expect(wrapper.find('Button')).to.have.lengthOf(0);
  });
});
