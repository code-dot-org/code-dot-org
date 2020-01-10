import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import LibraryManagerDialog from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import sinon from 'sinon';

describe('LibraryManagerDialog', () => {
  const ID = 123;
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
});
