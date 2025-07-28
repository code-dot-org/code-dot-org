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

  let sendEventSpy: jest.SpyInstance;
  let schoolInfoSpy: jest.SpyInstance;
  let updateSchoolInfoSpy: jest.SpyInstance;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    stubRedux();
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    updateSchoolInfoSpy = jest
      .spyOn(schoolInfoFunc, 'updateSchoolInfo')
      .mockImplementation(jest.fn());
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
    schoolInfoSpy = jest.spyOn(useSchoolInfoModule, 'useSchoolInfo');
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  function renderComponent() {
    const store = getStore();
    registerReducers({currentUser});
    store.dispatch(setInitialData({id: 1, country_code: 'US'}));
    return render(
      <Provider store={store}>
        <TeacherHomepageDrawer />
      </Provider>
    );
  }

  function fetchSpySetup(
    showInterstitial: boolean,
    showConfirmation: boolean,
    existingSchoolInfo: SchoolInfo
  ) {
    fetchSpy.mockImplementation((url: string) => {
      return Promise.resolve({
        value: {
          showSchoolInfoInterstitial: showInterstitial,
          showSchoolInfoConfirmation: showConfirmation,
          existingSchoolInfo: existingSchoolInfo,
        },
        response: new Response(),
      });
    });
  }

  it('renders the correct title, subtitle, and school data inputs when showSchoolInfoInterstitial is true', async () => {
    fetchSpySetup(true, false, schoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.censusHeading());
    screen.getByText(i18n.schoolInfoInterstitialTitle());
    screen.getByLabelText(i18n.whatCountry());
  });

  it('sends analytics event when the secondary button is clicked', async () => {
    fetchSpySetup(true, false, schoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    const secondaryButton = screen.getByText(i18n.dismiss());
    await act(async () => await fireEvent.click(secondaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
  });

  it('sends analytics event and calls updateSchoolInfo when the school data entry submit button is clicked', async () => {
    fetchSpySetup(true, false, schoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.save());
    await act(async () => await fireEvent.click(primaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
    expect(updateSchoolInfoSpy).toHaveBeenCalled();
  });

  it('displays success message after school data entry submit button is clicked', async () => {
    fetchSpySetup(true, false, schoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.save());
    await act(async () => await fireEvent.click(primaryButton));
    await act(async () => await new Promise(process.nextTick));
    screen.getByText(i18n.thankYouForUpdatingYourSchool());
  });

  it('renders the correct title and subtitle when showSchoolInfoConfirmation is true', async () => {
    fetchSpySetup(false, true, schoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    const schoolName = 'School One';
    renderComponent();
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
    fetchSpySetup(false, true, customSchoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfoCustomSchool);
    const schoolName = 'Test School';
    renderComponent();
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
    fetchSpySetup(false, true, schoolInfo);
    schoolInfoSpy.mockReturnValue(mockSchoolInfo);
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    const primaryButton = screen.getByText(i18n.imAtaNewSchool());
    await act(async () => await fireEvent.click(primaryButton));
    expect(sendEventSpy).toHaveBeenCalled();
    screen.getByLabelText(i18n.whatCountry());
  });
});
