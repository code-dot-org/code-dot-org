import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  rubric: {
    keyConcept: 'This is the Key Concept',
    performanceLevel1: 'exceeded expectations',
    performanceLevel2: 'met expectations',
    performanceLevel3: 'approaches expectations',
    performanceLevel4: 'no evidence of trying',
  },
  performance: null,
  isEditable: true,
  onRubricChange: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<Rubric {...props} />);
};

describe('Rubric', () => {
  it('displays key concept', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.rubricKeyConceptHeader())).toBe(true);
    expect(wrapper.contains('This is the Key Concept')).toBe(true);
  });

  it('displays rubric header', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.rubric())).toBe(true);
  });

  it('has 4 rubric fields', () => {
    const wrapper = setUp();
    expect(wrapper.find('RubricField')).toHaveLength(4);
  });

  it('RubricField prop rubricLevel gets the correct value', () => {
    const wrapper = setUp();

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().rubricLevel).toBe('performanceLevel1');

    const secondRubricField = wrapper.find('RubricField').at(1);
    expect(secondRubricField.props().rubricLevel).toBe('performanceLevel2');
  });

  it('RubricField prop rubricValue gets the correct value', () => {
    const wrapper = setUp();

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().rubricValue).toBe('exceeded expectations');

    const secondRubricField = wrapper.find('RubricField').at(1);
    expect(secondRubricField.props().rubricValue).toBe('met expectations');
  });

  it('does not check any RubricFields if there is no performance value', () => {
    const wrapper = setUp();
    const rubricFields = wrapper.find('RubricField');

    rubricFields.forEach(node => {
      expect(node.props().currentlyChecked).toBe(false);
    });
  });

  it('checks a RubricField if it matches the performance value', () => {
    const wrapper = setUp({performance: 'performanceLevel1'});
    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().currentlyChecked).toBe(true);
  });

  it('RubricField prop showFeedbackInputAreas is true if isEditable = true', () => {
    const wrapper = setUp({
      isEditable: true,
    });

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().showFeedbackInputAreas).toBe(true);
  });

  it('RubricField prop showFeedbackInputAreas is false if isEditable = false and there is no performance', () => {
    const wrapper = setUp({
      isEditable: false,
    });

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().showFeedbackInputAreas).toBe(false);
  });

  it('RubricField prop expandByDefault is false if isEditable = true and no performance', () => {
    const wrapper = setUp({
      isEditable: true,
    });

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().expandByDefault).toBe(false);
  });

  it('RubricField prop expandByDefault is true if isEditable = false', () => {
    const wrapper = setUp({
      isEditable: false,
    });

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().expandByDefault).toBe(true);
  });

  it('expands rubric value with feedback', () => {
    const wrapper = setUp({
      isEditable: false,
      performance: 'performanceLevel2',
    });

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().expandByDefault).toBe(false);

    const secondRubricField = wrapper.find('RubricField').at(1);
    expect(secondRubricField.props().expandByDefault).toBe(true);
  });
});
