import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import SublevelCard from '@cdo/apps/code-studio/components/SublevelCard';

const DEFAULT_PROPS = {
  isLessonExtra: false,
  sublevel: {
    id: '1',
    display_name: 'Choice 1',
    description: 'Sublevel 1 is lots of fun',
    thumbnail_url: 'some-fake.url/kittens.png',
    url: '/s/script/lessons/1/levels/2/sublevel/1',
    position: 1,
    letter: 'a',
    perfect: true,
    status: 'perfect'
  }
};

const LESSON_EXTRAS_DEFAULT_PROPS = {
  isLessonExtra: true,
  sublevel: {
    id: '1',
    display_name: 'Choice 1',
    description: 'Sublevel 1 is lots of fun',
    thumbnail_url: 'some-fake.url/kittens.png',
    url:
      'http://studio.code.org:3000/s/coursef-2019/lessons/4/extras?level_name=courseC_artist_prog_challenge1_2019',
    perfect: false
  }
};

const sublevel_no_thumbnail = {
  id: '1',
  display_name: 'Choice 1',
  description: 'Sublevel 1 is lots of fun',
  thumbnail_url: null,
  url: '/s/script/lessons/1/levels/2/sublevel/1',
  position: 1,
  letter: 'a',
  perfect: true,
  status: 'perfect'
};

describe('SublevelCard', () => {
  it('renders level information', () => {
    const wrapper = mount(<SublevelCard {...DEFAULT_PROPS} />);
    assert.equal(
      DEFAULT_PROPS.sublevel.display_name,
      wrapper.find('.sublevel-card-title-uitest').text()
    );
    assert.equal(
      DEFAULT_PROPS.sublevel.description,
      wrapper.find('.sublevel-card-description-uitest').text()
    );
  });

  it('renders sublevel thumbnail if present', () => {
    const wrapper = mount(<SublevelCard {...DEFAULT_PROPS} />);
    const thumbnails = wrapper.find('img');
    assert.equal(1, thumbnails.length);
    assert(
      thumbnails
        .at(0)
        .getDOMNode()
        .src.includes(DEFAULT_PROPS.sublevel.thumbnail_url)
    );
  });

  it('renders progress bubbles for sublevels', () => {
    const wrapper = mount(<SublevelCard {...DEFAULT_PROPS} />);
    const bubbles = wrapper.find('ProgressBubble');
    assert.equal(1, bubbles.length);
    assert.equal('perfect', bubbles.at(0).props().level.status);
  });

  it('renders a placeholder div if sublevel thumbnail is not present', () => {
    const wrapper = mount(
      <SublevelCard {...DEFAULT_PROPS} sublevel={sublevel_no_thumbnail} />
    );
    const placeholderThumbnails = wrapper.find('.placeholder');
    assert.equal(1, placeholderThumbnails.length);
  });

  it('renders flag bubble for lesson extras level', () => {
    const wrapper = mount(<SublevelCard {...LESSON_EXTRAS_DEFAULT_PROPS} />);
    assert.equal(1, wrapper.find('LessonExtrasFlagIcon').length);
    assert.equal(
      LESSON_EXTRAS_DEFAULT_PROPS.sublevel.display_name,
      wrapper.find('.sublevel-card-title-uitest').text()
    );
    assert.equal(
      LESSON_EXTRAS_DEFAULT_PROPS.sublevel.description,
      wrapper.find('.sublevel-card-description-uitest').text()
    );
  });
});
