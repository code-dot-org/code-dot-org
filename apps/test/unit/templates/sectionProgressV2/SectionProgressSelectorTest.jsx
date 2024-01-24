import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionProgressSelector} from '@cdo/apps/templates/sectionProgressV2/SectionProgressSelector.jsx';
import DCDO from '@cdo/apps/dcdo';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import SectionProgressV2 from '@cdo/apps/templates/sectionProgressV2/SectionProgressV2';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  showProgressTableV2: false,
  setShowProgressTableV2: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<UnconnectedSectionProgressSelector {...props} />);
};

describe('SectionProgressSelector', () => {
  beforeEach(() => {
    DCDO.set('progress-table-v2-enabled', true);
    DCDO.set('progress-table-v2-default-v2', false);
  });
  it('does not show toggle button if disabled', () => {
    DCDO.set('progress-table-v2-enabled', false);
    const wrapper = setUp({showProgressTableV2: true});

    expect(wrapper.find('Button')).to.have.length(0);
  });

  it('shows v1 if disabled', () => {
    DCDO.set('progress-table-v2-enabled', false);
    const wrapper = setUp({showProgressTableV2: true});

    expect(wrapper.find(SectionProgress)).to.have.length(1);
    expect(wrapper.find(SectionProgressV2)).to.have.length(0);
  });

  it('shows v1', () => {
    const wrapper = setUp();

    expect(wrapper.find(SectionProgress)).to.have.length(1);
    expect(wrapper.find(SectionProgressV2)).to.have.length(0);
    expect(wrapper.find('Button')).to.have.length(1);
  });
  it('shows v2', () => {
    const wrapper = setUp({showProgressTableV2: true});

    expect(wrapper.find(SectionProgress)).to.have.length(0);
    expect(wrapper.find(SectionProgressV2)).to.have.length(1);
    expect(wrapper.find('Button')).to.have.length(1);
  });

  it('shows default if no user preference', () => {
    const wrapper = setUp({showProgressTableV2: undefined});

    expect(wrapper.find(SectionProgress)).to.have.length(1);
    expect(wrapper.find(SectionProgressV2)).to.have.length(0);

    DCDO.set('progress-table-v2-default-v2', true);
    const wrapper_1 = setUp({showProgressTableV2: undefined});

    expect(wrapper_1.find(SectionProgress)).to.have.length(0);
    expect(wrapper_1.find(SectionProgressV2)).to.have.length(1);
  });

  it('sets user preference when button toggled', () => {
    const stub = sinon.stub();
    const wrapper = setUp({
      showProgressTableV2: false,
      setShowProgressTableV2: stub,
    });

    expect(wrapper.find(SectionProgress)).to.have.length(1);
    expect(wrapper.find(SectionProgressV2)).to.have.length(0);
    const button = wrapper.find('Button');
    button.simulate('click', {preventDefault: () => {}});
    expect(stub).calledOnceWith(true);
  });
});
