import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';

const fakeSublevels = [
  {
    id: 1,
    title: 'Choice 1',
    thumbnail_url: 'some-fake.url/kittens.png',
    url: '/s/script/stage/1/puzzle/1/sublevel/1'
  },
  {
    id: 2,
    title: 'Choice 2',
    thumbnail_url: null,
    url: '/s/script/stage/1/puzzle/1/sublevel/2'
  }
];

const DEFAULT_PROPS = {
  level: {
    title: 'Bubble Choice',
    description: 'Choose one or more levels!',
    sublevels: fakeSublevels
  }
};

describe('BubbleChoice', () => {
  it('renders level information', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    assert.equal(DEFAULT_PROPS.level.title, wrapper.find('h1').text());
    assert.equal(
      DEFAULT_PROPS.level.description,
      wrapper.find('UnsafeRenderedMarkdown').text()
    );
  });

  it('renders sublevel thumbnail if present', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    const thumbnails = wrapper.find('img');
    assert.equal(1, thumbnails.length);
    assert(
      thumbnails
        .at(0)
        .getDOMNode()
        .src.includes(fakeSublevels[0].thumbnail_url)
    );
  });

  it('renders a placeholder div if sublevel thumbnail is not present', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    const placeholderThumbnails = wrapper.find('.placeholder');
    assert.equal(1, placeholderThumbnails.length);
  });
});
