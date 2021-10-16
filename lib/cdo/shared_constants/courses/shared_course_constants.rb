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
end
