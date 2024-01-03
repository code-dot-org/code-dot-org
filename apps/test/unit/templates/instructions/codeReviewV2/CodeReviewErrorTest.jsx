import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';
import javalabMsg from '@cdo/javalab/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const DEFAULT_PROPS = {
  messageTitle: null,
  messageText: null,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<CodeReviewError {...props} />);
};

describe('CodeReviewError', () => {
  it('renders exclamation circle icon', () => {
    const wrapper = setUp();
    const icon = wrapper.find(FontAwesome);
    expect(icon).to.have.length(1);
    expect(icon.props().icon).to.equal('exclamation-circle');
  });

  it('displays generic error if no messageTitle is passed', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.genericError())).to.be.true;
  });

  it('displays generic message if no messageText is passed', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.genericErrorMessage())).to.be.true;
  });

  it('displays messageTitle if passed', () => {
    const wrapper = setUp({messageTitle: 'My Custom Title'});
    expect(wrapper.contains('My Custom Title')).to.be.true;
  });

  it('displays messageText if passed', () => {
    const wrapper = setUp({messageText: 'My custom message'});
    expect(wrapper.contains('My custom message')).to.be.true;
  });
});
