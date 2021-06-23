import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  rubric: {
    keyConcept: 'This is the Key Concept',
    performanceLevel1: 'exceeded expectations',
    performanceLevel2: 'met expectations',
    performanceLevel3: 'approaches expectations',
    performanceLevel4: 'no evidence of trying'
  },
  performance: null,
  isEditable: true,
  onRubricChange: () => {},
  viewAs: ViewType.Teacher
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<Rubric {...props} />);
};

describe('Rubric', () => {
  it('displays key concept', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.rubricKeyConceptHeader())).to.equal(true);
    expect(wrapper.contains('This is the Key Concept')).to.equal(true);
  });

  it('displays rubric header', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.rubric())).to.equal(true);
  });

  it('has 4 rubric fields', () => {
    const wrapper = setUp();
    expect(wrapper.find('RubricField')).to.have.lengthOf(4);
  });

  it('RubricField prop rubricLevel gets the correct value', () => {
    const wrapper = setUp();

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().rubricLevel).to.equal('performanceLevel1');

    const secondRubricField = wrapper.find('RubricField').at(1);
    expect(secondRubricField.props().rubricLevel).to.equal('performanceLevel2');
  });

  it('RubricField prop rubricValue gets the correct value', () => {
    const wrapper = setUp();

    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().rubricValue).to.equal(
      'exceeded expectations'
    );

    const secondRubricField = wrapper.find('RubricField').at(1);
    expect(secondRubricField.props().rubricValue).to.equal('met expectations');
  });

  it('does not check any RubricFields if there is no performance value', () => {
    const wrapper = setUp();
    const rubricFields = wrapper.find('RubricField');

    rubricFields.forEach(node => {
      expect(node.props().currentlyChecked).to.equal(false);
    });
  });

  it('checks a RubricField if it matches the performance value', () => {
    const wrapper = setUp({performance: 'performanceLevel1'});
    const firstRubricField = wrapper.find('RubricField').first();
    expect(firstRubricField.props().currentlyChecked).to.be.true;
  });

  describe('view as teacher', () => {
    it('RubricField prop showFeedbackInputAreas is true if isEditable = true', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        isEditable: true
      });

      const firstRubricField = wrapper.find('RubricField').first();
      expect(firstRubricField.props().showFeedbackInputAreas).to.be.true;
    });

    it('RubricField prop showFeedbackInputAreas is false if isEditable = false', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        isEditable: false
      });

      const firstRubricField = wrapper.find('RubricField').first();
      expect(firstRubricField.props().showFeedbackInputAreas).to.be.false;
    });

    it('RubricField prop expandByDefault is false isEditable = true', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        isEditable: true
      });

      const firstRubricField = wrapper.find('RubricField').first();
      expect(firstRubricField.props().expandByDefault).to.be.false;
    });

    it('RubricField prop expandByDefault is true isEditable = false', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        isEditable: false
      });

      const firstRubricField = wrapper.find('RubricField').first();
      expect(firstRubricField.props().expandByDefault).to.be.true;
    });
  });

  describe('view as student', () => {
    it('expands rubric value with feedback', () => {
      const wrapper = setUp({
        viewAs: ViewType.Student,
        isEditable: false,
        performance: 'performanceLevel2'
      });

      const firstRubricField = wrapper.find('RubricField').first();
      expect(firstRubricField.props().expandByDefault).to.be.false;

      const secondRubricField = wrapper.find('RubricField').at(1);
      expect(secondRubricField.props().expandByDefault).to.be.true;
    });
  });
});
