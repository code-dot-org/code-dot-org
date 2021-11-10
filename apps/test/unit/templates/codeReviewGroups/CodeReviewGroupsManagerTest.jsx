import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import _ from 'lodash';
import CodeReviewGroupsManager, {
  getAssignedGroupDroppableId,
  DROPPABLE_ID_UNASSIGNED
} from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import AssignedStudentsPanel from '@cdo/apps/templates/codeReviewGroups/AssignedStudentsPanel';
import UnassignedStudentsPanel from '@cdo/apps/templates/codeReviewGroups/UnassignedStudentsPanel';
import {DragDropContext} from 'react-beautiful-dnd';

describe('Code Review Groups Manager', () => {
  let wrapper, assignedGroups, unassignedGroup, draggedMember;

  beforeEach(() => {
    // We are unable to get Enzyme's mount and React Beautiful DnD to work properly.
    // See this issue for more detail:
    // https://github.com/atlassian/react-beautiful-dnd/issues/1756
    // Ideally, we'd test this feature by mounting the CodeReviewGroupsManager component
    // and asserting on changes to the DOM.
    // Since we are at least able to shallow render it, we invoke event handlers
    // and assert on props representing the state of the code review groups
    // (assignedGroups and unassignedGroup).
    wrapper = shallow(<CodeReviewGroupsManager initialGroups={groups} />);
    assignedGroups = wrapper.find(AssignedStudentsPanel).props().groups;
    unassignedGroup = wrapper.find(UnassignedStudentsPanel).props()
      .unassignedGroup;

    // Pick an arbitrary group member to drag around.
    draggedMember = assignedGroups[0].members[1];
  });

  it('moves group member between code review groups', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
      destination: {droppableId: getAssignedGroupDroppableId(2), index: 1}
    };

    expect(assignedGroups[0].members.length).to.equal(4);
    expect(assignedGroups[1].members.length).to.equal(4);
    expect(assignedGroups[0].members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);

    expect(assignedGroups[0].members.length).to.equal(3);
    expect(assignedGroups[1].members.length).to.equal(5);
    expect(assignedGroups[1].members[1].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('moves group member within group', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
      destination: {droppableId: getAssignedGroupDroppableId(1), index: 0}
    };

    expect(assignedGroups[0].members.length).to.equal(4);
    expect(assignedGroups[0].members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);

    expect(assignedGroups[0].members.length).to.equal(4);
    expect(assignedGroups[0].members[0].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('does not move any members when drag ends outside draggable area', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1}
    };

    expect(assignedGroups[0].members.length).to.equal(4);
    expect(assignedGroups[0].members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);

    expect(assignedGroups[0].members.length).to.equal(4);
    expect(assignedGroups[0].members[1].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('moves group member to unassigned area', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
      destination: {droppableId: DROPPABLE_ID_UNASSIGNED, index: 0}
    };

    expect(assignedGroups[0].members.length).to.equal(4);
    expect(unassignedGroup.members.length).to.equal(4);
    expect(assignedGroups[0].members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);

    expect(assignedGroups[0].members.length).to.equal(3);
    expect(unassignedGroup.members.length).to.equal(5);
    expect(unassignedGroup.members[0].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('moves group member from unassigned area to code review group', () => {
    const dragResult = {
      source: {droppableId: DROPPABLE_ID_UNASSIGNED, index: 1},
      destination: {droppableId: getAssignedGroupDroppableId(1), index: 0}
    };

    draggedMember = unassignedGroup.members[1];

    expect(unassignedGroup.members.length).to.equal(4);
    expect(assignedGroups[0].members.length).to.equal(4);
    expect(unassignedGroup.members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);

    expect(unassignedGroup.members.length).to.equal(3);
    expect(assignedGroups[0].members.length).to.equal(5);
    expect(assignedGroups[0].members[0].followerId).to.equal(
      draggedMember.followerId
    );
  });
});

// Fake data generator.
// Returns an array of objects that can be used to render a group.
const getMembers = (startId, endId, offset = 0) =>
  _.range(startId, endId).map(id => {
    return {followerId: id + offset, name: `fakeName${id + offset}`};
  });

const groups = [
  {id: 1, members: getMembers(1, 5)},
  {id: 2, members: getMembers(5, 9)},
  {id: 3, members: getMembers(9, 13), unassigned: true}
];
