require_relative '../test_helper'
require 'cdo/i18n'

class CdoI18nTest < Minitest::Test
  # The fixtures below are real entries from config/i18n/localizejs.yml. If that
  # file changes, update the expectations here to match.

  def test_localize_project_key_matches_a_course_prefix
    assert_equal 'MlKri360o3v2T', Cdo::I18n.localize_project_key('/courses/csd-2024')
  end

  def test_localize_project_key_matches_a_path_below_the_prefix
    assert_equal 'MlKri360o3v2T', Cdo::I18n.localize_project_key('/courses/csd-2024/units/1/lessons/2')
  end

  def test_localize_project_key_tolerates_a_leading_locale_or_region_segment
    # e.g. Global Edition / locale-prefixed URLs.
    assert_equal 'zM53S8yC4TNgU', Cdo::I18n.localize_project_key('/fa/courses/oceans')
    assert_equal '3vPUSGZrdllW2', Cdo::I18n.localize_project_key('/es-MX/courses/coursea-2024/x')
  end

  def test_localize_project_key_does_not_match_disabled_dashboard_routes
    # The "Dashboard / teacher tools" common-areas project (XJXXkBlsAbHVD) is
    # commented out in config/i18n/localizejs.yml for now, so these routes do not
    # resolve to a LocalizeJS project. Re-enable that entry -- and restore the
    # XJXXkBlsAbHVD assertions -- when common areas are turned back on.
    assert_nil Cdo::I18n.localize_project_key('/home')
    assert_nil Cdo::I18n.localize_project_key('/users/sign_in')
    assert_nil Cdo::I18n.localize_project_key('/teacher_dashboard/sections/1')
  end

  def test_localize_project_key_returns_nil_for_unlisted_paths
    assert_nil Cdo::I18n.localize_project_key('/courses/not-a-real-course')
    assert_nil Cdo::I18n.localize_project_key('/dashboardapi/section/1')
    assert_nil Cdo::I18n.localize_project_key('/')
  end

  def test_localize_project_key_does_not_match_a_prefix_in_a_later_segment
    # The prefix must anchor at the start (after an optional leading segment),
    # not appear arbitrarily deep in the path.
    assert_nil Cdo::I18n.localize_project_key('/foo/bar/courses/csd-2024')
  end

  def test_localize_project_key_matches_a_global_edition_region_path
    # e.g. the Latin American edition serves /la/courses/oceans.
    assert_equal 'zM53S8yC4TNgU', Cdo::I18n.localize_project_key('/la/courses/oceans')
  end

  def test_every_configured_project_key_round_trips_through_its_prefixes
    Cdo::I18n::LOCALIZE_PROJECTS.each do |project_key, prefixes|
      prefixes.each do |prefix|
        assert_equal project_key, Cdo::I18n.localize_project_key(prefix),
          "expected #{prefix.inspect} to resolve to #{project_key.inspect}"
      end
    end
  end

  def test_intended_locale_falls_back_to_i18n_locale_when_unset
    Cdo::I18n.intended_locale = nil
    assert_equal ::I18n.locale.to_s, Cdo::I18n.intended_locale
  end

  def test_intended_locale_returns_the_recorded_locale_over_i18n_locale
    # Mirrors a LocalizeJS render: the intended locale (es-LA) is recorded even
    # though the page itself renders in another (English) locale.
    Cdo::I18n.intended_locale = 'es-LA'
    assert_equal 'es-LA', Cdo::I18n.intended_locale
    refute_equal ::I18n.locale.to_s, Cdo::I18n.intended_locale
  ensure
    Cdo::I18n.intended_locale = nil
  end

  def test_intended_locale_setter_stringifies_symbols_and_clears
    Cdo::I18n.intended_locale = :'es-LA'
    assert_equal 'es-LA', Cdo::I18n.intended_locale

    Cdo::I18n.intended_locale = nil
    assert_equal ::I18n.locale.to_s, Cdo::I18n.intended_locale
  end
end
