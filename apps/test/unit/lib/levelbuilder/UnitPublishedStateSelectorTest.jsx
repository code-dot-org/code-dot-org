import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import UnitPublishedStateSelector from '../../../../src/lib/levelbuilder/UnitPublishedStateSelector';

describe('UnitPublishedStateSelector', () => {
  let defaultProps, updateVisible;

  beforeEach(() => {
    updateVisible = sinon.spy();
    defaultProps = {
      visible: true,
      updateVisible
    };
  });

  it('test', () => {
    const wrapper = shallow(<UnitPublishedStateSelector {...defaultProps} />);
    expect(wrapper.find('select').length).to.equal(1);
  });
});
