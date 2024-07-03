import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import TextResponsesLessonSelector from '@cdo/apps/templates/textResponses/TextResponsesLessonSelector';
import i18n from '@cdo/locale';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('TextResponsesLessonSelector', () => {
  describe('with less than 2 lessons', () => {
    const lessons = ['Lesson 1'];

    it('renders nothing', () => {
      const wrapper = shallow(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={() => {}}
        />
      );

      expect(wrapper.isEmptyRender()).to.be.true;
    });
  });

  describe('with 2 or more lessons', () => {
    const lessons = ['Lesson 1', 'Lesson 2'];

    it('renders a filter with expected options', () => {
      const wrapper = shallow(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={() => {}}
        />
      );

      const filterDropdown = wrapper.find('#uitest-lesson-filter');
      expect(filterDropdown.exists()).to.be.true;

      const filterOptions = filterDropdown.find('option');
      expect(filterOptions).to.have.length(3);
      expect(filterOptions.at(0)).to.have.text('All');
      expect(filterOptions.at(1)).to.have.text('Lesson 1');
      expect(filterOptions.at(2)).to.have.text('Lesson 2');
    });

    it('renders a filter by stage label', () => {
      const wrapper = shallow(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={() => {}}
        />
      );

      expect(wrapper.contains(i18n.filterByStage())).to.be.true;
    });

    it('calls prop onChangeFilter when a lesson is selected', () => {
      const onChangeFilterStub = sinon.stub();
      const wrapper = mount(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={onChangeFilterStub}
        />
      );

      const lesson1Option = wrapper.find('option').at(1);
      lesson1Option.simulate('change', {target: {value: 'Lesson 1'}});
      expect(onChangeFilterStub).to.have.been.calledWith('Lesson 1');
    });

    it('calls prop onChangeFilter with null if all is selected', () => {
      const onChangeFilterStub = sinon.stub();
      const wrapper = mount(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={onChangeFilterStub}
        />
      );

      const allLessonsOption = wrapper.find('option').at(0);
      allLessonsOption.simulate('change', {target: {value: i18n.all()}});
      expect(onChangeFilterStub).to.have.been.calledWith(null);
    });
  });
});
