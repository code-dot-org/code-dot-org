import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import WorkshopEnrollmentPreSurvey from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_enrollment_pre_survey';

describe('WorkshopEnrollmentPreSurvey', () => {
  const fakeWorkshopDate = 'October 4th';

  describe('getSortableUnitLessonShortName()', () => {
    let getSortableUnitLessonShortName;

    beforeAll(() => {
      getSortableUnitLessonShortName = shallow(
        <WorkshopEnrollmentPreSurvey
          enrollments={[]}
          workshopDate={fakeWorkshopDate}
        />
      ).instance().getSortableUnitLessonShortName;
    });

    it('correctly zero-pads the supplied unitLessonShortName', () => {
      expect(getSortableUnitLessonShortName('U1 L1')).toBe('U0001 L0001');
      expect(getSortableUnitLessonShortName('U2 L10')).toBe('U0002 L0010');
    });

    it("returns empty string if it can't parse the supplied string", () => {
      expect(getSortableUnitLessonShortName('unparseable')).toBe('');
    });
  });

  describe('With Data', () => {
    let userIndex = 0;
    let fakeEnrollments;
    let workshopEnrollmentPreSurvey;
    let tableRows;
    beforeAll(() => {
      const generateFakeEnrollment = survey => {
        userIndex++;
        return {
          first_name: `Teacher${userIndex}`,
          last_name: `LastName${userIndex}`,
          email: `teacher${userIndex}@ex.net`,
          district_name: 'A district',
          school: 'A school',
          user_id: userIndex,
          attended: true,
          pre_workshop_survey: survey,
        };
      };

      fakeEnrollments = [
        generateFakeEnrollment({
          unit: 'Unit 4 - the fourth unit',
          lesson: 'Lesson 3 - the third lesson',
          questionsAndTopics: 'so many questions',
          unitLessonShortName: 'U4 L3',
        }),
        generateFakeEnrollment({
          unit: 'Unit 1 - the first unit',
          lesson: 'Lesson 11 - the eleventh lesson',
          questionsAndTopics: 'another question',
          unitLessonShortName: 'U1 L11',
        }),
        generateFakeEnrollment({
          unit: 'Unit 1 - the first unit',
          lesson: 'Lesson 2 - the second lesson',
          questionsAndTopics: '',
          unitLessonShortName: 'U1 L2',
        }),
        generateFakeEnrollment({
          unit: 'Unit 1 - the first unit',
          lesson: 'Lesson 1 - the first lesson',
          questionsAndTopics: '',
          unitLessonShortName: 'U1 L1',
        }),
        generateFakeEnrollment({
          unit: 'Unit 4 - the fourth unit',
          lesson: 'Lesson 3 - the third lesson',
          questionsAndTopics: 'more questions...',
          unitLessonShortName: 'U4 L3',
        }),
        // one enrollment with no survey response.
        generateFakeEnrollment(null),
      ];

      workshopEnrollmentPreSurvey = shallow(
        <WorkshopEnrollmentPreSurvey
          enrollments={fakeEnrollments}
          workshopDate={fakeWorkshopDate}
        />
      );
      tableRows = workshopEnrollmentPreSurvey.find('Table tbody tr');
    });

    it('Has the expected table caption', () => {
      const tableCaption = workshopEnrollmentPreSurvey
        .find('Table caption')
        .text();
      const expectedCaption = `On the pre-survey, attendees indicate where they predict they will be in the curriculum on ${fakeWorkshopDate}.`;
      expect(tableCaption).toBe(expectedCaption);
    });

    it('Has the expected table column headers', () => {
      const columnHeaders = workshopEnrollmentPreSurvey
        .find('Table thead tr th')
        .map(h => h.text());
      expect(columnHeaders).toEqual([
        '#',
        'First Name',
        'Last Name',
        'Email',
        'Predicted Unit',
        'Predicted Lesson',
        'Questions and topics they hope to discuss',
      ]);
    });

    it('Displays one table row for each enrollment', () => {
      expect(tableRows).toHaveLength(6);
    });

    it('Displays survey responses', () => {
      const ROW_FULL_RESPONSE = 0;
      const responseCellText = tableRows
        .at(ROW_FULL_RESPONSE)
        .find('td')
        .map(td => td.text());
      expect(responseCellText).toEqual([
        `${ROW_FULL_RESPONSE + 1}`,
        fakeEnrollments[ROW_FULL_RESPONSE].first_name,
        fakeEnrollments[ROW_FULL_RESPONSE].last_name,
        fakeEnrollments[ROW_FULL_RESPONSE].email,
        'Unit 4 - the fourth unit',
        'Lesson 3 - the third lesson',
        'so many questions',
      ]);
    });

    it('Displays No response in the last column for responses without questions', () => {
      const ROW_NO_QUESTION = 2;
      const responseCellText = tableRows
        .at(ROW_NO_QUESTION)
        .find('td')
        .map(td => td.text());
      expect(responseCellText).toEqual([
        `${ROW_NO_QUESTION + 1}`,
        fakeEnrollments[ROW_NO_QUESTION].first_name,
        fakeEnrollments[ROW_NO_QUESTION].last_name,
        fakeEnrollments[ROW_NO_QUESTION].email,
        'Unit 1 - the first unit',
        'Lesson 2 - the second lesson',
        'No response',
      ]);
    });

    it('Displays No response for missing surveys', () => {
      const ROW_NO_RESPONSE = 5;
      const noResponseCellText = tableRows
        .at(ROW_NO_RESPONSE)
        .find('td')
        .map(td => td.text());
      expect(noResponseCellText).toEqual([
        `${ROW_NO_RESPONSE + 1}`,
        fakeEnrollments[5].first_name,
        fakeEnrollments[5].last_name,
        fakeEnrollments[5].email,
        'No response',
        'No response',
        'No response',
      ]);
    });

    describe('Histogram chart', () => {
      let chart;
      beforeAll(() => {
        chart = workshopEnrollmentPreSurvey.find('Chart');
      });

      it('Is a column chart', () => {
        expect(chart.props().chartType).toBe('ColumnChart');
      });

      it('Displays units and lessons in order', () => {
        expect(chart.props().data).toEqual([
          ['Unit and Lesson', '# of Attendees'],
          ['U1 L1', 1],
          ['U1 L2', 1],
          ['U1 L11', 1],
          ['U4 L3', 2],
        ]);
      });
    });
  });
});
