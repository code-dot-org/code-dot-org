require 'test_helper'

class VersionRedirectOverriderTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)

    @script = create :script
    @unit_group = create :unit_group
    create :unit_group_unit, unit_group: @unit_group, script: @script, position: 1
  end

  setup do
    @session = {}
  end

  test 'set_script_redirect_override adds script to session overrides' do
    VersionRedirectOverrider.set_script_redirect_override(@session, 'coursea-2017')
    assert_equal ['coursea-2017'], @session[:script_version_overrides]
  end

  test 'set_script_redirect_override does not add script to script_version_overrides if already present' do
    VersionRedirectOverrider.set_script_redirect_override(@session, 'coursea-2017')
    VersionRedirectOverrider.set_script_redirect_override(@session, 'coursea-2017')
    assert_equal ['coursea-2017'], @session[:script_version_overrides]
  end

  test 'set_course_redirect_override adds script to course_version_overrides in session' do
    VersionRedirectOverrider.set_course_redirect_override(@session, 'csd-2017')
    assert_equal ['csd-2017'], @session[:course_version_overrides]
  end

  test 'set_course_redirect_override does not add script to course_version_overrides if already present' do
    VersionRedirectOverrider.set_course_redirect_override(@session, 'csd-2017')
    VersionRedirectOverrider.set_course_redirect_override(@session, 'csd-2017')
    assert_equal ['csd-2017'], @session[:course_version_overrides]
  end

  test 'override_script_redirect? is true if script name is present in script_version_overrides' do
    @session[:script_version_overrides] = [@script.name]
    assert VersionRedirectOverrider.override_script_redirect?(@session, @script)
  end

  test 'override_script_redirect? is true if script\'s course name is present in course_version_overrides' do
    @session[:course_version_overrides] = [@unit_group.name]
    assert VersionRedirectOverrider.override_script_redirect?(@session, @script)
  end

  test 'override_script_redirect? is false if neither script or course name are in session overrides' do
    refute VersionRedirectOverrider.override_script_redirect?(@session, @script)
  end

  test 'override_course_redirect? is true if course name is present in course_version_overrides' do
    @session[:course_version_overrides] = [@unit_group.name]
    assert VersionRedirectOverrider.override_course_redirect?(@session, @unit_group)
  end

  test 'override_course_redirect? is true any default script name is present in script_version_overrides' do
    @session[:script_version_overrides] = [@script.name]
    assert VersionRedirectOverrider.override_course_redirect?(@session, @unit_group)
  end

  test 'override_course_redirect? is false if neither course or any script name are in session overrides' do
    refute VersionRedirectOverrider.override_course_redirect?(@session, @unit_group)
  end
end
