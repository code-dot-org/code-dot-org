class Services::Courses
  MODULARITY_PILOT = 'modularity'

  # This method returns the canonical version of a given path related to a UnitGroup/Course
  # for example given a /s/.../ URL it will return the appropriate /courses/.../units/...
  # URL because /s/.../ is being deprecated.
  #
  # @param path [String] the original URL path to transform
  # @param params [Hash] a `params` Hash provided to a Controller.
  # @param current_user [User] the currently authenticated user object, used for experiment checks
  # @return [String] the transformed canonical path if applicable, or the original path if no transformation is made
  def self.canonical_path(path, params, current_user)
    return path unless Experiment.enabled?(user: current_user, experiment_name: MODULARITY_PILOT)

    # :script_id is defined only for /s/ URLs
    script_name = params[:script_id] || params[:id]
    return path unless script_name

    # URLs is /s/:script_id/... so generate a /courses/... URL
    course_context = Queries::Courses.get_course_context(script_name)
    return path unless course_context

    course_name = course_context[:course].name
    unit_position = course_context[:unit_group_unit].position

    # Replace /s/.../ with /courses/.../units/.../
    path.sub(/\/s\/#{script_name}/, "/courses/#{course_name}/units/#{unit_position}")
  end
end
