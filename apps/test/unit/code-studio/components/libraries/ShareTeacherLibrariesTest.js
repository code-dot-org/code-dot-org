import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {ShareTeacherLibraries} from '@cdo/apps/code-studio/components/libraries/ShareTeacherLibraries.jsx';
import sinon from 'sinon';

describe('ShareTeacherLibraries', () => {
  const SECTIONS = [{id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'}];
  const DEFAULT_PROPS = {
    onCancel: () => {},
    sections: SECTIONS,
    personalProjectsList: [],
    asyncLoadSectionData: () => {},
    setPersonalProjects: () => {},
    updateProjectLibrary: () => {},
    loadingFinished: true
  };

  describe('assignLibrary', () => {
    it('sets the shared sections to the currently selected sections', () => {
      let updateProjectLibrary = sinon.spy();
      const selectedSections = [{id: 1}, {id: 2}];
      const selectedLibraryId = 'abc';
      const props = {
        ...DEFAULT_PROPS,
        updateProjectLibrary: updateProjectLibrary
      };
      const wrapper = shallow(<ShareTeacherLibraries {...props} />);
      wrapper.setState({
        selectedSections: selectedSections,
        selectedLibraryId: selectedLibraryId
      });
      wrapper.instance().assignLibrary();
      expect(wrapper.state().sharedSections).to.deep.equal(selectedSections);
      expect(updateProjectLibrary).to.have.been.calledWith(selectedLibraryId, {
        sharedWith: [1, 2]
      });
    });
  });

  describe('onChooseOption', () => {
    it('sets shared and selected sections', () => {
      const channel = 'abc';
      const personalProjectsList = [{channel: channel, sharedWith: [1, 2]}];
      const props = {
        ...DEFAULT_PROPS,
        personalProjectsList: personalProjectsList
      };
      const wrapper = shallow(<ShareTeacherLibraries {...props} />);
      wrapper.instance().onChooseOption({target: {value: channel}});
      expect(wrapper.state().selectedLibraryId).to.equal(channel);
      expect(wrapper.state().sharedSections).to.deep.equal(
        SECTIONS.slice(0, 2)
      );
      expect(wrapper.state().selectedSections).to.deep.equal(
        SECTIONS.slice(0, 2)
      );
    });
  });

  describe('onSelectAll', () => {
    it('sets all selectedSections when set to true', () => {
      const wrapper = shallow(<ShareTeacherLibraries {...DEFAULT_PROPS} />);
      wrapper.instance().onSelectAll(true);
      expect(wrapper.state().selectedSections).to.equal(SECTIONS);
    });

    it('sets all selectedSections when set to true', () => {
      const wrapper = shallow(<ShareTeacherLibraries {...DEFAULT_PROPS} />);
      wrapper.setState({selectedSections: SECTIONS});
      wrapper.instance().onSelectAll(false);
      expect(wrapper.state().selectedSections).to.deep.equal([]);
    });
  });

  describe('onSectionSelected', () => {
    it('adds the given id to selectedSections', () => {
      const wrapper = shallow(<ShareTeacherLibraries {...DEFAULT_PROPS} />);
      wrapper.instance().onSectionSelected(1);
      expect(wrapper.state().selectedSections).to.deep.equal([SECTIONS[0]]);
    });

    it('removes the given id from selectedSections', () => {
      const wrapper = shallow(<ShareTeacherLibraries {...DEFAULT_PROPS} />);
      wrapper.setState({selectedSections: SECTIONS});
      wrapper.instance().onSectionSelected(3);
      expect(wrapper.state().selectedSections).to.deep.equal(
        SECTIONS.slice(0, 2)
      );
    });
  });
});
