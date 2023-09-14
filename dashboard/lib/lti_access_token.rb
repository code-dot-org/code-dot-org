require 'json'
module LtiAccessToken
  # Retrieve a JWT from the access_token_url of the LTI Integration
  # The JWT can be used to access the LTI Advantage Services for the LTI Integration
  # client_id and issuer are present in the id_token we cache or store as a cookie from the LTI launch
  def get_access_token(client_id, issuer, scopes = Policies::Lti::ALL_SCOPES)
    cache_key = "#{Policies::Lti::NAMESPACE}/#{client_id}-#{issuer}"

    # check for valid access token
    access_token = CDO.shared_cache.read(cache_key)
    return access_token if access_token

    # get access_token_url for this LTI Integration
    integration = LtiIntegration.find_by(client_id: client_id, issuer: issuer)
    raise "No LTI Integration found for client_id: #{client_id} and issuer: #{issuer}" unless integration
    access_token_url = integration[:access_token_url]

    # assemble JWT payload
    jwt_payload = {
      iss: CDO.studio_url('', CDO.default_scheme),
      sub: client_id,
      aud: access_token_url,
      iat: Time.now.to_i,
      # this can be short, since the JWT will be validated as part of the access_token request handshake.
      exp: (5).minutes.from_now.to_i,
      jti: SecureRandom.alphanumeric(10),
    }

    private_key_json = CDO.jwk_private_key_data
    private_key_hash = private_key_json.transform_keys(&:to_sym)
    private_key = private_key_hash[:private_key]
    kid = private_key_hash[:kid]

    # sign JWT
    pri = OpenSSL::PKey::RSA.new(private_key)
    jwt = JWT.encode(jwt_payload, pri, 'RS256', kid: kid)

    query = {
      grant_type: 'client_credentials',
      client_assertion_type: Policies::Lti::JWT_CLIENT_ASSERTION_TYPE,
      client_assertion: jwt,
      scope: scopes.join(' '),
    }

    res = HTTParty.post(access_token_url, query: query, headers: {'Content-Type' => 'application/x-www-form-urlencoded'})
    # get access_token and exp from response
    token_response = JSON.parse(res.body).transform_keys(&:to_sym)
    access_token = token_response[:access_token]
    exp = token_response[:expires_in]

    # cache access_token, set expiration
    CDO.shared_cache.write(cache_key, access_token, expires_in: exp)

    return access_token
  end
end
