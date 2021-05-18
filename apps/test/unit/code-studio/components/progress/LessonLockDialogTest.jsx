import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLessonLockDialog as LessonLockDialog} from '@cdo/apps/code-studio/components/progress/LessonLockDialog';
import {LockStatus} from '@cdo/apps/code-studio/stageLockRedux';

const MINIMUM_PROPS = {
  isOpen: false,
  handleClose: () => {},
  initialLockStatus: [],
  selectedSectionId: '',
  saving: false,
  saveDialog: () => {}
};

describe('LessonLockDialog', () => {
  it('renders with a selected section', () => {
    const wrapper = shallow(
      <LessonLockDialog {...MINIMUM_PROPS} selectedSectionId="fakeSectionId" />
    );
    expect(wrapper).not.to.be.null;
  });

  it('updates lock status from new props if not saving', () => {
    const wrapper = shallow(<LessonLockDialog {...MINIMUM_PROPS} />);
    expect(wrapper.state().lockStatus).to.deep.equal([]);

    wrapper.setProps({
      ...wrapper.props(),
      initialLockStatus: [{name: 'fakeName', lockStatus: LockStatus.Locked}],
      saving: false
    });
    expect(wrapper.state().lockStatus).to.deep.equal([
      {name: 'fakeName', lockStatus: LockStatus.Locked}
    ]);
  });

  it('does not update lock status from new props while saving', () => {
    const wrapper = shallow(<LessonLockDialog {...MINIMUM_PROPS} />);
    expect(wrapper.state().lockStatus).to.deep.equal([]);

    wrapper.setProps({
      ...wrapper.props(),
      initialLockStatus: [{name: 'fakeName', lockStatus: LockStatus.Locked}],
      saving: true
    });
    expect(wrapper.state().lockStatus).to.deep.equal([]);
  });

  it('allowEditing callback sets all statuses to Editable', () => {
    const wrapper = shallow(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[
          {name: 'fakeName', lockStatus: LockStatus.Locked},
          {name: 'fakeName2', lockStatus: LockStatus.Locked}
        ]}
      />
    );
    wrapper.state().lockStatus.forEach(stage => {
      expect(stage).to.have.property('lockStatus', LockStatus.Locked);
    });

    wrapper.instance().allowEditing();
    wrapper.state().lockStatus.forEach(stage => {
      expect(stage).to.have.property('lockStatus', LockStatus.Editable);
    });
  });

  it('lockStage callback sets all statuses to Locked', () => {
    const wrapper = shallow(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[
          {name: 'fakeName', lockStatus: LockStatus.Editable},
          {name: 'fakeName2', lockStatus: LockStatus.Editable}
        ]}
      />
    );
    wrapper.state().lockStatus.forEach(stage => {
      expect(stage).to.have.property('lockStatus', LockStatus.Editable);
    });

    wrapper.instance().lockStage();
    wrapper.state().lockStatus.forEach(stage => {
      expect(stage).to.have.property('lockStatus', LockStatus.Locked);
    });
  });

  it('showAnswers callback sets all statuses to ReadonlyAnswers', () => {
    const wrapper = shallow(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        initialLockStatus={[
          {name: 'fakeName', lockStatus: LockStatus.Editable},
          {name: 'fakeName2', lockStatus: LockStatus.Editable}
        ]}
      />
    );
    wrapper.state().lockStatus.forEach(stage => {
      expect(stage).to.have.property('lockStatus', LockStatus.Editable);
    });

    wrapper.instance().showAnswers();
    wrapper.state().lockStatus.forEach(stage => {
      expect(stage).to.have.property('lockStatus', LockStatus.ReadonlyAnswers);
    });
  });

  describe('viewSection callback', () => {
    beforeEach(() => sinon.stub(window, 'open'));
    afterEach(() => window.open.restore());

    it('opens a window to the section assessments page', () => {
      const wrapper = shallow(
        <LessonLockDialog
          {...MINIMUM_PROPS}
          selectedSectionId="fakeSectionId"
        />
      );
      expect(window.open).not.to.have.been.called;

      wrapper.instance().viewSection();
      expect(window.open).to.have.been.calledOnce.and.calledWith(
        '/teacher_dashboard/sections/fakeSectionId/assessments'
      );
    });
  });

  it('handleSave passes selected section id and statuses to the saveDialog callback', () => {
    const saveDialog = sinon.spy();
    const wrapper = shallow(
      <LessonLockDialog
        {...MINIMUM_PROPS}
        selectedSectionId="fakeSectionId"
        initialLockStatus={[
          {name: 'fakeStage1', lockStatus: LockStatus.Editable},
          {name: 'fakeStage2', lockStatus: LockStatus.Editable}
        ]}
        saveDialog={saveDialog}
      />
    );
    expect(saveDialog).not.to.have.been.called;

    wrapper.instance().handleSave();
    expect(saveDialog).to.have.been.calledOnce.and.calledWith(
      'fakeSectionId',
      wrapper.state().lockStatus
    );
  });
});
