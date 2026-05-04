import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedManageStudentsActionsCell as ManageStudentsActionsCell} from '@cdo/apps/templates/manageStudents/ManageStudentsActionsCell';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  id: 2,
  sectionId: 10,
  isEditing: false,
  studentName: 'Clark Kent',
  startEditingStudent: () => {},
  cancelEditingStudent: () => {},
  removeStudent: () => {},
  canEdit: true,
  loadSectionData: () => {},
};

function optionLabels(wrapper) {
  const dropdown = wrapper.find(ActionDropdown);
  if (!dropdown.exists()) {
    return [];
  }
  return dropdown.prop('options').map(opt => opt.label);
}

describe('ManageStudentsActionsCell', () => {
  it('renders the edit, remove and print login card option when a picture login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'picture'} />
    );
    const labels = optionLabels(wrapper);
    expect(labels).to.include('Remove student');
    expect(labels).to.include('Edit');
    expect(labels).to.include('Print login card');
  });

  it('renders the edit, remove and print login card option when a word login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'word'} />
    );
    const labels = optionLabels(wrapper);
    expect(labels).to.include('Remove student');
    expect(labels).to.include('Edit');
    expect(labels).to.include('Print login card');
  });

  it('renders the edit and remove option when a email login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'email'} />
    );
    const labels = optionLabels(wrapper);
    expect(labels).to.include('Remove student');
    expect(labels).to.include('Edit');
    expect(labels).not.to.include('Print login card');
  });

  it('renders the edit option when a clever login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'clever'} />
    );
    expect(optionLabels(wrapper)).to.include('Edit');
  });

  it('renders the edit option when a google login', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} loginType={'google'} />
    );
    expect(optionLabels(wrapper)).to.include('Edit');
  });

  it('does not render the edit option when canEdit is false', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell {...DEFAULT_PROPS} canEdit={false} />
    );
    expect(optionLabels(wrapper)).not.to.include('Edit');
  });

  it('does not render the edit option when loginType is lti and roster sync is enabled', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell
        {...DEFAULT_PROPS}
        loginType={SectionLoginType.lti_v1}
        syncEnabled={true}
      />
    );
    expect(optionLabels(wrapper)).not.to.include('Edit');
  });

  it('renders the edit option when loginType is lti and roster sync is disabled', () => {
    const wrapper = shallow(
      <ManageStudentsActionsCell
        {...DEFAULT_PROPS}
        loginType={SectionLoginType.lti_v1}
        syncEnabled={null}
      />
    );
    expect(optionLabels(wrapper)).to.include('Edit');
  });

  describe('onDelete', () => {
    beforeEach(() => {
      sinon.stub($, 'ajax').returns({
        done: sinon
          .stub()
          .callsArg(0)
          .returns({fail: () => {}}),
      });
    });

    afterEach(() => {
      $.ajax.restore();
    });

    it('Updates the section information', () => {
      const loadSectionSpy = sinon.spy();
      const props = {
        ...DEFAULT_PROPS,
        ...{loadSectionData: loadSectionSpy},
      };
      const wrapper = shallow(<ManageStudentsActionsCell {...props} />);
      wrapper.instance().onConfirmDelete();
      expect(loadSectionSpy).to.have.been.calledOnceWith(10);
    });
  });
});
