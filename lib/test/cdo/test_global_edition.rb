require_relative '../test_helper'

require 'cdo/global_edition'

class CdoGlobalEditionTest < Minitest::Test
  def setup
    @multi_locale_region = Cdo::GlobalEdition.regions_url_locales.keys.first
    @single_locale_region = (Cdo::GlobalEdition::REGIONS - Cdo::GlobalEdition.regions_url_locales.keys).first
    @unavailable_locale = 'unavailable-locale'
    @unsupported_url_locale = 'unsupported-locale'
    @unknown_region = 'unknown-region'

    refute_nil @multi_locale_region
    refute_nil @single_locale_region
    refute_includes Cdo::GlobalEdition.region_locales(@multi_locale_region), @unavailable_locale
    refute_includes Cdo::GlobalEdition.regions_url_locales.fetch(@multi_locale_region), @unsupported_url_locale
    refute_includes Cdo::GlobalEdition::REGIONS, @unknown_region
  end

  def test_path_for_single_locale_region_does_not_include_locale_segment
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, 'home', locale: locale),
    )
  end

  def test_path_for_single_locale_region_accepts_symbol_region
    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region.to_sym, 'home'),
    )
  end

  def test_path_for_single_locale_region_joins_multiple_path_segments
    assert_equal(
      global_edition_path(@single_locale_region, 'courses', 'self-paced-pl'),
      Cdo::GlobalEdition.path(@single_locale_region, 'courses', 'self-paced-pl'),
    )
  end

  def test_path_for_single_locale_region_normalizes_leading_and_trailing_slashes
    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, '/home/'),
    )
  end

  def test_path_for_single_locale_region_without_path_returns_region_root
    assert_equal(
      global_edition_path(@single_locale_region),
      Cdo::GlobalEdition.path(@single_locale_region),
    )
  end

  def test_path_for_multi_locale_region_uses_available_locale
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      multi_locale_path(locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home', locale: locale),
    )
  end

  def test_path_for_multi_locale_region_falls_back_to_main_locale_for_unavailable_locale
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    assert_equal(
      multi_locale_path(main_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home', locale: @unavailable_locale),
    )
  end

  def test_path_for_multi_locale_region_falls_back_to_main_locale_for_nil_locale
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    assert_equal(
      multi_locale_path(main_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home', locale: nil),
    )
  end

  def test_path_for_multi_locale_region_uses_i18n_locale_by_default
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    I18n.stubs(:locale).returns(locale)
    assert_equal(
      multi_locale_path(locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home'),
    )
  end

  def test_path_for_multi_locale_region_falls_back_when_i18n_locale_is_unavailable
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    I18n.stubs(:locale).returns(@unavailable_locale)
    assert_equal(
      multi_locale_path(main_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home'),
    )
  end

  def test_path_for_multi_locale_region_without_path_returns_locale_root
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      multi_locale_path(locale),
      Cdo::GlobalEdition.path(@multi_locale_region, locale: locale),
    )
  end

  def test_path_for_multi_locale_region_joins_multiple_path_segments
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      multi_locale_path(locale, 'courses', 'self-paced-pl'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'courses', 'self-paced-pl', locale: locale),
    )
  end

  def test_path_replaces_existing_multi_locale_global_edition_prefix
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = multi_locale_path(locale, 'home')

    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, existing_global_edition_path),
    )
  end

  def test_path_replaces_existing_multi_locale_global_edition_prefix_without_main_path
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = multi_locale_path(locale)

    assert_equal(
      global_edition_path(@single_locale_region),
      Cdo::GlobalEdition.path(@single_locale_region, existing_global_edition_path),
    )
  end

  def test_path_replaces_existing_single_locale_global_edition_prefix
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = global_edition_path(@single_locale_region, 'home')

    assert_equal(
      multi_locale_path(locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, existing_global_edition_path, locale: locale),
    )
  end

  def test_path_replaces_existing_single_locale_global_edition_prefix_without_main_path
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = global_edition_path(@single_locale_region)

    assert_equal(
      multi_locale_path(locale),
      Cdo::GlobalEdition.path(@multi_locale_region, existing_global_edition_path, locale: locale),
    )
  end

  def test_path_keeps_excluded_paths_outside_global_edition_scope
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    Cdo::GlobalEdition::EXCLUDED_PATHS.each do |excluded_path|
      paths = [excluded_path]
      paths << File.join(excluded_path, 'file.js') if excluded_path.end_with?('/')

      paths.each do |path|
        assert_equal(
          path.chomp('/'),
          Cdo::GlobalEdition.path(@multi_locale_region, path, locale: locale),
          "Expected #{path} to remain outside Global Edition scope",
        )
      end
    end
  end

  def test_path_checks_exclusions_after_removing_existing_global_edition_prefix
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = multi_locale_path(locale, 'assets', 'application.js')

    assert_equal(
      '/assets/application.js',
      Cdo::GlobalEdition.path(@single_locale_region, existing_global_edition_path),
    )
  end

  def test_path_does_not_strip_unsupported_global_edition_like_prefix
    assert_equal(
      global_edition_path(@single_locale_region, @unknown_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, File.join('/', @unknown_region, 'home')),
    )
  end

  def test_path_does_not_strip_multi_locale_prefix_with_unsupported_locale
    existing_path = File.join('/', @multi_locale_region, @unsupported_url_locale, 'home')

    assert_equal(
      global_edition_path(@single_locale_region, @multi_locale_region, @unsupported_url_locale, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, existing_path),
    )
  end

  def test_path_for_unknown_region_uses_region_only_path
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      global_edition_path(@unknown_region, 'home'),
      Cdo::GlobalEdition.path(@unknown_region, 'home', locale: locale),
    )
  end

  private def global_edition_path(region, *paths)
    File.join('/', region, *paths).chomp('/')
  end

  private def multi_locale_path(locale, *paths)
    global_edition_path(@multi_locale_region, Cdo::GlobalEdition.url_locale_segment(locale), *paths)
  end
end
