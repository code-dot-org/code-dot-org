require_relative './test_helper'
require_relative '../helpers/hourofcode_helpers'
require 'webmock/minitest'
require 'geocoder'

class HourOfCodeHelpersTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def teardown
    super
    Geocoder.unstub(:search)
  end

  # Covers #hoc_canonicalized_i18n_path / #hoc_detect_country / #hoc_detect_language in helpers/hourofcode_helpers.rb
  def test_hourofcode_redirect
    gb_ip = '89.151.64.0' # Great Britain IP address range
    fr_ip = '176.31.96.198' # France IP address range
    cloudfront_ip = '54.240.158.170' # Whitelisted CloudFront-ip proxy range
    local_load_balancer = '10.31.164.34' # Private-network address range

    Geocoder.stubs(:search).with(gb_ip, {ip_address: true}).returns([OpenStruct.new(country_code: 'GB')])
    Geocoder.stubs(:search).with(fr_ip, {ip_address: true}).returns([OpenStruct.new(country_code: 'FR')])

    header 'host', 'hourofcode.com'
    header 'X_FORWARDED_FOR', [gb_ip, cloudfront_ip, local_load_balancer].join(', ')

    # GB geo, no browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']

    header 'ACCEPT_LANGUAGE', 'fr'
    # GB geo, French browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/fr/xyz', response.headers['Location']

    header 'X_FORWARDED_FOR', [fr_ip, cloudfront_ip, local_load_balancer].join(', ')
    # French geo, French browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/fr/xyz', response.headers['Location']

    header 'ACCEPT_LANGUAGE', 'en'
    # French geo, English browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/fr/xyz', response.headers['Location']

    header 'ACCEPT_LANGUAGE', 'es'
    # French geo, Spanish browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/fr/es/xyz', response.headers['Location']
  end

  # Ensure redirect goes to original (spoofable) IP-address location,
  # rather than the location of the first untrusted proxy in the forwarded chain.
  def test_redirect_untrusted_proxy
    user_ip = '89.151.64.0' # Great Britain IP address range
    untrusted_proxy_ip = '2.160.0.0' # Germany IP address range
    cloudfront_ip = '54.240.158.170' # Whitelisted CloudFront-ip proxy range
    local_load_balancer = '10.31.164.34' # Private-network address range
    Geocoder.stubs(:search).with(user_ip, {ip_address: true}).returns([OpenStruct.new(country_code: 'GB')])
    Geocoder.stubs(:search).with('127.0.0.1', {ip_address: true}).returns([OpenStruct.new(country_code: 'RD')])

    header 'host', 'hourofcode.com'
    header 'X_FORWARDED_FOR', [user_ip, untrusted_proxy_ip, cloudfront_ip, local_load_balancer].join(', ')
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']

    # Canonical url formats shouldn't redirect.
    %w(
      /uk/xyz
      /uk/gb/xyz
      /afterschool/xyz
      /afterschool/en/xyz
    ).each do |path|
      response = get path
      assert_equal 404, response.status
    end

    # Redirect to /us/ by default when IP doesn't resolve to a country.
    header 'X_FORWARDED_FOR', "#{cloudfront_ip}, #{local_load_balancer}"
    response = get '/xyz'
    assert_equal 'http://hourofcode.com/us/xyz', response.headers['Location']
  end

  def test_get_language_names_in_english
    sources = {
      language_code: {
        en: 'English'
      },
      locale_code: {
        'es-es': "Spanish (Spain)"
      }
    }
    I18n.backend.store_translations I18n.default_locale, sources

    assert_equal sources[:language_code][:en], hoc_language('en', I18n.default_locale)
    assert_equal sources[:language_code][:en], hoc_language('EN', I18n.default_locale)

    assert_equal sources[:locale_code][:'es-es'], hoc_language('es-es', I18n.default_locale)
    assert_equal sources[:locale_code][:'es-es'], hoc_language('ES-ES', I18n.default_locale)

    expected_result = "#{sources[:locale_code][:'es-es']}, #{sources[:language_code][:en]}"
    assert_equal expected_result, hoc_language(' es-es, en ', I18n.default_locale)
    assert_equal expected_result, hoc_language(' ES-ES, EN ', I18n.default_locale)

    invalid_language_code = 'xx-yy'
    assert_equal invalid_language_code, hoc_language(invalid_language_code, I18n.default_locale)
  end

  def test_get_translated_language_names
    test_locale = :'te-ST'
    translations = {
      language_code: {
        en: 'Inglesa'
      },
      locale_code: {
        'es-es': "Español (España)"
      }
    }
    I18n.enforce_available_locales = false
    I18n.backend.store_translations test_locale, translations

    assert_equal translations[:language_code][:en], hoc_language('en', test_locale)
    assert_equal translations[:language_code][:en], hoc_language('EN', test_locale)

    assert_equal translations[:locale_code][:'es-es'], hoc_language('es-es', test_locale)
    assert_equal translations[:locale_code][:'es-es'], hoc_language('ES-ES', test_locale)
    expected_result = "#{translations[:locale_code][:'es-es']}, #{translations[:language_code][:en]}"
    assert_equal expected_result, hoc_language(' es-es, en ', test_locale)
    assert_equal expected_result, hoc_language(' ES-ES, EN ', test_locale)

    invalid_language_code = 'xx-yy'
    assert_equal invalid_language_code, hoc_language(invalid_language_code, test_locale)
  end
end
