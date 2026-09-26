import {Markdown} from '@code-dot-org/markdown';
import {fireEvent, render} from '@testing-library/react';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import RollupLessonEntrySection from '@cdo/apps/templates/courseRollupPages/RollupLessonEntrySection';
import LessonStandards from '@cdo/apps/templates/lessonOverview/LessonStandards';
import i18n from '@cdo/locale';

import {courseData} from './rollupTestData';

describe('RollupLessonEntrySection', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Resources',
      lesson: courseData.units[0].lessons[0],
    };
  });

  it('renders list of resources when there are resources', () => {
    const wrapper = mount(<RollupLessonEntrySection {...defaultProps} />);

    expect(wrapper.text()).toContain('Teacher Resource');
    expect(wrapper.text()).toContain('Slides');
    expect(wrapper.text()).toContain('Student Resource');
    expect(wrapper.text()).toContain('Activity Guide');
  });

  it('renders no resources message when no resources', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.text()).toContain(i18n.rollupNoResources());
  });

  it('renders list of prep when there is prep', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <RollupLessonEntrySection {...defaultProps} objectToRollUp={'Prep'} />
      </Provider>
    );

    expect(wrapper.find(Markdown).props().content).toBe(
      defaultProps.lesson.preparation
    );
  });

  it('resolves vocabulary references in the prep text', async () => {
    const lesson = {
      ...defaultProps.lesson,
      preparation: 'Print the [v digital_footprint/csd/2021] handout.',
      vocabularyDefinitions: {
        'digital_footprint/csd/2021': {
          word: 'digital footprint',
          definition: 'The collected information about an individual.',
        },
      },
    };
    const {getByText, findByRole} = render(
      <Provider store={getStore()}>
        <RollupLessonEntrySection
          {...defaultProps}
          lesson={lesson}
          objectToRollUp={'Prep'}
        />
      </Provider>
    );

    fireEvent.mouseOver(getByText('digital footprint'));
    expect((await findByRole('tooltip')).textContent).toBe(
      'The collected information about an individual.'
    );
  });

  it('renders no prep message when no prep', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Prep'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.text()).toContain(i18n.rollupNoPrep());
  });

  it('renders list of vocab when there is vocab', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Vocabulary'}
      />
    );

    expect(wrapper.text()).toContain('word');
    expect(wrapper.text()).toContain('definition');
  });

  it('renders no vocab message when no vocab', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Vocabulary'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.text()).toContain(i18n.rollupNoVocab());
  });

  it('renders list of code when there is code', () => {
    const wrapper = mount(
      <RollupLessonEntrySection {...defaultProps} objectToRollUp={'Code'} />
    );

    expect(wrapper.text()).toContain('playSound');
  });

  it('renders no code message when no code', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Code'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.text()).toContain(i18n.rollupNoCode());
  });

  it('renders list of standards when there are standards', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Standards'}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <LessonStandards standards={defaultProps.lesson.standards} />
      )
    ).toBe(true);
  });

  it('renders no standards message when no standards', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Standards'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.text()).toContain(i18n.rollupNoStandards());
  });
});
