import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import SchoolZipSearch from '@cdo/apps/templates/SchoolZipSearch';

import {expect} from '../../util/deprecatedChai';
import {allowConsoleWarnings} from '../../util/throwOnConsole';

const DEFAULT_PROPS = {
  fieldNames: {
    ncesSchoolId: 'ncesSchoolId',
    schoolName: 'schoolName',
  },
  zip: '10024',
};

const fakeSchools = [
  {nces_id: 123456, name: 'First School'},
  {nces_id: 111111, name: 'Other School'},
  {nces_id: 987654, name: 'Duplicate School Name'},
  {nces_id: 876543, name: 'Duplicate School Name'},
  {nces_id: 999999, name: 'ABC Academy'},
];

describe('SchoolDataInputs', () => {
  allowConsoleWarnings();

  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.returns(
      Promise.resolve(new Response(JSON.stringify(fakeSchools)))
    );
  });

  afterEach(() => {
    fetchStub.restore();
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
        [...screen.queryAllByRole('option')].map(o => o.innerText)
      ).to.equal([
        'Select a school',
        'Not listed here - click to add',
        "I don't teach CS in a school setting",
        'ABC Academy',
        'Duplicate School Name',
        'Duplicate School Name',
        'First School',
        'Other School',
      ]);
    });
  });
});
