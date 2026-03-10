require 'test_helper'
require 'cdo/brand'

class BrandTest < ActiveSupport::TestCase
  setup do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(false)
  end

  test 'returns default brand when router is disabled' do
    assert_equal Cdo::Brand::BRAND_CODE_ORG, Cdo::Brand.current_brand_code
  end

  test 'returns default brand when router is disabled even with request' do
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODE_ORG, Cdo::Brand.current_brand_code(request)
  end

  test 'returns default brand when router enabled but no request' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    assert_equal Cdo::Brand::BRAND_CODE_ORG, Cdo::Brand.current_brand_code
  end

  test 'returns codeai brand from URL param when router enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODE_CODEAI, Cdo::Brand.current_brand_code(request)
  end

  test 'returns codeai brand from cookie when router enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    cookie_key = environment_specific_cookie_name(Cdo::Brand::BRAND_COOKIE_NAME)
    request = mock_request(cookies: {cookie_key => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODE_CODEAI, Cdo::Brand.current_brand_code(request)
  end

  test 'URL param takes priority over cookie' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    cookie_key = environment_specific_cookie_name(Cdo::Brand::BRAND_COOKIE_NAME)
    request = mock_request(params: {'brand' => 'code'}, cookies: {cookie_key => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODE_ORG, Cdo::Brand.current_brand_code(request)
  end

  test 'returns default brand for unknown brand code' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'unknown'})
    assert_equal Cdo::Brand::BRAND_CODE_ORG, Cdo::Brand.current_brand_code(request)
  end

  test 'logo_filename returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal 'logo.svg', Cdo::Brand.logo_filename(request)
    assert_equal 'logo-inverse.svg', Cdo::Brand.logo_filename
  end

  test 'legal_name returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal 'Code.ai', Cdo::Brand.legal_name(request)
    assert_equal 'Code.org', Cdo::Brand.legal_name
  end

  private

  def mock_request(params: {}, cookies: {})
    request = stub('request')
    request.stubs(:params).returns(params.with_indifferent_access)
    request.stubs(:cookies).returns(cookies.with_indifferent_access)
    request
  end
end
