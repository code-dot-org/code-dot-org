// some arbitrary data in a form we expect to receive from the server
// We get this from our call to /api/lock_status
const section1Id = 42;
const section2Id = 43;
const lesson1Id = 12;

const fakeSectionData = {
  [section1Id]: {
    section_id: section1Id,
    section_name: 'My Section',
    lessons: {
      [lesson1Id]: [
        // locked
        {
          locked: true,
          name: 'student1',
          user_level_data: {
            user_id: 1001,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: false
        },
        // unlocked
        {
          locked: false,
          name: 'student2',
          user_level_data: {
            user_id: 1002,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: false
        },
        // view answers
        {
          locked: false,
          name: 'student3',
          user_level_data: {
            user_id: 1003,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: true
        }
      ]
    }
  },
  [section2Id]: {
    section_id: section2Id,
    section_name: 'My Other Section',
    lessons: {
      [lesson1Id]: [
        {
          locked: true,
          name: 'student4',
          user_level_data: {
            user_id: 1004,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: false
        }
      ]
    }
  }
};

export default fakeSectionData;
