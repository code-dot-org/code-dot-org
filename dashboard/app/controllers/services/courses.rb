class Services::Courses
  MODULARITY_PILOT = 'modularity'
  # Given a request to a /s/ or /courses/ URL, returns the URL the user should
  # be on.
  def self.canonical_path(request, params, current_user)
    request.fullpath unless Experiment.enabled?(user: current_user, experiment_name: MODULARITY_PILOT)

    # :script_id is defined only for /s/ URLs
    script_name = params[:script_id] || params[:id]
    return request.fullpath unless script_name

    # URLs is /s/:script_id/... so generate a /courses/... URL
    course_context = Queries::Courses.get_course_context(script_name)
    return request.fullpath unless course_context

    course_name = course_context[:course].name
    unit_position = course_context[:unit_group_unit].position

    # Replace /s/.../ with /courses/.../units/.../
    request.fullpath.sub(/\/s\/#{script_name}/, "/courses/#{course_name}/units/#{unit_position}")
  end
end
