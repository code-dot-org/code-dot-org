import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLessonLockDialog as LessonLockDialog} from '@cdo/apps/code-studio/components/progress/LessonLockDialog';
import {LockStatus} from '@cdo/apps/code-studio/lessonLockRedux';

// This * import allows us to stub out the SectionSelector component
import * as SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';

const fakeSectionId = 42;

const MINIMUM_PROPS = {
  isOpen: true,
  handleClose: () => {},
  initialLockStatus: [],
  selectedSectionId: fakeSectionId,
  saving: false,
  saveDialog: () => {}
};

// Helper function to get the list of rows in the student table.
const getStudentRows = wrapper =>
  wrapper.find('#ui-test-student-table tbody tr');

// Helper function to verify that the radio buttons in the given student row
// correctly reflect the expected lock status. Each student row has four cells,
// the name followed by three radio button inputs:
//   <student name> | [] Locked | [] Editable | [] Read-only
const verifyRowLockStatus = (row, expectedLockStatus) => {
  const radioButtons = row.find('input');
  const lockedSelected = radioButtons.at(0).props().checked;
  expect(lockedSelected).to.equal(expectedLockStatus === LockStatus.Locked);
  const editableSelected = radioButtons.at(1).props().checked;
  expect(editableSelected).to.equal(expectedLockStatus === LockStatus.Editable);
  const readonlySelected = radioButtons.at(2).props().checked;
  expect(readonlySelected).to.equal(
    expectedLockStatus === LockStatus.ReadonlyAnswers
  );
};

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

  it('renders no content when closed', () => {
    const wrapper = mount(
      <LessonLockDialog {...MINIMUM_PROPS} isOpen={false} />
    );
    expect(wrapper).not.to.be.null;
    expect(wrapper.text()).to.be.empty;
  });

  it('renders student row with name and lock status', () => {
    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[{name: 'fakeName', lockStatus: LockStatus.Locked}]}
      />
    );

    expect(getStudentRows(wrapper)).to.have.length(1);
    const studentRow = getStudentRows(wrapper).at(0);
    expect(
      studentRow
        .find('td')
        .at(0)
        .text()
    ).equals('fakeName');
    verifyRowLockStatus(studentRow, LockStatus.Locked);
  });

  it('updates lock status from new props if not saving', () => {
    const wrapper = mount(
      <LessonLockDialog {...MINIMUM_PROPS} saving={false} />
    );
    expect(getStudentRows(wrapper)).to.have.length(0);

    wrapper.setProps({
      ...wrapper.props(),
      initialLockStatus: [{name: 'fakeName', lockStatus: LockStatus.Locked}]
    });
    wrapper.update();

    expect(getStudentRows(wrapper)).to.have.length(1);
  });

  it('does not update lock status from new props while saving', () => {
    const wrapper = mount(
      <LessonLockDialog {...MINIMUM_PROPS} saving={true} />
    );
    expect(getStudentRows(wrapper)).to.have.length(0);

    wrapper.setProps({
      ...wrapper.props(),
      initialLockStatus: [{name: 'fakeName', lockStatus: LockStatus.Locked}]
    });
    wrapper.update();

    expect(getStudentRows(wrapper)).to.have.length(0);
  });

  it('clicking "Allow editing" sets all statuses to Editable', () => {
    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[
          {name: 'fakeName1', lockStatus: LockStatus.Locked},
          {name: 'fakeName2', lockStatus: LockStatus.Locked}
        ]}
      />
    );

    getStudentRows(wrapper).forEach(row => {
      verifyRowLockStatus(row, LockStatus.Locked);
    });

    const allowEditingButton = wrapper.find('button').at(0);
    expect(allowEditingButton.text() === 'Allow editing');
    allowEditingButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      verifyRowLockStatus(row, LockStatus.Editable);
    });
  });

  it('clicking "Lock lesson" sets all statuses to Locked', () => {
    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[
          {name: 'fakeName1', lockStatus: LockStatus.Editable},
          {name: 'fakeName2', lockStatus: LockStatus.Editable}
        ]}
      />
    );

    getStudentRows(wrapper).forEach(row => {
      verifyRowLockStatus(row, LockStatus.Editable);
    });

    const lockLessonButton = wrapper.find('button').at(1);
    expect(lockLessonButton.text() === 'Lock lesson');
    lockLessonButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      verifyRowLockStatus(row, LockStatus.Locked);
    });
  });

  it('clicking "Show answers" sets all statuses to ReadOnlyAnswers', () => {
    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[
          {name: 'fakeName1', lockStatus: LockStatus.Editable},
          {name: 'fakeName2', lockStatus: LockStatus.Editable}
        ]}
      />
    );

    getStudentRows(wrapper).forEach(row => {
      verifyRowLockStatus(row, LockStatus.Editable);
    });

    const showAnswersButton = wrapper.find('button').at(2);
    expect(showAnswersButton.text() === 'Show answers');
    showAnswersButton.simulate('click');
    wrapper.update();

    getStudentRows(wrapper).forEach(row => {
      verifyRowLockStatus(row, LockStatus.ReadonlyAnswers);
    });
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

  it('handleSave passes selected section id and statuses to the saveDialog callback', () => {
    const saveDialog = sinon.spy();
    const lockStatus = [
      {name: 'fakeName1', lockStatus: LockStatus.Editable},
      {name: 'fakeName2', lockStatus: LockStatus.Editable}
    ];
    const wrapper = mount(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={lockStatus}
        saveDialog={saveDialog}
      />
    );
    expect(saveDialog).not.to.have.been.called;

    const saveButton = wrapper.find('button').at(6);
    expect(saveButton.text() === 'Save');
    saveButton.simulate('click');
    wrapper.update();

    expect(saveDialog).to.have.been.calledOnce.and.calledWith(
      fakeSectionId,
      lockStatus
    );
  });
});
