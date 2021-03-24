import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import RollupLessonEntrySection from '@cdo/apps/templates/courseRollupPages/RollupLessonEntrySection';
import {courseData} from './rollupTestData';
import i18n from '@cdo/locale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import {Provider} from 'react-redux/src';
import {getStore} from '@cdo/apps/redux';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';

describe('RollupLessonEntrySection', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Resources',
      lesson: courseData.units[0].lessons[0]
    };
  });

  it('renders list of resources when there are resources', () => {
    const wrapper = mount(<RollupLessonEntrySection {...defaultProps} />);

    expect(wrapper.find('ResourceList').length).to.equal(2);
  });

  it('renders no resources message when no resources', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.containsMatchingElement(<p>{i18n.rollupNoResources()}</p>))
      .to.be.true;
  });

  it('renders list of prep when there is prep', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <RollupLessonEntrySection {...defaultProps} objectToRollUp={'Prep'} />
      </Provider>
    );

    expect(
      wrapper.containsMatchingElement(
        <EnhancedSafeMarkdown
          markdown={defaultProps.lesson.preparation}
          expandableImages
        />
      )
    ).to.be.true;
  });

  it('renders no prep message when no prep', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Prep'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.containsMatchingElement(<p>{i18n.rollupNoPrep()}</p>)).to.be
      .true;
  });

  it('renders list of vocab when there is vocab', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Vocabulary'}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <li key={defaultProps.lesson.vocabularies[0].key}>
          <InlineMarkdown
            markdown={`**${defaultProps.lesson.vocabularies[0].word}** - ${
              defaultProps.lesson.vocabularies[0].definition
            }`}
          />
        </li>
      )
    ).to.be.true;
  });

  it('renders no vocab message when no vocab', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Vocabulary'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.containsMatchingElement(<p>{i18n.rollupNoVocab()}</p>)).to.be
      .true;
  });

  it('renders list of code when there is code', () => {
    const wrapper = mount(
      <RollupLessonEntrySection {...defaultProps} objectToRollUp={'Code'} />
    );

    expect(
      wrapper.containsMatchingElement(
        <li key={defaultProps.lesson.programmingExpressions[0].name}>
          <a
            href={studio(defaultProps.lesson.programmingExpressions[0].link)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {defaultProps.lesson.programmingExpressions[0].name}
          </a>
        </li>
      )
    ).to.be.true;
  });

  it('renders no code message when no code', () => {
    const wrapper = mount(
      <RollupLessonEntrySection
        {...defaultProps}
        objectToRollUp={'Code'}
        lesson={courseData.units[1].lessons[0]}
      />
    );

    expect(wrapper.containsMatchingElement(<p>{i18n.rollupNoCode()}</p>)).to.be
      .true;
  });
});
