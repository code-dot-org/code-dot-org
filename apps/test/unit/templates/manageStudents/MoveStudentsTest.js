import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import MoveStudents from '@cdo/apps/templates/manageStudents/MoveStudents';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studenta'},
  {id: 0, name: ''},
  {id: 2, name: 'studentf'}
];

describe('MoveStudents', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<MoveStudents studentData={studentData}/>);
  });

  describe('#openDialog', () => {
    it('sets isDialogOpen state to true', () => {
      wrapper.instance().openDialog();
      expect(wrapper.instance().state.isDialogOpen).to.equal(true);
    });
  });

  describe('#closeDialog', () => {
    it('sets isDialogOpen state to false', () => {
      wrapper.instance().isDialogOpen = true;
      wrapper.instance().closeDialog();
      expect(wrapper.instance().state.isDialogOpen).to.equal(false);
    });

    it('clears selectedIds in state', () => {
      wrapper.instance().state.selectedIds = [1,2];
      expect(wrapper.instance().state.selectedIds).to.have.members([1,2]);
      wrapper.instance().closeDialog();
      expect(wrapper.instance().state.selectedIds).to.have.members([]);
    });
  });

  describe('#getStudentIds', () => {
    it('returns all student ids', () => {
      expect(wrapper.instance().getStudentIds()).to.have.members([0,1,2,3]);
    });
  });

  describe('#areAllSelected', () => {
    it('returns true if all student ids are in selectedIds', () => {
      wrapper.instance().state.selectedIds = [0,1,2,3];
      expect(wrapper.instance().areAllSelected()).to.equal(true);
    });

    it('returns false if all student ids are not in selectedIds', () => {
      wrapper.instance().state.selectedIds = [0,1,2];
      expect(wrapper.instance().areAllSelected()).to.equal(false);
    });
  });

  describe('#toggleSelectAll', () => {
    it('clears selectedIds in state if all ids are selected', () => {
      wrapper.instance().state.selectedIds = [0,1,2,3];
      wrapper.instance().toggleSelectAll();
      expect(wrapper.instance().state.selectedIds).to.have.members([]);
    });

    it('adds all ids to selectedIds in state if some ids are selected', () => {
      wrapper.instance().state.selectedIds = [0,1];
      wrapper.instance().toggleSelectAll();
      expect(wrapper.instance().state.selectedIds).to.have.members([0,1,2,3]);
    });

    it('adds all ids to selectedIds in state if no ids are selected', () => {
      wrapper.instance().state.selectedIds = [];
      wrapper.instance().toggleSelectAll();
      expect(wrapper.instance().state.selectedIds).to.have.members([0,1,2,3]);
    });
  });

  describe('#toggleStudentSelected', () => {
    it('removes student id from selectedIds in state if already present', () => {
      wrapper.instance().state.selectedIds = [1];
      wrapper.instance().toggleStudentSelected(1);
      expect(wrapper.instance().state.selectedIds).to.have.members([]);
    });

    it('adds student id to selectedIds in state if not already present', () => {
      wrapper.instance().state.selectedIds = [1];
      wrapper.instance().toggleStudentSelected(0);
      expect(wrapper.instance().state.selectedIds).to.have.members([0,1]);
    });
  });
});
