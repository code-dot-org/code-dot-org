require 'test_helper'
require 'cdo/brand'

class BrandTest < ActiveSupport::TestCase
  setup do
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI_NEXT).returns(Cdo::Brand::BRAND_CODEAI_NEXT)
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(false)
  end

  test 'returns codeai-next when router is disabled' do
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code
  end

  test 'returns codeai-next when router is disabled even with request' do
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code(request)
  end

  test 'unknown default-brand DCDO value falls back to codeai-next' do
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI_NEXT).returns('codeai')
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code
  end

  test 'codeai-audit may not be the default-brand' do
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI_NEXT).returns('codeai-audit')
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code
  end

  test 'returns codeai-next when router enabled but no request' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code
  end

  test 'returns codeai-next when router enabled and no override' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code(request)
  end

  test 'returns codeai-audit brand from URL param when router enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal Cdo::Brand::BRAND_CODEAI_AUDIT, Cdo::Brand.current_brand_code(request)
  end

  test 'returns codeai-audit brand from cookie when router enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    cookie_key = environment_specific_cookie_name(Cdo::Brand::BRAND_COOKIE_NAME)
    request = mock_request(cookies: {cookie_key => 'codeai-audit'})
    assert_equal Cdo::Brand::BRAND_CODEAI_AUDIT, Cdo::Brand.current_brand_code(request)
  end

  test 'URL param takes priority over cookie' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    cookie_key = environment_specific_cookie_name(Cdo::Brand::BRAND_COOKIE_NAME)
    request = mock_request(params: {'brand' => 'codeai-audit'}, cookies: {cookie_key => 'unknown'})
    assert_equal Cdo::Brand::BRAND_CODEAI_AUDIT, Cdo::Brand.current_brand_code(request)
  end

  test 'unknown brand code falls back to codeai-next' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'unknown'})
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code(request)
  end

  test 'legacy brand code falls back to codeai-next' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code(request)
  end

  test 'logo_filename returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal 'logo-codeai.svg', Cdo::Brand.logo_filename(request)
    assert_equal 'logo-codeai.svg', Cdo::Brand.logo_filename
  end

  test 'header_logo_filename returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal 'logo-codeai-inverse.svg', Cdo::Brand.header_logo_filename(request)
    assert_equal 'logo-codeai-inverse.svg', Cdo::Brand.header_logo_filename
  end

  test 'legal_name returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal 'CodeAI', Cdo::Brand.legal_name(request)
    assert_equal 'CodeAI', Cdo::Brand.legal_name
  end

  test 'codeai-next brand returns its shared codeai assets' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-next'})
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code(request)
    assert_equal 'CodeAI', Cdo::Brand.legal_name(request)
    assert_equal 'logo-codeai-inverse.svg', Cdo::Brand.header_logo_filename(request)
  end

  test 'codeai-audit brand resolves and reuses the codeai assets' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal Cdo::Brand::BRAND_CODEAI_AUDIT, Cdo::Brand.current_brand_code(request)
    assert_equal 'CodeAI', Cdo::Brand.legal_name(request)
    assert_equal 'logo-codeai-inverse.svg', Cdo::Brand.header_logo_filename(request)
  end

  test 'codeai-audit is unreachable when router is disabled' do
    cookie_key = environment_specific_cookie_name(Cdo::Brand::BRAND_COOKIE_NAME)
    request = mock_request(params: {'brand' => 'codeai-audit'}, cookies: {cookie_key => 'codeai-audit'})
    assert_equal Cdo::Brand::BRAND_CODEAI_NEXT, Cdo::Brand.current_brand_code(request)
  end

  private def mock_request(params: {}, cookies: {})
    request = stub('request')
    request.stubs(:params).returns(params.with_indifferent_access)
    request.stubs(:cookies).returns(cookies.with_indifferent_access)
    request
  end
end
