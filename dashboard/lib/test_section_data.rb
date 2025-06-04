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

  CSP_4_TEST_SECTION = {
    unit_name: 'csp4-2024',
    unit_group_name: 'csp-2024',
    grade: [10],
    age: 15,
  }
end
