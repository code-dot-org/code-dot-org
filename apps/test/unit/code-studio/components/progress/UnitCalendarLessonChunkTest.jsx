import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import UnitCalendarLessonChunk from '@cdo/apps/code-studio/components/progress/UnitCalendarLessonChunk';
import color from '@cdo/apps/util/color';

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
  url: 'https://www.google.com/',
};

describe('UnitCalendarLessonChunk', () => {
  it('is purple border with grey text when is assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: true,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('a').prop('style')['border']).toBe(
      '2px solid ' + color.purple
    );
    expect(wrapper.find('a').prop('style')['color']).toBe('#333');
  });

  it('is purple background with white text when is assessment and being hovered', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: true,
        }}
        isHover={true}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('a').prop('style')['border']).toBe(
      '2px solid ' + color.purple
    );
    expect(wrapper.find('a').prop('style')['backgroundColor']).toBe(
      color.purple
    );
    expect(wrapper.find('a').prop('style')['color']).toBe('white');
  });

  it('is teal border with grey text when is assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: false,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('a').prop('style')['border']).toBe(
      '2px solid ' + color.teal
    );
    expect(wrapper.find('a').prop('style')['color']).toBe('#333');
  });

  it('is teal background with white text when is assessment and being hovered', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: false,
        }}
        isHover={true}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('a').prop('style')['border']).toBe(
      '2px solid ' + color.teal
    );
    expect(wrapper.find('a').prop('style')['backgroundColor']).toBe(color.teal);
    expect(wrapper.find('a').prop('style')['color']).toBe(color.white);
  });

  it('has dashed left border when not isStart', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          isStart: false,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('a').prop('style')['borderLeftStyle']).toBe('dashed');
  });

  it('has dashed right border when not isEnd', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          isEnd: false,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('a').prop('style')['borderRightStyle']).toBe('dashed');
  });

  it('does not show title if isMajority false', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          isMajority: false,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(
      wrapper.containsMatchingElement(<div>{sampleLessonChunk.title}</div>)
    ).toBe(false);
  });

  it('shows lesson number with tooltip if small chunk', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          duration: 30,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <div>{sampleLessonChunk.lessonNumber}</div>
      )
    ).toBe(true);
    expect(
      wrapper.containsMatchingElement(
        <ReactTooltip>
          <div>{sampleLessonChunk.title}</div>
        </ReactTooltip>
      )
    ).toBe(true);
  });

  it('hides assessment icon if not assessment', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          assessment: false,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('FontAwesome').at(0).prop('style')['visibility']).toBe(
      'hidden'
    );
  });

  it('hides unplugged icon if not unplugged', () => {
    const wrapper = shallow(
      <UnitCalendarLessonChunk
        minuteWidth={1}
        lessonChunk={{
          ...sampleLessonChunk,
          unplugged: false,
        }}
        isHover={false}
        handleHover={() => console.log('hover')}
      />
    );

    expect(wrapper.find('FontAwesome').at(1).prop('style')['visibility']).toBe(
      'hidden'
    );
  });
});
