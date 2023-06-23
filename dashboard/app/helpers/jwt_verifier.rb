class JwtVerifier
  attr_reader :errors

  def initialize(jwt, integration)
    @jwt = jwt
    @integration = integration
    @errors = []
  end

  def verify_jwt
    verify_audience(@jwt)
    verify_expiration(@jwt)
    errors.empty?
  end

  private

  def verify_audience(jwt)
    aud = jwt[:aud]
    aud_array = [*aud]
    errors << 'Audience must be a string or Array of strings.' unless aud_array.all?(String)
    if jwt.key? :azp
      verify_azp(aud, jwt[:azp])
    else
      errors << 'Audience not found on Platform' unless public_key_matches_one_of_client_ids(aud)
    end
  end

  def verify_azp(aud, azp)
    errors << 'Audience does not contain/match Authorized Party' unless azp_in_aud(aud, azp)
    errors << 'Audience does not match client_id' unless public_key_matches_one_of_client_ids(aud)
  end

  def verify_expiration(jwt)
    now = Time.zone.now
    errors << "Expiration time of #{jwt[:exp]} before #{now.to_i}" unless Time.zone.at(jwt[:exp]) > Time.zone.now
  end

  def azp_in_aud(aud, azp)
    if aud.is_a? Array
      aud.include? azp
    else
      aud == azp
    end
  end

  def public_key_matches_one_of_client_ids(aud)
    LtiIntegration.exists?(client_id: aud)
  end
end
