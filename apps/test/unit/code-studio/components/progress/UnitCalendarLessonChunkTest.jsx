import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendarLessonChunk from '@cdo/apps/code-studio/components/progress/UnitCalendarLessonChunk';

const sampleLesson = {
  id: 1,
  title: 'test',
  duration: 10,
  assessment: true,
  unplugged: true,
  isStart: true,
  isEnd: true,
  isMajority: true,
  url: 'https://www.google.com/'
};

describe('UnitCalendarLessonChunk', () => {
  it('is purple border with grey text when is assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          assessment: true
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid rgb(118, 101, 160)'
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', '#333');
  });
  it('is purple background with white text when is assessment and being hovered', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          assessment: true
        }}
        isHover={true}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid rgb(118, 101, 160)'
    );
    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'backgroundColor',
      'rgb(118, 101, 160)'
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', 'white');
  });
  it('is teal border with grey text when is assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          assessment: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid #00adbc'
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', '#333');
  });
  it('is teal background with white text when is assessment and being hovered', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          assessment: false
        }}
        isHover={true}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid #00adbc'
    );
    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'backgroundColor',
      '#00adbc'
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', 'white');
  });
  it('has dashed left border when not isStart', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          isStart: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'borderLeftStyle',
      'dashed'
    );
  });
  it('has dashed right border when not isEnd', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          isEnd: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'borderRightStyle',
      'dashed'
    );
  });
  it('does not show title if isMajority false', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          isMajority: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.containsMatchingElement(<div>{sampleLesson.title}</div>)).to
      .be.false;
  });
  it('hides assessment icon if not assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          assessment: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('.fa.fa-check-circle').prop('style'),
      'visibility',
      'hidden'
    );
  });
  it('hides unplugged icon if not unplugged', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lesson={{
          ...sampleLesson,
          unplugged: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('.fa.fa-scissors').prop('style'),
      'visibility',
      'hidden'
    );
  });
});
