require 'test_helper'
require 'date'
require 'jwt'

class LtiAccessTokenTest < ActiveSupport::TestCase
  include LtiAccessToken

  setup_all do
    @lti_integration = create :lti_integration
    fake_response_hash = {
      access_token: 'fake_access_token',
      expires_in: 3600,
    }
    @fake_access_token_response = OpenStruct.new({body: JSON.generate(fake_response_hash)})
    jwk = JWT::JWK.new(OpenSSL::PKey::RSA.new(2048), {use: 'sig', alg: 'RS256', kid: 'test-kid'})
    @fake_private_key_obj = {
      kid: jwk[:kid],
      private_key: jwk.signing_key.to_s,
    }
    @cache_key = "#{Policies::Lti::NAMESPACE}/#{@lti_integration[:client_id]}-#{@lti_integration[:issuer]}"
  end

  setup do
    CDO.stubs(:jwk_private_key_data).returns(@fake_private_key_obj)
  end

  teardown do
    Timecop.return
    CDO.shared_cache.delete(@cache_key)
  end

  test 'get_access_token calls the access_token_url from the LTI integration' do
    HTTParty.stubs(:post).with(@lti_integration.access_token_url, anything, anything).returns(@fake_access_token_response)
    jwt = get_access_token(@lti_integration.client_id, @lti_integration.issuer, ['test_scope', 'test_scope2'])
    assert_equal 'fake_access_token', jwt
  end

  test 'get_access_token uses cached tokens if present' do
    CDO.shared_cache.stubs(:read).with("#{Policies::Lti::NAMESPACE}/#{@lti_integration.client_id}-#{@lti_integration.issuer}").returns('cached_access_token')
    jwt = get_access_token(@lti_integration.client_id, @lti_integration.issuer, ['test_scope', 'test_scope2'])
    assert_equal 'cached_access_token', jwt
  end

  test 'expired tokens are removed from the cache' do
    CDO.shared_cache.write(@cache_key, 'cached_access_token', expires_in: 1.hour)
    Timecop.travel(2.hours) # Cached JWT should be expired
    fresh_token = {
      access_token: 'fresh_access_token',
      expires_in: 3600,
    }
    fresh_response = OpenStruct.new({body: JSON.generate(fresh_token)}) # New JWT to ensure we aren't getting a cached value
    HTTParty.stubs(:post).with(@lti_integration.access_token_url, anything, anything).returns(fresh_response)
    CDO.shared_cache.expects(:read).with(@cache_key).once

    jwt = get_access_token(@lti_integration.client_id, @lti_integration.issuer, ['test_scope', 'test_scope2'])
    assert_equal 'fresh_access_token', jwt
  end

  test 'Signs a valid JWT' do
    test_claims = {
      iss: 'https://foo-issuer.org',
      sub: 'foo-client-id',
      aud: 'foo-audience',
      iat: Time.now.to_i,
      exp: 5.minutes.from_now.to_i,
      jti: 'foo-jwt-id',
    }
    jwt = sign_jwt(test_claims)
    pk_string = CDO.jwk_private_key_data.transform_keys(&:to_sym)[:private_key]
    pk = OpenSSL::PKey::RSA.new(pk_string)
    decoded = JWT.decode(jwt, pk, true, {algorithm: 'RS256'})
    assert_equal test_claims, decoded[0].transform_keys(&:to_sym)
  end
end
