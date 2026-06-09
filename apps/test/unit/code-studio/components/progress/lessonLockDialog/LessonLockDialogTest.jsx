import Modal from '@code-dot-org/component-library/modal';
import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

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

import {expect} from '../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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

const getStudentRows = wrapper => wrapper.find(StudentRow);

// Look up modal buttons by their visible text rather than by position so the
// tests stay readable and resilient to layout changes.
const findButtonByText = (wrapper, text) =>
  wrapper
    .find('button')
    .filterWhere(n => n.text().trim() === text)
    .first();

// Save lives on Modal's primaryButtonProps; the rendered <button> shows the
// "Saving..." label while in-flight, so look it up by either label.
const findSaveButton = wrapper => {
  const save = findButtonByText(wrapper, i18n.save());
  return save.length ? save : findButtonByText(wrapper, i18n.saving());
};

describe('LessonLockDialog with stubbed section selector', () => {
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    if (lessonLockDataApi.useGetLockState.restore) {
      lessonLockDataApi.useGetLockState.restore();
    }
    if (lessonLockDataApi.saveLockState.restore) {
      lessonLockDataApi.saveLockState.restore();
    }
  });

  it('renders with minimal props', () => {
    const wrapper = shallow(<LessonLockDialog {...MINIMUM_PROPS} />);
    expect(wrapper).not.to.be.null;
    expect(wrapper.find(Modal)).to.have.length(1);
  });

  it('does not display hidden warning if lesson not hidden', () => {
    const wrapper = shallow(<LessonLockDialog {...MINIMUM_PROPS} />);
    // The dialog body lives in Modal's customContent prop — render it to
    // inspect children.
    const content = shallow(
      <div>{wrapper.find(Modal).prop('customContent')}</div>
    );
    expect(content.text()).not.to.include(i18n.hiddenAssessmentWarning());
  });

  it('displays hidden warning if lesson is hidden', () => {
    const wrapper = shallow(
      <LessonLockDialog {...MINIMUM_PROPS} lessonIsHidden={true} />
    );
    const content = shallow(
      <div>{wrapper.find(Modal).prop('customContent')}</div>
    );
    expect(content.text()).to.include(i18n.hiddenAssessmentWarning());
  });

  it('renders student row with name and lock status', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: [{name: 'fakeName', lockStatus: LockStatus.Locked}],
    });

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog {...MINIMUM_PROPS} />
      </Provider>
    );

    expect(getStudentRows(wrapper)).to.have.length(1);
    const studentRow = getStudentRows(wrapper).at(0);
    expect(studentRow.props().name).to.equal('fakeName');
    expect(studentRow.props().lockStatus).to.equal(LockStatus.Locked);
  });

  it('clicking "Allow editing" sets all statuses to Editable', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
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
      expect(row.props().lockStatus).to.equal(LockStatus.Locked);
    });

    findButtonByText(wrapper, i18n.allowEditing()).simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Editable);
    });
  });

  it('clicking "Lock lesson" sets all statuses to Locked', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
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
      expect(row.props().lockStatus).to.equal(LockStatus.Editable);
    });

    findButtonByText(wrapper, i18n.lockStage()).simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Locked);
    });
  });

  it('clicking "Show answers" sets all statuses to ReadOnlyAnswers', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
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
      expect(row.props().lockStatus).to.equal(LockStatus.Editable);
    });

    findButtonByText(wrapper, i18n.showAnswers()).simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.ReadonlyAnswers);
    });
  });

  describe('viewSection callback', () => {
    beforeEach(() => sinon.stub(window, 'open'));
    afterEach(() => window.open.restore());

    it('opens a window to the section assessments page', () => {
      const wrapper = mount(
        <Provider store={store}>
          <LessonLockDialog {...MINIMUM_PROPS} />
        </Provider>
      );

      findButtonByText(wrapper, i18n.viewSection()).simulate('click');
      wrapper.update();

      expect(window.open).to.have.been.calledOnce.and.calledWith(
        `/teacher_dashboard/sections/${fakeSectionId}/assessments`
      );
    });
  });

  it('handleSave calls saveLockState, refetchSectionLockStatus and handleClose', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable},
    ];
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: initialLockStatus,
    });
    const lessonLockSaveStub = sinon
      .stub(lessonLockDataApi, 'saveLockState')
      .returns(new Promise(resolve => resolve({ok: true})));
    const refetchStub = sinon.stub().returns(new Promise(resolve => resolve()));
    const handleCloseSpy = sinon.spy();

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog
          {...MINIMUM_PROPS}
          refetchSectionLockStatus={refetchStub}
          handleClose={handleCloseSpy}
        />
      </Provider>
    );

    findButtonByText(wrapper, i18n.lockStage()).simulate('click');
    wrapper.update();

    findSaveButton(wrapper).simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).to.have.been.called;
    await setTimeout(() => {}, 50);
    expect(refetchStub).to.have.been.called;
    await setTimeout(() => {}, 50);
    expect(handleCloseSpy).to.have.been.called;
  });

  it('handleSave shows default error if failed with no message', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable},
    ];
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: initialLockStatus,
    });
    const lessonLockSaveStub = sinon
      .stub(lessonLockDataApi, 'saveLockState')
      .returns(Promise.resolve({ok: false, json: () => Promise.resolve({})}));
    const refetchStub = sinon.stub().returns(new Promise(resolve => resolve()));
    const handleCloseSpy = sinon.spy();

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog
          {...MINIMUM_PROPS}
          refetchSectionLockStatus={refetchStub}
          handleClose={handleCloseSpy}
        />
      </Provider>
    );

    act(() => {
      findButtonByText(wrapper, i18n.lockStage()).simulate('click');
      wrapper.update();
    });

    await act(() => {
      findSaveButton(wrapper).simulate('click');
      wrapper.update();
    });

    expect(lessonLockSaveStub).to.have.been.called;
    expect(wrapper.text().includes(i18n.errorSavingLockStatus())).to.be.true;
    expect(handleCloseSpy).to.not.be.called;
  });

  it('handleSave shows error message from server if provided', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable},
    ];
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: initialLockStatus,
    });
    const lessonLockSaveStub = sinon
      .stub(lessonLockDataApi, 'saveLockState')
      .returns(
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({error: 'Error message from server'}),
        })
      );
    const refetchStub = sinon.stub().returns(new Promise(resolve => resolve()));
    const handleCloseSpy = sinon.spy();

    const wrapper = mount(
      <Provider store={store}>
        <LessonLockDialog
          {...MINIMUM_PROPS}
          refetchSectionLockStatus={refetchStub}
          handleClose={handleCloseSpy}
        />
      </Provider>
    );

    findButtonByText(wrapper, i18n.lockStage()).simulate('click');
    wrapper.update();

    findSaveButton(wrapper).simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).to.have.been.called;
    await setTimeout(() => {}, 50);

    expect(wrapper.text().includes('Error message from server')).to.be.true;
    expect(handleCloseSpy).to.not.be.called;
  });
});
