import React from 'react';
import {assert, expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedSectionSelector as SectionSelector} from '@cdo/apps/code-studio/components/progress/SectionSelector';
import {mount} from 'enzyme';
import * as utils from '@cdo/apps/utils';
import * as codeStudioUtils from '@cdo/apps/code-studio/utils';

const fakeSection = {
  name: 'My Section',
  id: 123
};

describe('SectionSelector', () => {
  it('renders nothing if it has no sections', () => {
    const component = mount(
      <SectionSelector
        sections={[]}
        scriptHasLockableStages={true}
        scriptAllowsHiddenStages={true}
        selectSection={() => {}}
      />
    );
    assert(component.html() === null);
  });

  it('renders something if we have lockable stages', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        scriptHasLockableStages={true}
        scriptAllowsHiddenStages={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  it('renders something if we allow hidden stages', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={true}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  it('renders something if alwaysShow even if no lockable/hidden stages', () => {
    const component = mount(
      <SectionSelector
        alwaysShow={true}
        sections={[fakeSection]}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  describe('handleSelectChange', () => {
    beforeEach(() => {
      sinon.stub(utils, 'reload');
      sinon.stub(codeStudioUtils, 'updateQueryParam');
    });

    afterEach(() => {
      codeStudioUtils.updateQueryParam.restore();
      utils.reload.restore();
    });

    it('updates the query param if a section is selected', () => {
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          scriptHasLockableStages={false}
          scriptAllowsHiddenStages={false}
          selectSection={() => {}}
        />
      );
      wrapper.find('select').simulate('change', {target: {value: '12345'}});
      expect(codeStudioUtils.updateQueryParam)
        .to.have.been.calledTwice.and.calledWith('section_id', '12345')
        .and.calledWith('user_id', undefined);
    });

    it('removes the query param if a section is unselected', () => {
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          scriptHasLockableStages={false}
          scriptAllowsHiddenStages={false}
          selectSection={() => {}}
        />
      );
      wrapper.find('select').simulate('change', {target: {value: ''}});
      expect(codeStudioUtils.updateQueryParam)
        .to.have.been.calledTwice.and.calledWith('section_id', undefined)
        .and.calledWith('user_id', undefined);
    });

    it('reloads on change if prop reloadOnChange is set', () => {
      const selectSection = sinon.spy();
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          scriptHasLockableStages={false}
          scriptAllowsHiddenStages={false}
          selectSection={selectSection}
          reloadOnChange={true}
        />
      );
      wrapper.find('select').simulate('change', {target: {value: '12345'}});
      expect(utils.reload).to.have.been.calledOnce;
      expect(selectSection).not.to.have.been.called;
    });

    it('calls selectSection on change if prop reloadOnChange is not set', () => {
      const selectSection = sinon.spy();
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          scriptHasLockableStages={false}
          scriptAllowsHiddenStages={false}
          selectSection={selectSection}
          reloadOnChange={false}
        />
      );
      wrapper.find('select').simulate('change', {target: {value: '12345'}});
      expect(selectSection).to.have.been.calledOnce.and.calledWith(12345);
      expect(utils.reload).not.to.have.been.called;
    });
  });
});
