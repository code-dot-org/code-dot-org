module SharedCourseConstants
  # Used to determine who can access curriculum content
  PUBLISHED_STATE = OpenStruct.new(
    {
      in_development: "in_development",
      pilot: "pilot",
      beta: "beta",
      preview: "preview",
      stable: "stable",
      sunsetting: "sunsetting",
      deprecated: "deprecated"
    }
  ).freeze

  # Used to determine style a course is taught in
  INSTRUCTION_TYPE = OpenStruct.new(
    {
      teacher_led: "teacher_led",
      self_paced: "self_paced"
    }
  ).freeze

  # Used to determine who can teach a course
  INSTRUCTOR_AUDIENCE = OpenStruct.new(
    {
      universal_instructor: "universal_instructor",
      plc_reviewer: "plc_reviewer",
      facilitator: "facilitator",
      teacher: "teacher"
    }
  ).freeze

  # Used to determine who the learners are in a course
  PARTICIPANT_AUDIENCE = OpenStruct.new(
    {
      facilitator: "facilitator",
      teacher: "teacher",
      student: "student"
    }
  ).freeze

  # An allowlist of all curriculum umbrellas for scripts.
  CURRICULUM_UMBRELLA = OpenStruct.new(
    {
      CSF: 'CSF',
      CSD: 'CSD',
      CSP: 'CSP',
      CSA: 'CSA',
      CSC: 'CSC',
      HOC: 'HOC',
      CSA_self_paced_pl: 'CSA Self Paced PL',
      CSP_self_paced_pl: 'CSP Self Paced PL',
      CSD_self_paced_pl: 'CSD Self Paced PL',
      CSF_self_paced_pl: 'CSF Self Paced PL',
      CSP_virtual_pl: 'CSP Virtual PL',
      CSD_virtual_pl: 'CSD Virtual PL',
      student_self_paced: 'Student Self Paced Courses'
    }
  ).freeze

  # All the categories options used to group course offerings in the assignment dropdown
  COURSE_OFFERING_CATEGORIES = OpenStruct.new(
    pl_self_paced: 'Self-Paced Professional Learning',
    pl_virtual: 'Virtual Professional Learning',
    pl_other: 'Other Professional Learning',
    full_course: 'Full Courses',
    csf: 'CS Fundamentals',
    csc: 'CS Connections',
    aiml: 'AI/ML',
    hoc: 'Hour of Code',
    csf_international: 'CS Fundamentals International',
    math: 'Math',
    twenty_hour: '20-hour',
    other: 'Other'
  ).freeze

  # Sections have a participant_type and courses have a participant_audience. A section
  # should never be assigned a course where the participants in the section can not be
  # participants in the course. There this will tell you give the participant_audience of the
  # course what the valid participant_types of a section are.
  PARTICIPANT_AUDIENCES_BY_TYPE = OpenStruct.new(
    {
      student: ['student'],
      teacher: ['student', 'teacher'],
      facilitator: ['student', 'teacher', 'facilitator']
    }
  ).freeze
end
