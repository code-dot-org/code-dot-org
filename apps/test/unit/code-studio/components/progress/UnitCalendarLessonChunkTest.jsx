import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import UnitCalendarLessonChunk from '@cdo/apps/code-studio/components/progress/UnitCalendarLessonChunk';

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
      '2px solid var(--borders-brand-purple-primary)'
    );
    expect(wrapper.find('a').prop('style')['color']).toBe(
      'var(--text-neutral-primary)'
    );
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
      '2px solid var(--borders-brand-purple-primary)'
    );
    expect(wrapper.find('a').prop('style')['backgroundColor']).toBe(
      'var(--background-brand-purple-primary)'
    );
    expect(wrapper.find('a').prop('style')['color']).toBe(
      'var(--text-neutral-white-fixed)'
    );
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
      '2px solid var(--borders-brand-teal-primary)'
    );
    expect(wrapper.find('a').prop('style')['color']).toBe(
      'var(--text-neutral-primary)'
    );
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
      '2px solid var(--borders-brand-teal-primary)'
    );
    expect(wrapper.find('a').prop('style')['backgroundColor']).toBe(
      'var(--background-brand-teal-primary)'
    );
    expect(wrapper.find('a').prop('style')['color']).toBe(
      'var(--text-neutral-white-fixed)'
    );
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

    expect(
      wrapper.find(FontAwesomeV6Icon).at(0).prop('style')['visibility']
    ).toBe('hidden');
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

    expect(
      wrapper.find(FontAwesomeV6Icon).at(1).prop('style')['visibility']
    ).toBe('hidden');
  });
});
