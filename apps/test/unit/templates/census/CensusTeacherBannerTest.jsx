import '@testing-library/jest-dom';
import {act, render, screen} from '@testing-library/react';
import React from 'react';

import CensusTeacherBanner from '@cdo/apps/templates/census/CensusTeacherBanner';

jest.mock('@cdo/apps/schoolInfo/utils/fetchSchools');

describe('CensusTeacherBannerTest', () => {
  const defaultExistingSchoolInfo = {
    id: 'ABCDEF123',
    country: 'US',
    name: 'Test School',
    zip: '12345',
  };

  const defaultProps = {
    onDismiss: jest.fn(),
    onPostpone: jest.fn(),
    onTeachesChange: jest.fn(),
    onInClassChange: jest.fn(),
    existingSchoolInfo: defaultExistingSchoolInfo,

    question: 'how_many_20_hours',
    teaches: true,
    inClass: true,
    teacherName: 'Test Teacher',
    teacherEmail: 'test@test.com',
    onSubmitSuccess: jest.fn(),
    schoolYear: 2024,
  };

  beforeEach(() => {
    //jest.clearAllMocks();
    //window.fetch = jest.fn();
  });

  function renderDefault(propOverrides = {}) {
    render(<CensusTeacherBanner {...defaultProps} {...propOverrides} />);
  }

  it('displays the school name and census question by default', async () => {
    renderDefault();
    //screen.debug();
    await screen.findByText('Add Test School to our map!');

    await screen.findByText(
      'It looks like you teach computer science. Have your students already done 20 hours of programming content this year (not including HTML/CSS)?'
    );
  });

  it('shows school update form when update is clicked', async () => {
    renderDefault();
    act(() => {
      screen.getByText('Update here').click();
    });
    await screen.findByText('Tell us about your school');
  });

  it('returns to census question when school update flow is dismissed', async () => {
    renderDefault();
    act(() => {
      screen.getByText('Update here').click();
    });
    await screen.findByText('Tell us about your school');

    act(() => {
      screen.getByText('Dismiss').click();
    });
    await screen.findByText('Add Test School to our map!');
  });

  it('renders thank you after submitting census question', async () => {
    renderDefault();

    const ajaxStub = jest
      .spyOn($, 'ajax')
      .mockClear()
      .mockReturnValue({
        done: successCallback => {
          successCallback();
          return {fail: () => {}};
        },
      });

    act(() => {
      //screen.getByRole('radio', {value: 'SOME'}).click();
      //screen.getByRole('radio', {value: 'inclass'}).click();
      screen.getByLabelText("Yes, we've done 20 hours.").click();
      screen.getByLabelText('In a classroom').click();
      screen.getByText('Add my school to the map!').click();
    });
    await screen.findByText('Thanks for adding your school to the map!');
    ajaxStub.mockRestore();
  });
});
