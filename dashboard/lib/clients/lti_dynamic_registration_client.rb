class LtiDynamicRegistrationClient
  def initialize(registration_token, registration_endpoint)
    raise ArgumentError unless registration_token && registration_endpoint
    @registration_token = registration_token
    @registration_endpoint = registration_endpoint
  end

  def make_registration_request
    body = Policies::Lti::DYNAMIC_REGISTRATION_CONFIG.to_json
    headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{@registration_token}"
    }
    res = HTTParty.post(@registration_endpoint, body: body, headers: headers)
    raise "Error making registration request: #{res.code} #{res.body}" unless res.code == HTTP::Status::OK
    return JSON.parse(res.body, symbolize_names: true)
  end
end
