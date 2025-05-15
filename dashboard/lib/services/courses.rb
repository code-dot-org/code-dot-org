class Services::Courses
  # This method returns the canonical version of a given path related to a UnitGroup/Course
  # for example given a /s/.../ URL it will return the appropriate /courses/.../units/...
  # URL because /s/.../ is being deprecated.
  #
  # @param path [String] the original URL path to transform
  # @param params [Hash] a `params` Hash provided to a Controller.
  # @param current_user [User] the currently authenticated user object, used for experiment checks
  # @return [String] the transformed canonical path if applicable, or the original path if no transformation is made
  def self.canonical_path(path, params, current_user)
    return path unless Policies::Courses.modularity_enabled?(current_user)

    # :script_id is defined only for /s/ URLs
    script_name = params[:script_id] || params[:id]
    return path unless script_name

    # URLs is /s/:script_id/... so generate a /courses/... URL
    course_context = Queries::Courses.get_course_context(script_name)
    course_name = course_context[:unit_group]&.name
    unit_position = course_context[:unit_group_unit]&.position

    return path unless course_name && unit_position

    # Replace /s/.../ with /courses/.../units/.../
    path.sub(/\/s\/#{script_name}/, "/courses/#{course_name}/units/#{unit_position}")
  end

  # Replaces /s/.../ url's with a nested url '/courses/.../units/.../
  # @param url [String] The url to get the nested version of
  # @param unit_group_unit [UnitGroupUnit] The UnitGroupUnit context for the URL.
  def self.canonical_url(url, unit_group_unit: nil)
    return url unless url && Policies::Courses.modularity_enabled? && unit_group_unit
    unit_group = unit_group_unit.unit_group
    unit = unit_group_unit.script
    url.sub(/\/s\/#{unit.name}/, "/courses/#{unit_group.name}/units/#{unit_group_unit.position}")
  end
end
