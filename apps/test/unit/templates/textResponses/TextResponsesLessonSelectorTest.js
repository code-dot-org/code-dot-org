import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import TextResponsesLessonSelector from '@cdo/apps/templates/textResponses/TextResponsesLessonSelector';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('TextResponsesLessonSelector', () => {
  describe('with less than 2 lessons', () => {
    const lessons = ['Lesson 1'];

    it('renders nothing', () => {
      const {container} = render(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={() => {}}
        />
      );

      expect(container.firstChild).to.be.null;
    });
  });

  describe('with 2 or more lessons', () => {
    const lessons = ['Lesson 1', 'Lesson 2'];

    it('renders a filter with expected options', () => {
      render(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={() => {}}
        />
      );

      const select = document.getElementById('uitest-lesson-filter');
      expect(select).to.exist;
      const options = select.querySelectorAll('option');
      expect(options).to.have.length(3);
      expect(options[0].textContent).to.equal(i18n.all());
      expect(options[1].textContent).to.equal('Lesson 1');
      expect(options[2].textContent).to.equal('Lesson 2');
    });

    it('renders a filter by stage label', () => {
      render(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={() => {}}
        />
      );

      expect(screen.getByText(i18n.filterByStage())).to.exist;
    });

    it('calls prop onChangeFilter when a lesson is selected', () => {
      const onChangeFilterStub = sinon.stub();
      render(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={onChangeFilterStub}
        />
      );

      fireEvent.change(document.getElementById('uitest-lesson-filter'), {
        target: {value: 'Lesson 1'},
      });
      expect(onChangeFilterStub).to.have.been.calledWith('Lesson 1');
    });

    it('calls prop onChangeFilter with null if all is selected', () => {
      const onChangeFilterStub = sinon.stub();
      render(
        <TextResponsesLessonSelector
          lessons={lessons}
          onChangeFilter={onChangeFilterStub}
        />
      );

      fireEvent.change(document.getElementById('uitest-lesson-filter'), {
        target: {value: i18n.all()},
      });
      expect(onChangeFilterStub).to.have.been.calledWith(null);
    });
  });
});
