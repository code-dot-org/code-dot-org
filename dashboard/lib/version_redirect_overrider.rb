module VersionRedirectOverrider
  def get_script_version_overrides
    session[:script_version_overrides] ||= []
    session[:script_version_overrides]
  end

  def get_course_version_overrides
    session[:course_version_overrides] ||= []
    session[:course_version_overrides]
  end

  def set_override(script_name, course_name)
    unless script_name.blank? || get_script_version_overrides.include?(script_name)
      session[:script_version_overrides] << script_name
    end

    unless course_name.blank? || get_course_version_overrides.include?(course_name)
      session[:course_version_overrides] << course_name
    end
  end

  def set_script_redirect_override(script_name)
    return unless params[:no_redirect]
    set_override(script_name, nil) # TODO: get course_name and set override
  end

  def set_course_redirect_override(course_name)
    return unless params[:no_redirect]
    set_override(nil, course_name)
  end

  def override_redirect_for_script?(script)
    get_script_version_overrides.include?(script.name) || get_course_version_overrides.include?(script.course&.name)
  end

  def override_redirect_for_course?(course)
    get_course_version_overrides.include?(course.name)
  end
end
