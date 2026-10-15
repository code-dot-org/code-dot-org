require 'test_helper'

class GoogleOauth2WithoutTokeninfoTest < ActiveSupport::TestCase
  SCOPE = 'openid https://www.googleapis.com/auth/userinfo.email'.freeze

  setup do
    app = ->(_env) {[200, {}, ['ok']]}
    @strategy = OmniAuth::Strategies::GoogleOauth2WithoutTokeninfo.new(app, 'client-id', 'client-secret')
  end

  test 'credentials come from the token response without calling tokeninfo' do
    set_access_token('scope' => SCOPE)
    @strategy.expects(:token_info).never
    OAuth2::Client.any_instance.expects(:request).never

    credentials = @strategy.credentials

    assert_equal 'ya29.token', credentials['token']
    assert_equal 'refresh', credentials['refresh_token']
    assert credentials['expires']
    assert credentials['expires_at'] > Time.now.to_i
    assert_equal SCOPE, credentials['scope']
  end

  test 'omits scope when the token response has none' do
    set_access_token
    OAuth2::Client.any_instance.expects(:request).never

    refute @strategy.credentials.key?('scope')
  end

  test 'restores the gem behavior when the DCDO flag is on' do
    set_access_token('scope' => SCOPE)
    DCDO.stubs(:get).with(OmniAuth::Strategies::GoogleOauth2WithoutTokeninfo::USE_TOKENINFO_DCDO_KEY, false).returns(true)
    @strategy.expects(:token_info).with('ya29.token').returns('scope' => 'from tokeninfo')

    credentials = @strategy.credentials

    assert_equal 'ya29.token', credentials['token']
    assert_equal 'from tokeninfo', credentials['scope']
  end

  test 'keeps the google_oauth2 provider name' do
    assert_equal 'google_oauth2', @strategy.name
  end

  test 'is the strategy Devise uses for google_oauth2' do
    assert_equal OmniAuth::Strategies::GoogleOauth2WithoutTokeninfo,
      Devise.omniauth_configs[:google_oauth2].strategy_class
  end

  private def set_access_token(extra = {})
    token_response = {
      'access_token' => 'ya29.token',
      'refresh_token' => 'refresh',
      'expires_in' => 3599,
      'token_type' => 'Bearer',
    }.merge(extra)
    @strategy.access_token = OAuth2::AccessToken.from_hash(@strategy.client, token_response)
  end
end
