require 'test_helper'
require 'date'

class LtiAccessTokenTest < ActiveSupport::TestCase
  include LtiAccessToken

  setup_all do
    @lti_integration = create :lti_integration
    fake_response_hash = {
      access_token: 'fake_access_token',
      exp: 1.hour.from_now.to_i,
    }
    @fake_access_token_response = OpenStruct.new({body: JSON.generate(fake_response_hash)})
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

  test 'Signs a valid JWT' do
    test_claims = {
      iss: 'https://foo-issuer.org',
      sub: 'foo-client-id',
      aud: 'foo-audience',
      iat: Time.now.to_i,
      exp: (5).minutes.from_now.to_i,
      jti: 'foo-jwt-id',
    }
    jwt = sign_jwt(test_claims)
    pk_string = CDO.jwk_private_key_data.transform_keys(&:to_sym)[:private_key]
    pk = OpenSSL::PKey::RSA.new(pk_string)
    decoded = JWT.decode(jwt, pk, true, {algorithm: 'RS256'})
    assert_equal test_claims, decoded[0].transform_keys(&:to_sym)
  end
end
