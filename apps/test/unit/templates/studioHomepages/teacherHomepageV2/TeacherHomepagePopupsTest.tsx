import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import * as useSchoolInfoModule from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import TeacherHomepagePopups from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepagePopups';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const NPS_CONFIGURATION_URL = '/form/nps_survey/configuration';

describe('TeacherHomepagePopups', () => {
  const drawerData = {
    showSchoolInfoInterstitial: false,
    showSchoolInfoConfirmation: false,
    existingSchoolInfo: {country: 'US', school_name: 'School One'},
    afeEligible: false,
    showNps: false,
  };

  const npsProps = JSON.stringify({
    formQuestions: {pages: []},
    formName: 'surveys/teachers/nps_survey',
    formVersion: 1,
    surveyData: null,
    submitApi: '/dashboardapi/v1/foorm/simple_survey_submission',
    submitParams: {simple_survey_form_id: 1, user_id: 8},
  });

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    stubRedux();
    jest.spyOn(useSchoolInfoModule, 'useSchoolInfo').mockReturnValue({
      schoolId: '',
      country: 'US',
      schoolName: '',
      schoolZip: '',
      schoolsList: [],
      schoolsLoading: false,
      usIp: true,
      setSchoolId: jest.fn(),
      setCountry: jest.fn(),
      setSchoolName: jest.fn(),
      setSchoolZip: jest.fn(),
      reset: jest.fn(),
    });
    fetchSpy = jest
      .spyOn(HttpClient, 'fetchJson')
      .mockImplementation((url: string) =>
        Promise.resolve({
          value: url === NPS_CONFIGURATION_URL ? {props: npsProps} : drawerData,
          response: new Response(),
        })
      );
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
    restoreRedux();
    jest.restoreAllMocks();
  });

  async function renderPopups() {
    const store = getStore();
    registerReducers({currentUser});
    store.dispatch(setInitialData({id: 1, country_code: 'US'}));
    render(
      <Provider store={store}>
        <TeacherHomepagePopups />
      </Provider>
    );
    await act(async () => await new Promise(process.nextTick));
    await act(async () => await new Promise(process.nextTick));
  }

  function npsConfigurationFetched() {
    return fetchSpy.mock.calls.some(([url]) => url === NPS_CONFIGURATION_URL);
  }

  it('does not load the NPS survey for a teacher outside its audience', async () => {
    await renderPopups();

    expect(npsConfigurationFetched()).toBe(false);
    expect(screen.queryByText(i18n.helpUsImprove())).toBeNull();
  });

  it('loads the NPS survey outside its audience when showNPS=true', async () => {
    window.history.pushState({}, '', '/home?showNPS=true');
    await renderPopups();

    expect(npsConfigurationFetched()).toBe(true);
    screen.getByText(i18n.helpUsImprove());
  });
});
