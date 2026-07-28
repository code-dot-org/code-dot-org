import '@testing-library/jest-dom';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import * as utils from '@cdo/apps/code-studio/utils';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import * as windowUtils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {defaultRedirectUrl: '/home'};

const renderContainer = (props = {}) =>
  render(
    <Provider store={getStore()}>
      <SectionsSetUpContainer {...DEFAULT_PROPS} {...props} />
    </Provider>
  );

// Resolved mock response — json() must return a Promise for the fetch chain to work.
const mockFetchResponse = () =>
  Promise.resolve({ok: true, json: () => Promise.resolve({})});

describe('SectionsSetUpContainer', () => {
  let fetchSpy;

  beforeEach(() => {
    // Notification (used in CAP notice) is connected to Redux and reads state.isRtl.
    stubRedux();
    registerReducers({isRtl});
    // CurriculumQuickAssign fetches course offerings on mount; mock to prevent failures.
    fetchSpy = jest
      .spyOn(window, 'fetch')
      .mockImplementation(mockFetchResponse);
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  it('renders an initial set up section form', () => {
    renderContainer();
    screen.getByText(i18n.classSection());
  });

  it('renders avatar edit button', () => {
    renderContainer();
    screen.getByText(i18n.editAvatar());
  });

  it('renders Finish creating sections button for new section', () => {
    renderContainer();
    screen.getByText(i18n.finishCreatingSections());
  });

  it('renders Save button when editing an existing section', () => {
    renderContainer({sectionToBeEdited: {}});
    screen.getByText(i18n.save());
    expect(
      screen.queryByText(i18n.finishCreatingSections())
    ).not.toBeInTheDocument();
  });

  it('renders curriculum quick assign', () => {
    renderContainer();
    screen.getByText(i18n.decideLater());
  });

  it('renders Child Account Policy Notice for US, student, and email sections', () => {
    jest.spyOn(utils, 'queryParams').mockImplementation(param => {
      if (param === 'loginType') return 'email';
      if (param === 'participantType') return 'student';
      return null;
    });

    renderContainer({userCountry: 'US'});
    screen.getByText(i18n.childAccountPolicy_LearnMore());
  });

  it('does not render Child Account Policy Notice when section login is not email', () => {
    jest.spyOn(utils, 'queryParams').mockImplementation(param => {
      if (param === 'loginType') return 'word';
      if (param === 'participantType') return 'student';
      return null;
    });

    renderContainer({userCountry: 'US'});
    expect(
      screen.queryByText(i18n.childAccountPolicy_LearnMore())
    ).not.toBeInTheDocument();
  });

  it('does not render Child Account Policy Notice for non-US country', () => {
    jest.spyOn(utils, 'queryParams').mockImplementation(param => {
      if (param === 'loginType') return 'email';
      if (param === 'participantType') return 'student';
      return null;
    });

    renderContainer({userCountry: 'ES'});
    expect(
      screen.queryByText(i18n.childAccountPolicy_LearnMore())
    ).not.toBeInTheDocument();
  });

  it('renders coteacher section', () => {
    renderContainer();
    screen.getByText(i18n.coteacherAdd());
  });

  it('shows coteacher settings when Add Co-Teachers is clicked', () => {
    renderContainer();
    expect(screen.queryByText(i18n.coteacherLabel())).not.toBeInTheDocument();

    fireEvent.click(document.getElementById('uitest-expandable-coteacher'));

    screen.getByText(i18n.coteacherLabel());
  });

  it('shows advanced settings when Advanced Settings is clicked', () => {
    renderContainer();
    expect(screen.queryByText(i18n.pairProgramming())).not.toBeInTheDocument();

    fireEvent.click(document.getElementById('uitest-expandable-settings'));

    screen.getByText(i18n.pairProgramming());
  });

  it('hides advanced settings when Advanced Settings is clicked again', () => {
    renderContainer();

    fireEvent.click(document.getElementById('uitest-expandable-settings'));
    screen.getByText(i18n.pairProgramming());

    fireEvent.click(document.getElementById('uitest-expandable-settings'));
    expect(screen.queryByText(i18n.pairProgramming())).not.toBeInTheDocument();
  });

  it('reports form validity when save is clicked with invalid form', () => {
    jest
      .spyOn(HTMLFormElement.prototype, 'checkValidity')
      .mockReturnValue(false);
    const reportSpy = jest
      .spyOn(HTMLFormElement.prototype, 'reportValidity')
      .mockImplementation(() => {});

    renderContainer();
    fireEvent.click(screen.getByText(i18n.finishCreatingSections()));

    expect(reportSpy).toHaveBeenCalledTimes(1);
  });

  it('makes an ajax request when save is clicked with valid form', async () => {
    jest
      .spyOn(HTMLFormElement.prototype, 'checkValidity')
      .mockReturnValue(true);
    const navigateSpy = jest
      .spyOn(windowUtils, 'navigateToHref')
      .mockImplementation(() => {});

    renderContainer();
    fetchSpy.mockClear(); // clear CurriculumQuickAssign's mount fetch
    fireEvent.click(screen.getByText(i18n.finishCreatingSections()));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(1));
    expect(navigateSpy.mock.calls[0][0]).toContain('/home');
  });

  it('appends showSectionCreationDialog to url if isUsersFirstSection is true', async () => {
    jest
      .spyOn(HTMLFormElement.prototype, 'checkValidity')
      .mockReturnValue(true);
    const navigateSpy = jest
      .spyOn(windowUtils, 'navigateToHref')
      .mockImplementation(() => {});

    renderContainer({isUsersFirstSection: true});
    fetchSpy.mockClear();
    fireEvent.click(screen.getByText(i18n.finishCreatingSections()));

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(1));
    expect(navigateSpy.mock.calls[0][0]).toContain(
      '/home?showSectionCreationDialog=true'
    );
  });

  it('passes participantType and loginType to ajax request when save is clicked', () => {
    jest.spyOn(utils, 'queryParams').mockImplementation(param => {
      if (param === 'loginType') return 'word';
      if (param === 'participantType') return 'student';
      return null;
    });
    jest
      .spyOn(HTMLFormElement.prototype, 'checkValidity')
      .mockReturnValue(true);

    renderContainer();
    fetchSpy.mockClear();
    fireEvent.click(screen.getByText(i18n.finishCreatingSections()));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const fetchBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(fetchBody.login_type).toBe('word');
    expect(fetchBody.participant_type).toBe('student');
  });

  it('makes a request when save and add another section is clicked', () => {
    jest
      .spyOn(HTMLFormElement.prototype, 'checkValidity')
      .mockReturnValue(true);

    renderContainer();
    fetchSpy.mockClear();
    fireEvent.click(screen.getByText(i18n.addAnotherClassSection()));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('redirects to defaultRedirectUrl after save', async () => {
    jest
      .spyOn(HTMLFormElement.prototype, 'checkValidity')
      .mockReturnValue(true);
    const navigateSpy = jest
      .spyOn(windowUtils, 'navigateToHref')
      .mockImplementation(() => {});

    renderContainer({defaultRedirectUrl: '/test_redirect_url'});
    fetchSpy.mockClear();
    fireEvent.click(screen.getByText(i18n.finishCreatingSections()));

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(1));
    expect(navigateSpy.mock.calls[0][0]).toContain('/test_redirect_url');
  });

  describe('grade pre-population from gradesTeaching', () => {
    beforeEach(() => {
      // Global beforeEach already stubbed Redux; just add currentUser reducer.
      registerReducers({currentUser});
      jest.spyOn(utils, 'queryParams').mockImplementation(param => {
        if (param === 'participantType') return 'student';
        return null;
      });
    });

    it('pre-selects grades from gradesTeaching when creating a new section', () => {
      getStore().dispatch(
        setInitialData({
          id: 1,
          grades_teaching: ['11', '12'],
          user_type: 'teacher',
        })
      );

      renderContainer();

      expect(screen.getByRole('checkbox', {name: '11'})).toBeChecked();
      expect(screen.getByRole('checkbox', {name: '12'})).toBeChecked();
      expect(screen.getByRole('checkbox', {name: 'K'})).not.toBeChecked();
    });

    it('initializes grades to empty array when gradesTeaching is empty', () => {
      getStore().dispatch(
        setInitialData({id: 1, grades_teaching: [], user_type: 'teacher'})
      );

      renderContainer();

      expect(screen.getByRole('checkbox', {name: '11'})).not.toBeChecked();
      expect(screen.getByRole('checkbox', {name: 'K'})).not.toBeChecked();
    });

    it('does not override grades when editing an existing section', () => {
      getStore().dispatch(
        setInitialData({
          id: 1,
          grades_teaching: ['11', '12'],
          user_type: 'teacher',
        })
      );
      const existingSection = {
        grades: ['K', '1'],
        name: 'My Class',
        participantType: 'student',
      };

      renderContainer({sectionToBeEdited: existingSection});

      expect(screen.getByRole('checkbox', {name: 'K'})).toBeChecked();
      expect(screen.getByRole('checkbox', {name: '1'})).toBeChecked();
      expect(screen.getByRole('checkbox', {name: '11'})).not.toBeChecked();
    });

    it('applies gradesTeaching when Redux is populated after initial render', async () => {
      // Render before gradesTeaching data has arrived (store starts empty).
      renderContainer();
      expect(screen.getByRole('checkbox', {name: '11'})).not.toBeChecked();
      expect(screen.getByRole('checkbox', {name: '12'})).not.toBeChecked();

      // Simulate async /api/v1/users/current response landing.
      await act(async () => {
        getStore().dispatch(
          setInitialData({
            id: 1,
            grades_teaching: ['11', '12'],
            user_type: 'teacher',
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByRole('checkbox', {name: '11'})).toBeChecked();
        expect(screen.getByRole('checkbox', {name: '12'})).toBeChecked();
        expect(screen.getByRole('checkbox', {name: 'K'})).not.toBeChecked();
      });
    });

    it('does not overwrite grades the user changed before gradesTeaching arrived', async () => {
      // Render before gradesTeaching data has arrived.
      renderContainer();

      // User explicitly selects grade '5'.
      fireEvent.click(screen.getByRole('checkbox', {name: '5'}));
      expect(screen.getByRole('checkbox', {name: '5'})).toBeChecked();

      // gradesTeaching data arrives with different grades.
      await act(async () => {
        getStore().dispatch(
          setInitialData({
            id: 1,
            grades_teaching: ['11', '12'],
            user_type: 'teacher',
          })
        );
      });

      // User's selection is preserved; gradesTeaching is not applied.
      await waitFor(() => {
        expect(screen.getByRole('checkbox', {name: '5'})).toBeChecked();
        expect(screen.getByRole('checkbox', {name: '11'})).not.toBeChecked();
        expect(screen.getByRole('checkbox', {name: '12'})).not.toBeChecked();
      });
    });
  });
});
