import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import HiddenForSectionToggle from '@cdo/apps/templates/progress/HiddenForSectionToggle';
import i18n from '@cdo/locale';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('HiddenForSectionToggle', () => {
  it('renders SegmentedButtons reflecting hidden state', () => {
    const wrapper = shallow(
      <HiddenForSectionToggle hidden={false} onChange={() => {}} />
    );
    const segmented = wrapper.find(SegmentedButtons);
    expect(segmented).to.have.lengthOf(1);
    expect(segmented.prop('selectedButtonValue')).to.equal('visible');

    const buttons = segmented.prop('buttons');
    expect(buttons).to.have.lengthOf(2);
    expect(buttons[0]).to.include({label: i18n.visible(), value: 'visible'});
    expect(buttons[1]).to.include({label: i18n.hidden(), value: 'hidden'});

    // Changing the 'hidden' prop flips which value is selected.
    wrapper.setProps({hidden: true});
    expect(wrapper.find(SegmentedButtons).prop('selectedButtonValue')).to.equal(
      'hidden'
    );
  });

  it('forwards onChange value from SegmentedButtons', () => {
    const callback = sinon.spy();
    const wrapper = shallow(
      <HiddenForSectionToggle hidden={false} onChange={callback} />
    );

    const onChange = wrapper.find(SegmentedButtons).prop('onChange');
    onChange('visible');
    expect(callback).to.have.been.calledOnce.and.calledWith('visible');

    callback.resetHistory();
    onChange('hidden');
    expect(callback).to.have.been.calledOnce.and.calledWith('hidden');
  });

  it('disables all buttons when disabled prop is true', () => {
    const wrapper = shallow(
      <HiddenForSectionToggle
        hidden={false}
        onChange={() => {}}
        disabled={true}
      />
    );

    const buttons = wrapper.find(SegmentedButtons).prop('buttons');
    expect(buttons[0].disabled).to.equal(true);
    expect(buttons[1].disabled).to.equal(true);
  });
});
