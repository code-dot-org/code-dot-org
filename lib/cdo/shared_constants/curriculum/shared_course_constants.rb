module SharedCourseConstants
  # Used to determine who can access curriculum content
  PUBLISHED_STATE = OpenStruct.new(
    {
      in_development: "in_development",
      pilot: "pilot",
      beta: "beta",
      preview: "preview",
      stable: "stable"
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
      code_instructor: "code_instructor",
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
end
