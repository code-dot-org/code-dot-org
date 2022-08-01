import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLessonLockDialog as LessonLockDialog} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDialog';
import {LockStatus} from '@cdo/apps/code-studio/lessonLockRedux';
import StudentRow from '@cdo/apps/code-studio/components/progress/lessonLockDialog/StudentRow';
import * as lessonLockDataApi from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import commonMsg from '@cdo/locale';

// This * import allows us to stub out the SectionSelector component
import * as SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';

const fakeSectionId = 42;
const fakeUnitId = 1;
const fakeLessonId = 2;

const MINIMUM_PROPS = {
  unitId: fakeUnitId,
  lessonId: fakeLessonId,
  handleClose: () => {},
  selectedSectionId: fakeSectionId,
  refetchSectionLockStatus: () => {}
};

// Helper function to get the list of rows in the student table.
const getStudentRows = wrapper => wrapper.find(StudentRow);

describe('LessonLockDialog with stubbed section selector', () => {
  // Stub out <SectionSelector> so we can test without Redux.
  let sectionSelectorStub;
  beforeEach(() => {
    sectionSelectorStub = sinon.stub(SectionSelector, 'default');
    sectionSelectorStub.callsFake(props => null);
  });

  afterEach(() => {
    sectionSelectorStub.restore();
  });

  it('renders with minimal props', () => {
    const wrapper = mount(<LessonLockDialog {...MINIMUM_PROPS} />);
    expect(wrapper).not.to.be.null;
    expect(wrapper.text()).not.to.be.empty;
  });

  it('renders student row with name and lock status', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: [{name: 'fakeName', lockStatus: LockStatus.Locked}]
    });

    const wrapper = mount(<LessonLockDialog {...MINIMUM_PROPS} />);

    expect(getStudentRows(wrapper)).to.have.length(1);
    const studentRow = getStudentRows(wrapper).at(0);
    expect(studentRow.props().name).to.equal('fakeName');
    expect(studentRow.props().lockStatus).to.equal(LockStatus.Locked);

    lessonLockDataApi.useGetLockState.restore();
  });

  it('clicking "Allow editing" sets all statuses to Editable', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: [
        {name: 'fakeName1', lockStatus: LockStatus.Locked},
        {name: 'fakeName2', lockStatus: LockStatus.Locked}
      ]
    });

    const wrapper = mount(<LessonLockDialog {...MINIMUM_PROPS} />);

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Locked);
    });

    const allowEditingButton = wrapper.find('button').at(0);
    expect(allowEditingButton.text() === 'Allow editing');
    allowEditingButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Editable);
    });

    lessonLockDataApi.useGetLockState.restore();
  });

  it('clicking "Lock lesson" sets all statuses to Locked', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: [
        {name: 'fakeName1', lockStatus: LockStatus.Editable},
        {name: 'fakeName2', lockStatus: LockStatus.Editable}
      ]
    });

    const wrapper = mount(<LessonLockDialog {...MINIMUM_PROPS} />);

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Editable);
    });

    const lockLessonButton = wrapper.find('button').at(1);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Locked);
    });

    lessonLockDataApi.useGetLockState.restore();
  });

  it('clicking "Show answers" sets all statuses to ReadOnlyAnswers', () => {
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: [
        {name: 'fakeName1', lockStatus: LockStatus.Editable},
        {name: 'fakeName2', lockStatus: LockStatus.Editable}
      ]
    });

    const wrapper = mount(<LessonLockDialog {...MINIMUM_PROPS} />);

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.Editable);
    });

    const showAnswersButton = wrapper.find('button').at(2);
    expect(showAnswersButton.text() === 'Show answers');
    showAnswersButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      expect(row.props().lockStatus).to.equal(LockStatus.ReadonlyAnswers);
    });

    lessonLockDataApi.useGetLockState.restore();
  });

  describe('viewSection callback', () => {
    beforeEach(() => sinon.stub(window, 'open'));
    afterEach(() => window.open.restore());

    it('opens a window to the section assessments page', () => {
      const wrapper = mount(<LessonLockDialog {...MINIMUM_PROPS} />);

      const viewSectionButton = wrapper.find('button').at(4);
      expect(viewSectionButton.text() === 'View section');
      viewSectionButton.simulate('click');
      wrapper.update();

      expect(window.open).to.have.been.calledOnce.and.calledWith(
        `/teacher_dashboard/sections/${fakeSectionId}/assessments`
      );
    });
  });

  it('handleSave calls saveLockState, refetchSectionLockStatus and handleClose', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable}
    ];
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: initialLockStatus
    });
    const lessonLockSaveStub = sinon
      .stub(lessonLockDataApi, 'saveLockState')
      .returns(new Promise(resolve => resolve({ok: true})));
    const refetchStub = sinon.stub().returns(new Promise(resolve => resolve()));
    const handleCloseSpy = sinon.spy();

    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        refetchSectionLockStatus={refetchStub}
        handleClose={handleCloseSpy}
      />
    );

    const lockLessonButton = wrapper.find('button').at(1);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    const saveButton = wrapper.find('button').at(6);
    expect(saveButton.text() === 'Save');
    saveButton.simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).to.have.been.called;
    await setTimeout(() => {}, 50);
    expect(refetchStub).to.have.been.called;
    await setTimeout(() => {}, 50);
    expect(handleCloseSpy).to.have.been.called;

    lessonLockDataApi.useGetLockState.restore();
    lessonLockDataApi.saveLockState.restore();
  });

  it('handleSave shows error if failed', async () => {
    const initialLockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable}
    ];
    sinon.stub(lessonLockDataApi, 'useGetLockState').returns({
      loading: false,
      serverLockState: initialLockStatus
    });
    const lessonLockSaveStub = sinon
      .stub(lessonLockDataApi, 'saveLockState')
      .returns(new Promise(resolve => resolve({ok: false})));
    const refetchStub = sinon.stub().returns(new Promise(resolve => resolve()));
    const handleCloseSpy = sinon.spy();

    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        refetchSectionLockStatus={refetchStub}
        handleClose={handleCloseSpy}
      />
    );

    const lockLessonButton = wrapper.find('button').at(1);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    const saveButton = wrapper.find('button').at(6);
    expect(saveButton.text() === 'Save');
    saveButton.simulate('click');
    wrapper.update();

    await setTimeout(() => {}, 50);
    expect(lessonLockSaveStub).to.have.been.called;

    expect(wrapper.text().includes(commonMsg.errorSavingLockStatus())).to.be
      .true;
    expect(handleCloseSpy).to.not.be.called;

    lessonLockDataApi.useGetLockState.restore();
    lessonLockDataApi.saveLockState.restore();
  });
});
