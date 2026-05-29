require_relative '../test_helper'

require 'cdo/global_edition'

class CdoGlobalEditionTest < Minitest::Test
  def setup
    @multi_locale_region = Cdo::GlobalEdition.regions_url_locales.keys.first
    @single_locale_region = (Cdo::GlobalEdition::REGIONS - Cdo::GlobalEdition.regions_url_locales.keys).find do |region|
      Cdo::GlobalEdition.region_locales(region)&.any?
    end

    refute_nil @multi_locale_region
    refute_nil @single_locale_region
  end

  def test_path_for_single_locale_region_does_not_include_locale_segment
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      File.join('/', @single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, 'home', locale: locale),
    )
  end

  def test_path_for_multi_locale_region_uses_available_locale
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    assert_equal(
      File.join('/', @multi_locale_region, Cdo::GlobalEdition.url_locale_segment(locale), 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home', locale: locale),
    )
  end

  def test_path_for_multi_locale_region_falls_back_to_main_locale_for_unavailable_locale
    main_locale = Cdo::GlobalEdition.main_region_locale(@multi_locale_region)

    assert_equal(
      File.join('/', @multi_locale_region, Cdo::GlobalEdition.url_locale_segment(main_locale), 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home', locale: 'zz-ZZ'),
    )
  end

  def test_path_for_multi_locale_region_uses_i18n_locale_by_default
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last

    I18n.stubs(:locale).returns(locale)
    assert_equal(
      File.join('/', @multi_locale_region, Cdo::GlobalEdition.url_locale_segment(locale), 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, 'home'),
    )
  end

  def test_path_replaces_existing_multi_locale_global_edition_prefix
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = File.join(
      '/',
      @multi_locale_region,
      Cdo::GlobalEdition.url_locale_segment(locale),
      'home',
    )

    assert_equal(
      File.join('/', @single_locale_region, 'home'),
      Cdo::GlobalEdition.path(@single_locale_region, existing_global_edition_path),
    )
  end

  def test_path_replaces_existing_single_locale_global_edition_prefix
    locale = Cdo::GlobalEdition.region_locales(@multi_locale_region).last
    existing_global_edition_path = File.join('/', @single_locale_region, 'home')

    assert_equal(
      File.join('/', @multi_locale_region, Cdo::GlobalEdition.url_locale_segment(locale), 'home'),
      Cdo::GlobalEdition.path(@multi_locale_region, existing_global_edition_path, locale: locale),
    )
  end
end
