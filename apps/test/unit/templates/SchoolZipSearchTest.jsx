import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import SchoolZipSearch from '@cdo/apps/templates/SchoolZipSearch';

const DEFAULT_PROPS = {
  fieldNames: {
    ncesSchoolId: 'ncesSchoolId',
    schoolName: 'schoolName',
  },
};

const fakeSchools = [
  {nces_id: 123456, name: 'First School'},
  {nces_id: 111111, name: 'Other School'},
  {nces_id: 987654, name: 'Duplicate School Name'},
  {nces_id: 876543, name: 'Duplicate School Name'},
  {nces_id: 999999, name: 'ABC Academy'},
];

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

describe('SchoolZipSearch', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    fetchStub.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify(fakeSchools)))
    );
  });

  afterEach(() => {
    fetchStub.mockRestore();
  });

  function renderDefault(propOverrides = {}) {
    render(<SchoolZipSearch {...DEFAULT_PROPS} {...propOverrides} />);
  }

  it('displays the school list sorted alphabetically', async () => {
    renderDefault();
    fireEvent.change(screen.getByRole('combobox'), {
      target: {value: 'selectASchool'},
    });
    await waitFor(() => {
      expect(
        arraysEqual(
          [...screen.queryAllByRole('option')].map(o => o.innerText),
          [
            'Select a school',
            'Not listed here - click to add',
            "I don't teach CS in a school setting",
            'ABC Academy',
            'Duplicate School Name',
            'Duplicate School Name',
            'First School',
            'Other School',
          ]
        )
      );
    });
  });
});
