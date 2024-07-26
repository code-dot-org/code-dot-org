import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import FontAwesome from '@cdo/apps/templates/FontAwesome';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';
import javalabMsg from '@cdo/javalab/locale';

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
    expect(icon).toHaveLength(1);
    expect(icon.props().icon).toBe('exclamation-circle');
  });

  it('displays generic error if no messageTitle is passed', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.genericError())).toBe(true);
  });

  it('displays generic message if no messageText is passed', () => {
    const wrapper = setUp();
    expect(wrapper.contains(javalabMsg.genericErrorMessage())).toBe(true);
  });

  it('displays messageTitle if passed', () => {
    const wrapper = setUp({messageTitle: 'My Custom Title'});
    expect(wrapper.contains('My Custom Title')).toBe(true);
  });

  it('displays messageText if passed', () => {
    const wrapper = setUp({messageText: 'My custom message'});
    expect(wrapper.contains('My custom message')).toBe(true);
  });
});
