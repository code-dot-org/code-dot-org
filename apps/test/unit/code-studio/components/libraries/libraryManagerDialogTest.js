import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryManagerDialog from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import sinon from 'sinon';

describe('LibraryManagerDialog', () => {
  let getProjectLibrariesStub, getClassLibrariesStub;
  beforeEach(() => {
    replaceOnWindow('dashboard', {
      project: {
        getProjectLibraries: () => {},
        setProjectLibraries: () => {}
      }
    });
    getProjectLibrariesStub = sinon.stub(
      window.dashboard.project,
      'getProjectLibraries'
    );
    getClassLibrariesStub = sinon.stub(
      LibraryClientApi.prototype,
      'getClassLibraries'
    );
  });

  afterEach(() => {
    window.dashboard.project.getProjectLibraries.restore();
    LibraryClientApi.prototype.getClassLibraries.restore();
    restoreOnWindow('dashboard');
  });

  it('displays no LibraryListItem when no libraries exist', () => {
    getProjectLibrariesStub.returns(undefined);
    getClassLibrariesStub.returns(undefined);
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    expect(wrapper.find(LibraryListItem)).to.be.empty;
  });

  it('displays LibraryListItem when the project contains libraries', () => {
    getProjectLibrariesStub.returns([{name: 'first'}, {name: 'second'}]);
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
    expect(wrapper.state().classLibraries).to.have.lengthOf(0);
    expect(wrapper.state().libraries).to.have.lengthOf(2);
  });

  it('displays LibraryListItem when class libraries are available', () => {
    getProjectLibrariesStub.returns(undefined);
    getClassLibrariesStub.callsFake(callback =>
      callback([{channel: '1'}, {channel: '2'}])
    );
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(wrapper.find(LibraryListItem)).to.have.lengthOf(2);
    expect(wrapper.state().classLibraries).to.have.lengthOf(2);
    expect(wrapper.state().libraries).to.have.lengthOf(0);
  });

  it('displays all libraries from the project and the class', () => {
    getProjectLibrariesStub.returns([{name: 'first'}, {name: 'second'}]);
    getClassLibrariesStub.callsFake(callback =>
      callback([{channel: '1'}, {channel: '2'}])
    );
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    expect(wrapper.find(LibraryListItem)).to.have.lengthOf(4);
    expect(wrapper.state().classLibraries).to.have.lengthOf(2);
    expect(wrapper.state().libraries).to.have.lengthOf(2);
  });

  it('setLibraryToImport sets the import library', () => {
    getProjectLibrariesStub.returns(undefined);
    const wrapper = shallow(
      <LibraryManagerDialog onClose={() => {}} isOpen={true} />
    );
    wrapper.instance().onOpen();
    wrapper.instance().setLibraryToImport({target: {value: 'id'}});
    expect(wrapper.state().importLibraryId).to.equal('id');
  });

  it('removeLibrary calls setProjectLibrary without the given library', () => {
    getProjectLibrariesStub.returns([{name: 'first'}, {name: 'second'}]);
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
    window.dashboard.project.setProjectLibraries.restore();
  });
});
