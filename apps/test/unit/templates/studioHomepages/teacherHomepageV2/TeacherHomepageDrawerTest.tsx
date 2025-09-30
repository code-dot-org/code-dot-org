import {
  fireEvent,
  render,
  screen,
  act,
  getDefaultNormalizer,
} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import * as useSchoolInfoModule from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import * as schoolInfoFunc from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {SchoolInfo} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepageConstants';
import TeacherHomepageDrawer from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepageDrawer';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

describe('TeacherHomepageDrawer', () => {
  const schoolInfo: SchoolInfo = {
    country: 'US',
    school_name: 'School One',
    school_zip: '12345',
    school_id: '1',
    school_type: 'public',
  };

  const mockSchoolInfo = {
    schoolId: '1',
    country: 'US',
    schoolName: '',
    schoolZip: '12345',
    schoolsList: [
      {value: '1', text: 'School One'},
      {value: '2', text: 'School Two'},
    ],
    schoolsLoading: false,
    usIp: true,
    setSchoolId: jest.fn(),
    setCountry: jest.fn(),
    setSchoolName: jest.fn(),
    setSchoolZip: jest.fn(),
    reset: jest.fn(),
  };

  const customSchoolInfo: SchoolInfo = {
    country: 'US',
    school_name: 'Test School',
    school_zip: '12345',
    school_type: undefined,
  };

  const mockSchoolInfoCustomSchool = {
    schoolId: '',
    country: 'US',
    schoolName: 'Test School',
    schoolZip: '12345',
    schoolsList: [
      {value: '1', text: 'School One'},
      {value: '2', text: 'School Two'},
    ],
    schoolsLoading: false,
    usIp: true,
    setSchoolId: jest.fn(),
    setCountry: jest.fn(),
    setSchoolName: jest.fn(),
    setSchoolZip: jest.fn(),
    reset: jest.fn(),
  };

  const mockResult = {
    props: JSON.stringify({
      formQuestions: {},
      formName: 'name',
      formVersion: 0,
      submitApi: 'url',
    }),
  };

  let sendEventSpy: jest.SpyInstance;
  let schoolInfoSpy: jest.SpyInstance;
  let updateSchoolInfoSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    stubRedux();
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    updateSchoolInfoSpy = jest
      .spyOn(schoolInfoFunc, 'updateSchoolInfo')
      .mockImplementation(jest.fn());
    schoolInfoSpy = jest.spyOn(useSchoolInfoModule, 'useSchoolInfo');
    postSpy = jest.spyOn(HttpClient, 'post');
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
    fetchSpy.mockImplementation((url: string) => {
      return Promise.resolve({value: mockResult, response: new Response()});
    });
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  function renderComponent(
    showInterstitial: boolean,
    showConfirmation: boolean,
    showAFE: boolean,
    showNPS: boolean,
    existingSchoolInfo: SchoolInfo
  ) {
    const store = getStore();
    registerReducers({currentUser});
    store.dispatch(setInitialData({id: 1, country_code: 'US'}));
    return render(
      <Provider store={store}>
        <TeacherHomepageDrawer
          existingSchoolInfo={existingSchoolInfo}
          schoolInfoConfirmationOpenInitially={showConfirmation}
          schoolInfoInterstitialOpenInitially={showInterstitial}
          afeOpenInitially={showAFE}
          npsOpenInitially={showNPS}
          npsProps={''}
          onCloseCallback={() => {}}
        />
      </Provider>
    );
  }

  it('renders the correct title, subtitle, and school data inputs when showSchoolInfoInterstitial is true', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(true, false, false, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.censusHeading());
    screen.getByText(i18n.schoolInfoInterstitialTitle());
    screen.getByLabelText(i18n.whatCountry());
  });

  it('sends analytics event when the secondary button is clicked', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(true, false, false, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    const secondaryButton = screen.getByText(i18n.dismiss());
    await act(async () => await fireEvent.click(secondaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
  });

  it('sends analytics event and calls updateSchoolInfo when the school data entry submit button is clicked', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(true, false, false, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.save());
    await act(async () => await fireEvent.click(primaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
    expect(updateSchoolInfoSpy).toHaveBeenCalled();
  });

  it('displays success message after school data entry submit button is clicked', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(true, false, false, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.save());
    await act(async () => await fireEvent.click(primaryButton));
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.thankYouForUpdatingYourSchool());
  });

  it('renders the correct title and subtitle when showSchoolInfoConfirmation is true', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    const schoolName = 'School One';
    renderComponent(false, true, false, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.reviewSchoolInfo());
    screen.getByText(
      `${i18n.schoolInfoDialogDescription()}${i18n.schoolInfoDialogDescriptionSchoolName(
        {schoolName}
      )}`,
      {
        exact: true,
        normalizer: getDefaultNormalizer({collapseWhitespace: false}),
      }
    );
  });

  it('displays a custom school name on the confirmation first page when the teacher has entered one', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfoCustomSchool);
    const schoolName = 'Test School';
    renderComponent(false, true, false, false, customSchoolInfo);
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.reviewSchoolInfo());
    screen.getByText(
      `${i18n.schoolInfoDialogDescription()}${i18n.schoolInfoDialogDescriptionSchoolName(
        {schoolName}
      )}`,
      {
        exact: true,
        normalizer: getDefaultNormalizer({collapseWhitespace: false}),
      }
    );
  });

  it('sends analytics event and displays the school data inputs after clicking the primary button when showSchoolInfoConfirmation is true', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(false, true, false, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.imAtaNewSchool());
    await act(async () => await fireEvent.click(primaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
    screen.getByLabelText(i18n.whatCountry());
  });

  it('renders the correct title and subtitle when AFEDrawerOpen is true', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(false, false, true, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.afeDrawerHeader());
    screen.getByText(i18n.afeBannerParagraph());
  });

  it('sends analytics event and posts to database when primary button is clicked and AFEDrawerOpen is true', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(false, false, true, false, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.learnMore());
    await act(async () => await fireEvent.click(primaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalled();
  });

  it('renders Foorm when NpsOpen is true', async () => {
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent(false, false, false, true, schoolInfo);
    await act(async () => await new Promise(process.nextTick));
    expect(fetchSpy).toHaveBeenCalled();
    screen.getByText('There is no visible page or question in the survey.');
  });
});
