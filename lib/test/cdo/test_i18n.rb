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

  def test_localize_project_key_matches_dashboard_routes
    assert_equal 'XJXXkBlsAbHVD', Cdo::I18n.localize_project_key('/home')
    assert_equal 'XJXXkBlsAbHVD', Cdo::I18n.localize_project_key('/users/sign_in')
    assert_equal 'XJXXkBlsAbHVD', Cdo::I18n.localize_project_key('/teacher_dashboard/sections/1')
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

  def test_localize_locale_code_maps_i18n_locales_to_localizejs_codes
    assert_equal 'zh-Hans', Cdo::I18n.localize_locale_code('zh-CN')
    assert_equal 'fr', Cdo::I18n.localize_locale_code('fr-FR')
    assert_equal 'en', Cdo::I18n.localize_locale_code('en-US')
  end

  def test_localize_locale_code_passes_global_edition_locales_through
    # es-LA's LocalizeJS code is itself; this is the LatAm Global Edition.
    assert_equal 'es-LA', Cdo::I18n.localize_locale_code('es-LA')
  end

  def test_localize_locale_code_accepts_symbols_and_falls_back_to_the_locale
    assert_equal 'zh-Hans', Cdo::I18n.localize_locale_code(:'zh-CN')
    # An unknown locale falls back to itself rather than raising.
    assert_equal 'xx-YY', Cdo::I18n.localize_locale_code('xx-YY')
  end

  def test_localize_locale_code_is_the_inverse_of_the_localizejs_mapping
    Cdo::I18n::LOCALIZE_TO_I18N_LOCALES.each do |localize_code, i18n_locale|
      assert_equal localize_code, Cdo::I18n.localize_locale_code(i18n_locale),
        "expected #{i18n_locale.inspect} to map back to #{localize_code.inspect}"
    end
  end
end
