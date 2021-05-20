# A module for overriding course and script versioning redirects.
#
# These overrides are stored as an array of course/script names
# in the Rails session as follows:
# Course overrides: session[:course_version_overrides] => ['csd-2017']
# Script overrides: session[:script_version_overrides] => ['coursea-2017']
#
# Overrides are checked when a user visits courses#show, scripts#show, and script_levels#show.
# Given the example above, a user would *not* be redirected to a different version when
# visiting a course (optional), script, or level in csd-2017 or coursea-2017.
module VersionRedirectOverrider
  def self.script_version_overrides(session)
    session[:script_version_overrides] ||= []
    session[:script_version_overrides]
  end

  def self.course_version_overrides(session)
    session[:course_version_overrides] ||= []
    session[:course_version_overrides]
  end

  def self.set_script_redirect_override(session, script_name)
    overrides = script_version_overrides(session)
    unless script_name.blank? || overrides.include?(script_name)
      overrides << script_name
    end
  end

  def self.set_course_redirect_override(session, course_name)
    overrides = course_version_overrides(session)
    unless course_name.blank? || overrides.include?(course_name)
      overrides << course_name
    end
  end

  def self.override_script_redirect?(session, script)
    script_overrides = script_version_overrides(session)
    course_overrides = course_version_overrides(session)

    script_overrides.include?(script.name) || course_overrides.include?(script.unit_group&.name)
  end

  def self.override_course_redirect?(session, course)
    overridden_course_scripts = course.default_scripts.map(&:name) & script_version_overrides(session)
    course_version_overrides(session).include?(course.name) || !overridden_course_scripts.empty?
  end
end
