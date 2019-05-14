module VersionRedirectOverrider
  def script_version_overrides
    session[:script_version_overrides] ||= []
    session[:script_version_overrides]
  end

  def course_version_overrides
    session[:course_version_overrides] ||= []
    session[:course_version_overrides]
  end

  def set_script_redirect_override(script_name)
    unless script_name.blank? || script_version_overrides.include?(script_name)
      session[:script_version_overrides] << script_name
    end
  end

  def set_course_redirect_override(course_name)
    unless course_name.blank? || course_version_overrides.include?(course_name)
      session[:course_version_overrides] << course_name
    end
  end

  def override_script_redirect?(script)
    script_version_overrides.include?(script.name) || course_version_overrides.include?(script.course&.name)
  end

  def override_course_redirect?(course)
    overridden_course_scripts = course.default_scripts.map(&:name) & script_version_overrides
    course_version_overrides.include?(course.name) || !overridden_course_scripts.empty?
  end
end
