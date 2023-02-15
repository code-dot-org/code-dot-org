export const fakeTeacherSectionsForDropdown = [
  {
    name: 'Initally Selected Section',
    id: 1,
    isAssigned: false,
    code: 'aaa',
    courseId: 0,
    courseOfferingId: 0,
    courseVersionId: 0,
    unitId: 0,
    participantType: 'student'
  },
  {
    name: 'Assigned Section',
    id: 2,
    isAssigned: true,
    code: 'bbb',
    courseId: 1,
    courseOfferingId: 1,
    courseVersionId: 1,
    unitId: 1,
    participantType: 'student'
  },
  {
    // review the courseId and courseofferings onward
    name: 'Unassigned Section',
    id: 3,
    isAssigned: false,
    code: 'ccc',
    courseId: null,
    courseOfferingId: null,
    courseVersionId: null,
    unitId: null,
    participantType: 'student'
  },
  {
    name: 'Assigned standalone unit',
    id: 4,
    isAssigned: true,
    courseId: 43,
    courseOfferingId: 165,
    courseVersionId: 379,
    unitId: null,
    code: 'ddd',
    participantType: 'student'
  },
  {
    name: 'Assigned course but not unit',
    id: 5,
    isAssigned: true,
    courseId: 43,
    courseOfferingId: 165,
    courseVersionId: 379,
    unitId: null,
    code: 'eee',
    participantType: 'student'
  },
  {
    name: 'Assigned course and unit',
    id: 6,
    isAssigned: true,
    courseId: 43,
    courseOfferingId: 165,
    courseVersionId: 379,
    unitId: 255,
    code: 'fff',
    participantType: 'student'
  },
  {
    name: 'Teacher facing audience section',
    id: 7,
    isAssigned: true,
    courseId: 2,
    courseOfferingId: 2,
    courseVersionId: 2,
    unitId: 2,
    code: 'eee',
    participantType: 'teacher'
  }
];
