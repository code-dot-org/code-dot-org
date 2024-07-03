import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import * as lessonLockDataApi from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import {UnconnectedLessonLockDialog as LessonLockDialog} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDialog';
import StudentRow from '@cdo/apps/code-studio/components/progress/lessonLockDialog/StudentRow';
import {LockStatus} from '@cdo/apps/code-studio/lessonLockRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';



const fakeSectionId = 42;
const fakeUnitId = 1;
const fakeLessonId = 2;

const MINIMUM_PROPS = {
  unitId: fakeUnitId,
  lessonId: fakeLessonId,
  handleClose: () => {},
  selectedSectionId: fakeSectionId,
  refetchSectionLockStatus: () => {},
};

// Helper function to get the list of rows in the student table.
const getStudentRows = wrapper => wrapper.find(StudentRow);

describe('LessonLockDialog with stubbed section selector', () => {
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders with minimal props', () => {
    const wrapper = shallow(<LessonLockDialog {...MINIMUM_PROPS} />);
    expect(wrapper).not.toBeNull();
    expect(wrapper.text()).not.toHaveLength(0);
  });

  it('does not display hidden warning if lesson not hidden', () => {
    const wrapper = shallow(<LessonLockDialog {...MINIMUM_PROPS} />);
    expect(wrapper.text()).not.toContain(i18n.hiddenAssessmentWarning());
  });

  it('displays hidden warning if lesson is hidden', () => {
    const wrapper = shallow(
      <LessonLockDialog {...MINIMUM_PROPS} lessonIsHidden={true} />
    );
    expect(wrapper.text().includes(i18n.hiddenAssessmentWarning()));
  });

  it('renders student row with name and lock status', () => {
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: [{name: 'fakeName', lockStatus: LockStatus.Locked}],
    });

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog {...MINIMUM_PROPS} />
      </Provider>
    );

    expect(getStudentRows(wrapper)).toHaveLength(1);
    const studentRow = getStudentRows(wrapper).at(0);
    expect(studentRow.props().name).toBe('fakeName');
    expect(studentRow.props().lockStatus).toBe(LockStatus.Locked);

    lessonLockDataApi.useGetLockState.mockRestore();
  });

  it('clicking "Allow editing" sets all statuses to Editable', () => {
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: [
        {name: 'fakeName1', lockStatus: LockStatus.Locked},
        {name: 'fakeName2', lockStatus: LockStatus.Locked},
      ],
    });

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog {...MINIMUM_PROPS} />
      </Provider>
    );

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).toBe(LockStatus.Locked);
    });

    const allowEditingButton = wrapper.find('button').at(1);
    expect(allowEditingButton.text() === 'Allow editing');
    allowEditingButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).toBe(LockStatus.Editable);
    });

    lessonLockDataApi.useGetLockState.mockRestore();
  });

  it('clicking "Lock lesson" sets all statuses to Locked', () => {
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: [
        {name: 'fakeName1', lockStatus: LockStatus.Editable},
        {name: 'fakeName2', lockStatus: LockStatus.Editable},
      ],
    });

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog {...MINIMUM_PROPS} />
      </Provider>
    );

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).toBe(LockStatus.Editable);
    });

    const lockLessonButton = wrapper.find('button').at(2);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).toBe(LockStatus.Locked);
    });

    lessonLockDataApi.useGetLockState.mockRestore();
  });

  it('clicking "Show answers" sets all statuses to ReadOnlyAnswers', () => {
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: [
        {name: 'fakeName1', lockStatus: LockStatus.Editable},
        {name: 'fakeName2', lockStatus: LockStatus.Editable},
      ],
    });

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog {...MINIMUM_PROPS} />
      </Provider>
    );

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).toBe(LockStatus.Editable);
    });

    const showAnswersButton = wrapper.find('button').at(3);
    expect(showAnswersButton.text() === 'Show answers');
    showAnswersButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).toBe(LockStatus.ReadonlyAnswers);
    });

    lessonLockDataApi.useGetLockState.mockRestore();
  });

  describe('viewSection callback', () => {
    beforeEach(() => jest.spyOn(window, 'open').mockClear().mockImplementation());
    afterEach(() => window.open.mockRestore());

    it('opens a window to the section assessments page', () => {
      const wrapper = mount(
        <Provider store={store}>
          <LessonLockDialog {...MINIMUM_PROPS} />
        </Provider>
      );

      const viewSectionButton = wrapper.find('button').at(5);
      expect(viewSectionButton.text() === 'View section');
      viewSectionButton.simulate('click');
      wrapper.update();

      expect(window.open).toHaveBeenCalledWith(`/teacher_dashboard/sections/${fakeSectionId}/assessments`);
    });
  });

  it('handleSave calls saveLockState, refetchSectionLockStatus and handleClose', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable},
    ];
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: initialLockStatus,
    });
    const lessonLockSaveStub = jest.spyOn(lessonLockDataApi, 'saveLockState').mockClear()
      .mockReturnValue(new Promise(resolve => resolve({ok: true})));
    const refetchStub = jest.fn().mockReturnValue(new Promise(resolve => resolve()));
    const handleCloseSpy = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog
          {...MINIMUM_PROPS}
          refetchSectionLockStatus={refetchStub}
          handleClose={handleCloseSpy}
        />
      </Provider>
    );

    const lockLessonButton = wrapper.find('button').at(2);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    const saveButton = wrapper.find('button').at(7);
    expect(saveButton.text() === 'Save');
    saveButton.simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).toHaveBeenCalled();
    await setTimeout(() => {}, 50);
    expect(refetchStub).toHaveBeenCalled();
    await setTimeout(() => {}, 50);
    expect(handleCloseSpy).toHaveBeenCalled();

    lessonLockDataApi.useGetLockState.mockRestore();
    lessonLockDataApi.saveLockState.mockRestore();
  });

  it('handleSave shows default error if failed with no message', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable},
    ];
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: initialLockStatus,
    });
    const lessonLockSaveStub = jest.spyOn(lessonLockDataApi, 'saveLockState').mockClear()
      .mockReturnValue(Promise.resolve({ok: false, json: () => Promise.resolve({})}));
    const refetchStub = jest.fn().mockReturnValue(new Promise(resolve => resolve()));
    const handleCloseSpy = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog
          {...MINIMUM_PROPS}
          refetchSectionLockStatus={refetchStub}
          handleClose={handleCloseSpy}
        />
      </Provider>
    );

    const lockLessonButton = wrapper.find('button').at(2);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    const saveButton = wrapper.find('button').at(7);
    expect(saveButton.text() === 'Save');
    saveButton.simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).toHaveBeenCalled();
    await setTimeout(() => {}, 50);

    expect(wrapper.text().includes(i18n.errorSavingLockStatus())).toBe(true);
    expect(handleCloseSpy).not.toHaveBeenCalled();

    lessonLockDataApi.useGetLockState.mockRestore();
    lessonLockDataApi.saveLockState.mockRestore();
  });

  it('handleSave shows error message from server if provided', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable},
    ];
    jest.spyOn(lessonLockDataApi, 'useGetLockState').mockClear().mockReturnValue({
      loading: false,
      serverLockState: initialLockStatus,
    });
    const lessonLockSaveStub = jest.spyOn(lessonLockDataApi, 'saveLockState').mockClear()
      .mockReturnValue(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({error: 'Error message from server'}),
        })
      );
    const refetchStub = jest.fn().mockReturnValue(new Promise(resolve => resolve()));
    const handleCloseSpy = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog
          {...MINIMUM_PROPS}
          refetchSectionLockStatus={refetchStub}
          handleClose={handleCloseSpy}
        />
      </Provider>
    );

    const lockLessonButton = wrapper.find('button').at(2);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    const saveButton = wrapper.find('button').at(7);
    expect(saveButton.text() === 'Save');
    saveButton.simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).toHaveBeenCalled();
    await setTimeout(() => {}, 50);

    expect(wrapper.text().includes('Error message from server')).toBe(true);
    expect(handleCloseSpy).not.toHaveBeenCalled();

    lessonLockDataApi.useGetLockState.mockRestore();
    lessonLockDataApi.saveLockState.mockRestore();
  });
});
