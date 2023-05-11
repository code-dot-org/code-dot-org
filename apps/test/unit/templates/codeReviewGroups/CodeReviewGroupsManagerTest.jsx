import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import _ from 'lodash';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import {
  getAssignedGroupDroppableId,
  DROPPABLE_ID_UNASSIGNED,
} from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsUtils';
import AssignedStudentsPanel from '@cdo/apps/templates/codeReviewGroups/AssignedStudentsPanel';
import UnassignedStudentsPanel from '@cdo/apps/templates/codeReviewGroups/UnassignedStudentsPanel';
import {DragDropContext} from 'react-beautiful-dnd';

describe('Code Review Groups Manager', () => {
  let wrapper,
    draggedMember,
    confirmDefaultBeforeActionExpectations,
    getAssignedGroup,
    getUnassignedGroup,
    groups,
    setGroups;

  beforeEach(() => {
    // We are unable to get Enzyme's mount and React Beautiful DnD to work properly.
    // See this issue for more detail:
    // https://github.com/atlassian/react-beautiful-dnd/issues/1756
    // Ideally, we'd test this feature by mounting the CodeReviewGroupsManager component
    // and asserting on changes to the DOM.
    // Since we are at least able to shallow render it, we invoke event handlers
    // and assert on props representing the state of the code review groups
    // (assignedGroups and unassignedGroup).
    groups = _.cloneDeep(DEFAULT_GROUPS);
    setGroups = newGroups => {
      groups = newGroups;
    };

    wrapper = shallow(
      <CodeReviewGroupsManager groups={groups} setGroups={setGroups} />
    );
    getAssignedGroup = index =>
      wrapper.find(AssignedStudentsPanel).props().groups[index];
    getUnassignedGroup = () =>
      wrapper.find(UnassignedStudentsPanel).props().unassignedGroup;

    // Pick an arbitrary group member to drag around.
    draggedMember = getAssignedGroup(0).members[1];

    confirmDefaultBeforeActionExpectations = () => {
      expect(getUnassignedGroup().members.length).to.equal(4);
      expect(getAssignedGroup(0).members.length).to.equal(4);
      expect(getAssignedGroup(1).members.length).to.equal(4);
    };
  });

  it('moves group member between code review groups', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
      destination: {droppableId: getAssignedGroupDroppableId(2), index: 1},
    };

    confirmDefaultBeforeActionExpectations();
    expect(getAssignedGroup(0).members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);
    wrapper.setProps({groups: groups});

    expect(getAssignedGroup(0).members.length).to.equal(3);
    expect(getAssignedGroup(1).members.length).to.equal(5);
    expect(getAssignedGroup(1).members[1].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('moves group member within group', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
      destination: {droppableId: getAssignedGroupDroppableId(1), index: 0},
    };

    confirmDefaultBeforeActionExpectations();
    expect(getAssignedGroup(0).members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);
    wrapper.setProps({groups: groups});

    expect(getAssignedGroup(0).members.length).to.equal(4);
    expect(getAssignedGroup(0).members[0].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('does not move any members when drag ends outside draggable area', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
    };

    confirmDefaultBeforeActionExpectations();
    expect(getAssignedGroup(0).members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);
    wrapper.setProps({groups: groups});

    expect(getAssignedGroup(0).members.length).to.equal(4);
    expect(getAssignedGroup(0).members[1].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('moves group member to unassigned area', () => {
    const dragResult = {
      source: {droppableId: getAssignedGroupDroppableId(1), index: 1},
      destination: {droppableId: DROPPABLE_ID_UNASSIGNED, index: 0},
    };

    confirmDefaultBeforeActionExpectations();
    expect(getAssignedGroup(0).members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);
    wrapper.setProps({groups: groups});

    expect(getAssignedGroup(0).members.length).to.equal(3);
    expect(getUnassignedGroup().members.length).to.equal(5);
    expect(getUnassignedGroup().members[0].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('moves group member from unassigned area to code review group', () => {
    const dragResult = {
      source: {droppableId: DROPPABLE_ID_UNASSIGNED, index: 1},
      destination: {droppableId: getAssignedGroupDroppableId(1), index: 0},
    };

    draggedMember = getUnassignedGroup().members[1];

    confirmDefaultBeforeActionExpectations();
    expect(getUnassignedGroup().members[1].followerId).to.equal(
      draggedMember.followerId
    );

    wrapper.find(DragDropContext).invoke('onDragEnd')(dragResult);
    wrapper.setProps({groups: groups});

    expect(getUnassignedGroup().members.length).to.equal(3);
    expect(getAssignedGroup(0).members.length).to.equal(5);
    expect(getAssignedGroup(0).members[0].followerId).to.equal(
      draggedMember.followerId
    );
  });

  it('unassigns all group members', () => {
    confirmDefaultBeforeActionExpectations();
    wrapper.find(UnassignedStudentsPanel).invoke('onUnassignAllClick')();
    wrapper.setProps({groups: groups});

    expect(getUnassignedGroup().members.length).to.equal(12);
    expect(getAssignedGroup(0).members).to.be.empty;
    expect(getAssignedGroup(1).members).to.be.empty;
  });
});

// Fake data generator.
// Returns an array of objects that can be used to render a group.
const getMembers = (startId, endId, offset = 0) =>
  _.range(startId, endId).map(id => {
    return {followerId: id + offset, name: `fakeName${id + offset}`};
  });

const DEFAULT_GROUPS = [
  {
    id: 1,
    members: getMembers(1, 5),
    droppableId: getAssignedGroupDroppableId(1),
  },
  {
    id: 2,
    members: getMembers(5, 9),
    droppableId: getAssignedGroupDroppableId(2),
  },
  {
    members: getMembers(9, 13),
    unassigned: true,
    droppableId: 'unassigned',
  },
];
