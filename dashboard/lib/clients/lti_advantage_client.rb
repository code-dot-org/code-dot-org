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
    raise "Error getting context membership: #{res.code} #{res.body}" unless res[:code] == HTTP::Status::OK
    parsed_res = JSON.parse(res, symbolize_names: true)
    next_page = next_page_url(parsed_res)
    while next_page
      current_page = JSON.parse(HTTParty.get(next_page, options), symbolize_names: true)
      parsed_res[:members].concat(current_page[:members])
      return parsed_res unless parsed_res[:members].length <= Policies::Lti::MAX_COURSE_MEMBERSHIP
      next_page = next_page_url(current_page)
    end
    parsed_res
  end
end

private

def make_request(url, options)
  res = HTTParty.get(url, options)
  raise "Error getting context membership: #{res.code} #{res.body}" unless res[:code] == HTTP::Status::OK
  res
end

def next_page_url(nrps_response)
  link_header = nrps_response.headers['link']
  return nil unless link_header

  next_url = nil
  link_header.split(',').each do |link|
    match = link.match(/<([^>]+)>;\s*rel="next"/)
    if match
      next_url = match[1]
      break
    end
  end
  next_url
end
