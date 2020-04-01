import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryManagerDialog, {
  mapUserNameToProjectLibraries
} from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import sinon from 'sinon';

describe('LibraryManagerDialog', () => {
  const ID = 123;
  const IMPORT_ERROR_MSG =
    'An error occurred while importing your library. Please make sure you have a valid ID and an internet connection.';

  describe('viewCode', () => {
    it('sets the view library', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {foo: 'bar'};
      expect(wrapper.state().viewingLibrary).to.deep.equal({});
      expect(wrapper.state().isViewingCode).to.be.false;
      wrapper.instance().viewCode(library);
      expect(wrapper.state().isViewingCode).to.be.true;
      expect(wrapper.state().viewingLibrary).to.deep.equal(library);
    });
  });

  describe('cachedClassLibraries', () => {
    it('are cleared onClose', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {channelId: ID};
      wrapper.setState({cachedClassLibraries: [library]});
      expect(wrapper.state().cachedClassLibraries).to.deep.equal([library]);
      wrapper.instance().closeLibraryManager();
      expect(wrapper.state().cachedClassLibraries).to.be.empty;
    });

    it('are used by fetchLatestLibrary', () => {
      let callback = sinon.fake();
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      let library = {channelId: ID};
      wrapper.setState({cachedClassLibraries: [library]});
      wrapper.instance().fetchLatestLibrary(ID, callback);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWith(library);
    });

    it('are set by fetchLatestLibrary', () => {
      let library = {channelId: ID};
      let callback = sinon.fake();
      sinon.stub(libraryParser, 'prepareLibraryForImport').returns(library);
      sinon
        .stub(LibraryClientApi.prototype, 'fetchByVersion')
        .callsArgWith(1, library);
      sinon
        .stub(LibraryClientApi.prototype, 'fetchLatestVersionId')
        .callsArgWith(0, ID);

      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().fetchLatestLibrary(ID, callback);
      expect(wrapper.state().cachedClassLibraries).to.deep.equal([library]);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWith(library);

      LibraryClientApi.prototype.fetchLatestVersionId.restore();
      LibraryClientApi.prototype.fetchByVersion.restore();
      libraryParser.prepareLibraryForImport.restore();
    });
  });

  describe('With call to onOpen', () => {
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
      expect(wrapper.state().projectLibraries).to.have.lengthOf(2);
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
      expect(wrapper.state().projectLibraries).to.have.lengthOf(0);
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
      expect(wrapper.state().projectLibraries).to.have.lengthOf(2);
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

    it('setLibraryToImport resets the error in state to null', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      wrapper.instance().setState({error: IMPORT_ERROR_MSG});

      wrapper.instance().setLibraryToImport({target: {value: 'id'}});
      expect(wrapper.state().error).to.be.null;
    });

    it('addLibraryById adds the library to the project if given libraryJson', () => {
      let setProjectLibrariesSpy = sinon.spy(
        window.dashboard.project,
        'setProjectLibraries'
      );
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      const library = {libraryName: 'my favorite library'};

      wrapper.instance().addLibraryById(library, null);
      expect(setProjectLibrariesSpy).to.have.been.called;
      setProjectLibrariesSpy.restore();
    });

    it('addLibraryById sets an error in state if given an error', () => {
      const wrapper = shallow(
        <LibraryManagerDialog onClose={() => {}} isOpen={true} />
      );
      expect(wrapper.state().error).to.be.null;
      wrapper.instance().addLibraryById(null, 'an error occurred!');
      expect(wrapper.state().error).to.equal(IMPORT_ERROR_MSG);
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

  describe('mapUserNameToProjectLibraries', () => {
    it('maps userName from classLibraries to project libraries', () => {
      const projectLibraries = [{channelId: '123456'}, {channelId: '654321'}];
      const classLibraries = [{channel: '123456', userName: 'Library Author'}];

      const mappedProjectLibraries = mapUserNameToProjectLibraries(
        projectLibraries,
        classLibraries
      );

      expect(mappedProjectLibraries[0].userName).to.equal('Library Author');
      expect(mappedProjectLibraries[1].userName).to.be.undefined;
    });
  });
});
