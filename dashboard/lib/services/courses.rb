class Services::Courses
  # This method returns the canonical version of a given path related to a UnitGroup/Course
  # for example given a /s/.../ URL it will return the appropriate /courses/.../units/...
  # URL because /s/.../ is being deprecated.
  #
  # @param path [String] the original URL path to transform
  # @param unit_name_or_id [String, Integer] the Unit id or name.
  # @param current_user [User] the currently authenticated user object, used for experiment checks
  # @return [String] the transformed canonical path if applicable, or the original path if no transformation is made
  def self.canonical_path(path, unit_name_or_id, current_user)
    return path unless Policies::Courses.modularity_enabled?(current_user)
    return path unless unit_name_or_id

    # URLs is /s/:unit_id/... so generate a /courses/... URL
    course_context = Queries::Courses.get_course_context(unit_name_or_id)
    course_name = course_context[:unit_group]&.name
    unit_position = course_context[:unit_group_unit]&.position

    return path unless course_name && unit_position

    # Replace /s/.../ with /courses/.../units/.../
    path.sub(/\/s\/#{unit_name_or_id}/, "/courses/#{course_name}/units/#{unit_position}")
  end
end
