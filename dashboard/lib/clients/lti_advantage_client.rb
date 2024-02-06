class LtiAdvantageClient
  include LtiAccessToken

  def initialize(client_id, issuer)
    raise ArgumentError unless client_id && issuer
    @client_id = client_id
    @issuer = issuer
  end

  # Call the LTI Advantage API to get the membership (roster) for a given context (course/section).
  # The URL for the API will vary between LMS platforms, and is initially contained in the launch context.
  # See the LTI spec for details:
  # https://www.imsglobal.org/spec/lti-nrps/v2p0/
  def get_context_membership(url, resource_link_id)
    options = {
      headers: {
        'Accept' => Policies::Lti::MEMBERSHIP_CONTAINER_CONTENT_TYPE,
        'Authorization' => "Bearer #{get_access_token(@client_id, @issuer)}",
      },
      query: {
        rlid: resource_link_id,
      },
    }
    res = HTTParty.get(url, options)
    raise "Error getting context membership: #{res.code} #{res.body}" unless res.code == HTTP::Status::OK
    JSON.parse(res, symbolize_names: true)
  end
end
