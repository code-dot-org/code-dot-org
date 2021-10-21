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
end
