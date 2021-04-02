import {assert} from '../../../util/reconfiguredChai';
import {stub} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import LessonExtrasProgressBubble from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';
import * as utils from '@cdo/apps/utils';

const defaultProps = {
  lessonExtrasUrl: '/extras',
  perfect: false
};

describe('LessonExtrasProgressBubble', () => {
  beforeEach(() => {
    stub(utils, 'currentLocation').returns({search: ''});
  });

  afterEach(() => {
    utils.currentLocation.restore();
  });

  it('renders a link to given url', () => {
    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);

    assert.equal(wrapper.props().href, '/extras');
  });

  it('preserves query params', () => {
    utils.currentLocation.restore();
    stub(utils, 'currentLocation').returns({search: '?foo=1'});

    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);

    assert.equal(wrapper.props().href, '/extras?foo=1');
  });

  it('renders flag icon', () => {
    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);
    assert.equal(1, wrapper.find('LessonExtrasFlagIcon').length);
  });
});
