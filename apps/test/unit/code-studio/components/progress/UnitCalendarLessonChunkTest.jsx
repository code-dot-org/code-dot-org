import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendarLessonChunk from '@cdo/apps/code-studio/components/progress/UnitCalendarLessonChunk';
import color from '@cdo/apps/util/color';
import ReactTooltip from 'react-tooltip';

const sampleLessonChunk = {
  id: 1,
  lessonNumber: 5,
  title: 'test',
  duration: 100,
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
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: true
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid ' + color.purple
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', '#333');
  });

  it('is purple background with white text when is assessment and being hovered', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: true
        }}
        isHover={true}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid ' + color.purple
    );
    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'backgroundColor',
      color.purple
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', 'white');
  });

  it('is teal border with grey text when is assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid ' + color.teal
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', '#333');
  });

  it('is teal background with white text when is assessment and being hovered', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: false
        }}
        isHover={true}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'border',
      '2px solid ' + color.teal
    );
    assert.propertyVal(
      wrapper.find('a').prop('style'),
      'backgroundColor',
      color.teal
    );
    assert.propertyVal(wrapper.find('a').prop('style'), 'color', color.white);
  });

  it('has dashed left border when not isStart', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
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
        lessonChunk={{
          ...sampleLessonChunk,
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
        lessonChunk={{
          ...sampleLessonChunk,
          isMajority: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(
      wrapper.containsMatchingElement(<div>{sampleLessonChunk.title}</div>)
    ).to.be.false;
  });

  it('shows lesson number with tooltip if small chunk', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          duration: 30
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <div>{sampleLessonChunk.lessonNumber}</div>
      )
    ).to.be.true;
    expect(
      wrapper.containsMatchingElement(
        <ReactTooltip>
          <div>{sampleLessonChunk.title}</div>
        </ReactTooltip>
      )
    ).to.be.true;
  });

  it('hides assessment icon if not assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .prop('style'),
      'visibility',
      'hidden'
    );
  });

  it('hides unplugged icon if not unplugged', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          unplugged: false
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    assert.propertyVal(
      wrapper
        .find('FontAwesome')
        .at(1)
        .prop('style'),
      'visibility',
      'hidden'
    );
  });
});
