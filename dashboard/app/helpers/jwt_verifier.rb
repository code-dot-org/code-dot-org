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
    if jwt.key? :aud
      aud = jwt[:aud]
      aud_array = [*aud]
      errors << 'Audience must be a string or Array of strings.' unless aud_array.all?(String)
      if jwt.key? :azp
        verify_azp(aud, jwt[:azp])
      end
    else
      errors << 'Audience does not exist'
    end
  end

  def verify_azp(aud, azp)
    errors << 'Audience does not contain/match Authorized Party' unless azp_in_aud(aud, azp)
  end

  def verify_expiration(jwt)
    now = Time.zone.now
    if jwt.key? :exp
      errors << "Expiration time of #{jwt[:exp]} before #{now.to_i}" unless Time.zone.at(jwt[:exp]) > Time.zone.now
    else
      errors << 'Expiration time does not exist'
    end
  end

  def verify_issued_time(jwt)
    now = Time.zone.now
    if jwt.key? :iat
      errors << "Issued at time of #{jwt[:iat]} after #{now.to_i}" unless Time.zone.at(jwt[:iat]) < now
    else
      errors << 'Issued at time does not exist'
    end
  end

  def azp_in_aud(aud, azp)
    if aud.is_a? Array
      aud.include? azp
    else
      aud == azp
    end
  end
end
