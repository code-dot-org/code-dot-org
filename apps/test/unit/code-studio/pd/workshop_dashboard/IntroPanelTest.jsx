import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import IntroPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/IntroPanel';

describe('IntroPanel', () => {
  it('renders', () => {
    shallow(<IntroPanel loadWorkshop={sinon.spy()} />);
  });
});
