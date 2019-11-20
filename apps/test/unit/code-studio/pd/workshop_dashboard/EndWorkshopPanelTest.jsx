import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import EndWorkshopPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/EndWorkshopPanel';

describe('EndWorkshopPanel', () => {
  it('renders', () => {
    shallow(<EndWorkshopPanel loadWorkshop={sinon.spy()} />);
  });
});
