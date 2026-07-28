require_relative '../test_helper'

require 'cdo/global_edition'

class CdoGlobalEditionTest < Minitest::Test
  def setup
    @default_region = Cdo::GlobalEdition::DEFAULT_REGION
    @default_locale = Cdo::GlobalEdition::DEFAULT_LOCALE
    @multi_locale_region = Cdo::GlobalEdition.regions_url_locales.keys.first
    @single_locale_region = (Cdo::GlobalEdition::REGIONS - Cdo::GlobalEdition.regions_url_locales.keys).first
    @multi_locale = non_main_locale(@multi_locale_region)
    @unavailable_locale = 'unavailable-locale'
    @unsupported_url_locale = 'unsupported-locale'
    @unknown_region = 'unknown-region'

    refute_nil @default_region
    refute_nil @default_locale
    refute_nil @multi_locale_region
    refute_nil @single_locale_region
    refute_nil @multi_locale
    refute_includes Cdo::GlobalEdition.region_locales(@multi_locale_region), @unavailable_locale
    refute_includes Cdo::GlobalEdition.regions_url_locales.fetch(@multi_locale_region), @unsupported_url_locale
    refute_includes Cdo::GlobalEdition::REGIONS, @unknown_region
  end

  def test_default_region_locales_are_expected_and_start_with_default_locale
    default_region_locales = Cdo::GlobalEdition::REGION_LOCALES.fetch(@default_region)
    assert_equal Set[@default_locale, 'es-MX'], default_region_locales
    assert_equal @default_locale, default_region_locales.first
  end

  def test_default_region_locales_map_back_to_default_region
    Cdo::GlobalEdition::REGION_LOCALES.fetch(@default_region).each do |locale|
      assert_equal @default_region, Cdo::GlobalEdition::REGION_BY_LOCALE.fetch(locale)
    end
  end

  def test_path_prefix_for_default_region_and_default_locale_is_empty
    assert_equal(
      '',
      Cdo::GlobalEdition.path_prefix(@default_region, @default_locale),
    )
  end

  def test_path_for_default_region_and_default_locale_does_not_include_global_edition_prefix
    assert_equal(
      '/home',
      Cdo::GlobalEdition.path(@default_region, '/home', locale: @default_locale),
    )
  end

  def test_path_prefix_for_default_region_uses_locale_segment_for_non_default_locale
    locale = (Cdo::GlobalEdition.region_locales(@default_region) - [@default_locale]).first

    refute_nil locale
    assert_equal(
      global_edition_path(@default_region, Cdo::GlobalEdition.url_locale_segment(locale)),
      Cdo::GlobalEdition.path_prefix(@default_region, locale),
    )
  end

  def test_path_for_single_locale_region_does_not_include_locale_segment
    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, '/home', locale: @multi_locale),
    )
  end

  def test_path_for_single_locale_region_accepts_symbol_region
    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region.to_sym, '/home'),
    )
  end

  def test_path_for_single_locale_region_accepts_joined_path
    assert_equal(
      global_edition_path(@single_locale_region, 'courses', 'self-paced-pl'),
      Cdo::GlobalEdition.path(@single_locale_region, '/courses/self-paced-pl'),
    )
  end

  def test_path_for_single_locale_region_preserves_trailing_slash
    assert_equal(
      "#{global_edition_path(@single_locale_region, 'home')}/",
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
    assert_equal(
      multi_locale_path(@multi_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, '/home', locale: @multi_locale),
    )
  end

  def test_path_for_multi_locale_region_falls_back_to_main_locale_for_unavailable_locale
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    assert_equal(
      multi_locale_path(main_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, '/home', locale: @unavailable_locale),
    )
  end

  def test_path_for_multi_locale_region_falls_back_to_main_locale_for_nil_locale
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    assert_equal(
      multi_locale_path(main_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, '/home', locale: nil),
    )
  end

  def test_path_for_multi_locale_region_uses_i18n_locale_by_default
    I18n.stubs(:locale).returns(@multi_locale)
    assert_equal(
      multi_locale_path(@multi_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, '/home'),
    )
  end

  def test_path_for_multi_locale_region_falls_back_when_i18n_locale_is_unavailable
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    I18n.stubs(:locale).returns(@unavailable_locale)
    assert_equal(
      multi_locale_path(main_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, '/home'),
    )
  end

  def test_path_for_multi_locale_region_without_path_returns_locale_root
    assert_equal(
      multi_locale_path(@multi_locale),
      Cdo::GlobalEdition.path(@multi_locale_region, locale: @multi_locale),
    )
  end

  def test_path_for_multi_locale_region_accepts_joined_path
    assert_equal(
      multi_locale_path(@multi_locale, 'courses', 'self-paced-pl'),
      Cdo::GlobalEdition.path(@multi_locale_region, '/courses/self-paced-pl', locale: @multi_locale),
    )
  end

  def test_path_replaces_existing_multi_locale_global_edition_prefix
    existing_global_edition_path = multi_locale_path(@multi_locale, 'home')

    assert_equal(
      global_edition_path(@single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, existing_global_edition_path),
    )
  end

  def test_path_replaces_existing_multi_locale_global_edition_prefix_without_main_path
    existing_global_edition_path = multi_locale_path(@multi_locale)

    assert_equal(
      global_edition_path(@single_locale_region),
      Cdo::GlobalEdition.path(@single_locale_region, existing_global_edition_path),
    )
  end

  def test_path_replaces_existing_single_locale_global_edition_prefix
    existing_global_edition_path = global_edition_path(@single_locale_region, 'home')

    assert_equal(
      multi_locale_path(@multi_locale, 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, existing_global_edition_path, locale: @multi_locale),
    )
  end

  def test_path_replaces_existing_single_locale_global_edition_prefix_without_main_path
    existing_global_edition_path = global_edition_path(@single_locale_region)

    assert_equal(
      multi_locale_path(@multi_locale),
      Cdo::GlobalEdition.path(@multi_locale_region, existing_global_edition_path, locale: @multi_locale),
    )
  end

  def test_path_keeps_excluded_paths_outside_global_edition_scope
    Cdo::GlobalEdition::EXCLUDED_PATHS.each do |excluded_path|
      paths = [excluded_path]
      paths << File.join(excluded_path, 'file.js') if excluded_path.end_with?('/')

      paths.each do |path|
        assert_equal(
          path,
          Cdo::GlobalEdition.path(@multi_locale_region, path, locale: @multi_locale),
          "Expected #{path} to remain outside Global Edition scope",
        )
      end
    end
  end

  def test_path_checks_exclusions_after_removing_existing_global_edition_prefix
    existing_global_edition_path = multi_locale_path(@multi_locale, 'assets', 'application.js')

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
    assert_equal(
      global_edition_path(@unknown_region, 'home'),
      Cdo::GlobalEdition.path(@unknown_region, '/home', locale: @multi_locale),
    )
  end

  private def non_main_locale(region)
    main_locale = Cdo::GlobalEdition.main_region_locale(region)
    Cdo::GlobalEdition.region_locales(region).find {|locale| locale != main_locale}
  end

  private def global_edition_path(region, *paths)
    File.join('/', region, *paths).chomp('/')
  end

  private def multi_locale_path(locale, *paths)
    global_edition_path(@multi_locale_region, Cdo::GlobalEdition.url_locale_segment(locale), *paths)
  end
end
