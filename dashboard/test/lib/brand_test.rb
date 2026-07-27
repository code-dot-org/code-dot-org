require 'test_helper'
require 'cdo/brand'

class BrandTest < ActiveSupport::TestCase
  setup do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(false)
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI).returns(Cdo::Brand::BRAND_CODEAI)
  end

  test 'default-brand DCDO sets the fallback when router is disabled' do
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI).returns(Cdo::Brand::BRAND_CODEAI)
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code
  end

  test 'default-brand DCDO sets the fallback when router is enabled and no override' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI).returns(Cdo::Brand::BRAND_CODEAI)
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code
  end

  test 'URL param overrides default-brand when router is enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI).returns(Cdo::Brand::BRAND_CODEAI)
    request = mock_request(params: {'brand' => 'code'})
    assert_equal Cdo::Brand::BRAND_CODE_ORG, Cdo::Brand.current_brand_code(request)
  end

  test 'unknown default-brand value falls back to BRAND_CODEAI' do
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI).returns('not-a-real-brand')
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code
  end

  test 'returns default brand when router is disabled' do
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code
  end

  test 'returns default brand when router is disabled even with request' do
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code(request)
  end

  test 'returns default brand when router enabled but no request' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code
  end

  test 'returns codeai brand from URL param when router enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code(request)
  end

  test 'returns codeai brand from cookie when router enabled' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    cookie_key = environment_specific_cookie_name(Cdo::Brand::BRAND_COOKIE_NAME)
    request = mock_request(cookies: {cookie_key => 'codeai'})
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code(request)
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
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code(request)
  end

  test 'logo_filename returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal 'logo-codeai.svg', Cdo::Brand.logo_filename(request)
    assert_equal 'logo-codeai.svg', Cdo::Brand.logo_filename
  end

  test 'header_logo_filename returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal 'logo-codeai-inverse.svg', Cdo::Brand.header_logo_filename(request)
    assert_equal 'logo-codeai-inverse.svg', Cdo::Brand.header_logo_filename
  end

  test 'legal_name returns correct value per brand' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal 'CodeAI', Cdo::Brand.legal_name(request)
    assert_equal 'CodeAI', Cdo::Brand.legal_name
  end

  test 'codeai-next brand returns its placeholder config' do
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

  test 'codeai_next? is false by default' do
    assert_equal false, Cdo::Brand.codeai_next?
  end

  test 'codeai_next? is true for codeai-next via router' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-next'})
    assert_equal true, Cdo::Brand.codeai_next?(request)
  end

  test 'codeai_next? is true for codeai-audit' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai-audit'})
    assert_equal true, Cdo::Brand.codeai_next?(request)
  end

  test 'codeai_next? is false for codeai' do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    request = mock_request(params: {'brand' => 'codeai'})
    assert_equal false, Cdo::Brand.codeai_next?(request)
  end

  test 'codeai-audit can never become the default brand, even if DCDO is set to it' do
    DCDO.stubs(:get).with('default-brand', Cdo::Brand::BRAND_CODEAI).returns(Cdo::Brand::BRAND_CODEAI_AUDIT)
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code

    DCDO.stubs(:get).with('brand-router-enabled', false).returns(true)
    assert_equal Cdo::Brand::BRAND_CODEAI, Cdo::Brand.current_brand_code
  end

  private def mock_request(params: {}, cookies: {})
    request = stub('request')
    request.stubs(:params).returns(params.with_indifferent_access)
    request.stubs(:cookies).returns(cookies.with_indifferent_access)
    request
  end
end
