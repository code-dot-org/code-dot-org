import {assert} from '../../../util/reconfiguredChai';
import {stub} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import LessonExtrasProgressBubble from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';
import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';
import * as utils from '@cdo/apps/utils';

const defaultProps = {
  lessonExtrasUrl: '/extras',
  isPerfect: false,
  isSelected: false
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

  it('removes id from query params', () => {
    utils.currentLocation.restore();
    stub(utils, 'currentLocation').returns({search: '?id=1&foo=1'});

    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);

    assert.equal(wrapper.props().href, '/extras?foo=1');
  });

  it('renders a small flag icon when not selected', () => {
    const wrapper = shallow(<LessonExtrasProgressBubble {...defaultProps} />);
    assert.equal(16, wrapper.find(LessonExtrasFlagIcon).props().size);
  });

  it('renders a large flag icon when selected', () => {
    const wrapper = shallow(
      <LessonExtrasProgressBubble {...defaultProps} isSelected={true} />
    );
    assert.equal(24, wrapper.find(LessonExtrasFlagIcon).props().size);
  });
});
