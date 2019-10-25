import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryManagerDialog from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import sinon from 'sinon';

describe('LibraryManagerDialog', () => {
  beforeEach(() => {
    replaceOnWindow('dashboard', {
      project: {
        getProjectLibraries: () => {},
        setProjectLibraries: () => {}
      }
    });
  });

  afterEach(() => {
    restoreOnWindow('dashboard');
  });

  it('displays no LibraryListItem when no libraries exist', () => {
    sinon
      .stub(window.dashboard.project, 'getProjectLibraries')
      .returns(undefined);
    sinon
      .stub(LibraryClientApi.prototype, 'getClassLibraries')
      .returns(undefined);
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    expect(wrapper.find(LibraryListItem)).to.be.empty;
    window.dashboard.project.getProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
  });

  it('displays LibraryListItem when the project contains libraries', () => {
    sinon
      .stub(window.dashboard.project, 'getProjectLibraries')
      .returns([{name: 'first'}, {name: 'second'}]);
    sinon.stub(LibraryClientApi.prototype, 'getClassLibraries');
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
    expect(wrapper.state().classLibraries).to.have.lengthOf(0);
    expect(wrapper.state().libraries).to.have.lengthOf(2);
    window.dashboard.project.getProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
  });

  it('displays LibraryListItem when class libraries are available', () => {
    sinon
      .stub(window.dashboard.project, 'getProjectLibraries')
      .returns(undefined);
    sinon
      .stub(LibraryClientApi.prototype, 'getClassLibraries')
      .callsFake(callback => callback([{channel: '1'}, {channel: '2'}]));
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
    expect(wrapper.state().classLibraries).to.have.lengthOf(2);
    expect(wrapper.state().libraries).to.have.lengthOf(0);
    window.dashboard.project.getProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
  });

  it('displays all libraries from the project and the class', () => {
    sinon
      .stub(window.dashboard.project, 'getProjectLibraries')
      .returns([{name: 'first'}, {name: 'second'}]);
    sinon
      .stub(LibraryClientApi.prototype, 'getClassLibraries')
      .callsFake(callback => callback([{channel: '1'}, {channel: '2'}]));
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(wrapper.find(LibraryListItem)).to.have.lengthOf(4);
    expect(wrapper.state().classLibraries).to.have.lengthOf(2);
    expect(wrapper.state().libraries).to.have.lengthOf(2);
    window.dashboard.project.getProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
  });

  it('setLibraryToImport sets the import library', () => {
    sinon
      .stub(window.dashboard.project, 'getProjectLibraries')
      .returns(undefined);
    sinon.stub(LibraryClientApi.prototype, 'getClassLibraries');
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    wrapper.instance().setLibraryToImport({target: {value: 'id'}});
    expect(wrapper.state().importLibraryId).to.equal('id');
    window.dashboard.project.getProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
  });

  it('removeLibrary calls setProjectLibrary without the given library', () => {
    sinon
      .stub(window.dashboard.project, 'getProjectLibraries')
      .returns([{name: 'first'}, {name: 'second'}]);
    sinon.stub(LibraryClientApi.prototype, 'getClassLibraries');
    let setProjectLibraries = sinon.spy(
      window.dashboard.project,
      'setProjectLibraries'
    );
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(setProjectLibraries.notCalled).to.be.true;
    wrapper.instance().removeLibrary('first');
    expect(setProjectLibraries.withArgs([{name: 'second'}]).calledOnce).to.be
      .true;
    window.dashboard.project.getProjectLibraries.restore();
    window.dashboard.project.setProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
  });
});
