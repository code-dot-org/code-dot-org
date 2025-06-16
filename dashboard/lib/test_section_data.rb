class TestSectionData
  DEFAULT_TEACHER_EMAIL = 'test_teacher@code.org'
  DEFAULT_TEACHER_PASSWORD = 'test_password'
  DEFAULT_TEACHER_NAME = 'Teacher Generated'
  DEFAULT_SECTION_NAME = 'Generated Test Section'
  DEFAULT_NUM_STUDENTS = 10

  SAMPLE_STUDENT_NAME_FORMAT = 'Student%s Generated'.freeze
  SAMPLE_STUDENT_NAME_REGEX = /Student\d* Generated/

  DEFAULT_UNIT = 'csp4-2024'
  DEFAULT_UNIT_GROUP = 'csp-2024'

  STUDENT_CODE_1 = "//Code was generated
// Creating variables
var petName;
var petType;
var petWeight;

// Assigning values to variables. You can change the numbers
// and strings assigned here if you want!
petNames = \"Jack\";
petType = \"Iguana\";
petWeight = 60;

// My story
console.log(\"This is a story about my pet named\");
console.log(petNames);

console.log(\"It's a lot of work owning a\");
console.log(petType);

console.log(\"Especially because it weighs about\");
console.log(petWeight);
console.log(\"pounds!\");

console.log(\"I love\");
console.log(petNames);

console.log(\"It's the best\");
console.log(petType);
console.log(\"in the world!\");

// Add three lines to the story here.
// Make sure to reference at least one variable."

  CSP_4_TEST_SECTION = {
    unit_name: 'csp4-2024',
    unit_group_name: 'csp-2024',
    school_year: '2024-25',
    grade: [10],
    age: 15,
    data_per_student: [{
      "CSP U4 Pre-Unit Pulse Q1_2024" => {
        user_level: {
          attempts: 1,
          best_result: 30
        },
        level_source: {
          data: 'test free response text',
        },
      },
      "CSP U4 My Pet Rock Example App_2024" => {
        user_level: {
          attempts: 1,
          best_result: 30,
          submitted: true,
          time_spent: 2,
        },
        teacher_feedback: {
          comment: 'test teacher feedback',
        },
      },
      "U1 L02 CYU MC2022_2024" => {
        user_level: {
          attempts: 1,
          best_result: 100
        },
      },
      "U4 L03 Variables numbers practice 4_2024" => {
        user_level: {
          attempts: 1,
          best_result: 100
        },
        teacher_feedback: {
          comment: 'test teacher feedback',
        },
        source_code: {
          source: STUDENT_CODE_1,
        },
      },
      "U4 L03 Variables operator practice 5_2024" => {
        user_level: {
          attempts: 1,
          best_result: 30
        }
      },
    }, {
      "CSP U4 Pre-Unit Pulse Q1_2024" => {
        user_level: {
          attempts: 1,
          best_result: 30
        },
        level_source: {
          data: 'test free response text',
        },
      },
      "U1 L02 CYU MC2022_2024" => {
        user_level: {
          attempts: 1,
          best_result: 100
        },
      },
      "U4 L03 Variables numbers practice 4_2024" => {
        user_level: {
          attempts: 1,
          best_result: 100
        },
        teacher_feedback: {
          comment: 'test teacher feedback',
        }
      },
      "U4 L03 Variables operator practice 5_2024" => {
        user_level: {
          attempts: 1,
          best_result: 30
        }
      },
    }]
  }
end
