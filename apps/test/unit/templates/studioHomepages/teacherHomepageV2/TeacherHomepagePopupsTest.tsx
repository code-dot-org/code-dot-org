import {act, render} from '@testing-library/react';
import React from 'react';

import TeacherHomepagePopups from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepagePopups';
import HttpClient from '@cdo/apps/util/HttpClient';

const mockDrawer = jest.fn();
jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepageDrawer',
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      mockDrawer(props);
      return <div role="region" aria-label="drawer" />;
    },
  })
);

describe('TeacherHomepagePopups', () => {
  const noDrawerData = {
    showSchoolInfoInterstitial: false,
    showSchoolInfoConfirmation: false,
    existingSchoolInfo: {},
    afeEligible: false,
    showNps: false,
    showDiversitySurvey: false,
  };

  const originalLocation = window.location;

  const setSearch = (search: string) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...originalLocation, search},
    });
  };

  const renderPopups = async (drawerData: Record<string, unknown> = {}) => {
    jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: {...noDrawerData, ...drawerData},
      response: new Response(),
    });
    const result = render(<TeacherHomepagePopups />);
    await act(async () => await new Promise(process.nextTick));
    return result;
  };

  beforeEach(() => {
    mockDrawer.mockClear();
    window.localStorage.clear();
    setSearch('');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    jest.restoreAllMocks();
  });

  it('renders no drawer when nothing is due', async () => {
    const {queryByRole} = await renderPopups();
    expect(queryByRole('region', {name: 'drawer'})).toBeNull();
  });

  it('opens the drawer on the survey when showDiversitySurvey is true', async () => {
    const {getByRole} = await renderPopups({showDiversitySurvey: true});
    getByRole('region', {name: 'drawer'});
    expect(mockDrawer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        diversityOpenInitially: true,
        afeOpenInitially: false,
        npsOpenInitially: false,
        schoolInfoInterstitialOpenInitially: false,
        schoolInfoConfirmationOpenInitially: false,
      })
    );
  });

  it('treats a response without showDiversitySurvey as not due', async () => {
    const legacyResponse: Record<string, unknown> = {...noDrawerData};
    delete legacyResponse.showDiversitySurvey;
    const {queryByRole} = await renderPopups(legacyResponse);
    expect(queryByRole('region', {name: 'drawer'})).toBeNull();
  });

  it('opens the survey from the showDiversitySurvey=true URL param', async () => {
    setSearch('?showDiversitySurvey=true');
    const {getByRole} = await renderPopups();
    getByRole('region', {name: 'drawer'});
    expect(mockDrawer).toHaveBeenLastCalledWith(
      expect.objectContaining({diversityOpenInitially: true})
    );
  });

  it('ignores showDiversitySurvey values other than "true"', async () => {
    setSearch('?showDiversitySurvey=false');
    const {queryByRole} = await renderPopups();
    expect(queryByRole('region', {name: 'drawer'})).toBeNull();
  });

  it('shows the survey even if a drawer was seen in the last day when the URL param is set', async () => {
    window.localStorage.setItem(
      'teacher-homepage-popup-last-seen',
      new Date().toISOString()
    );
    setSearch('?showDiversitySurvey=true');
    const {getByRole} = await renderPopups();
    getByRole('region', {name: 'drawer'});
  });

  it('suppresses the survey if a drawer was seen in the last day', async () => {
    window.localStorage.setItem(
      'teacher-homepage-popup-last-seen',
      new Date().toISOString()
    );
    const {queryByRole} = await renderPopups({showDiversitySurvey: true});
    expect(queryByRole('region', {name: 'drawer'})).toBeNull();
  });
});
