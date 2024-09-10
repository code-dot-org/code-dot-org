class Clients::LtiAdvantageClient
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
  def get_context_membership(url, resource_link_id, page_limit = 100)
    options = {
      headers: {
        'Accept' => Policies::Lti::MEMBERSHIP_CONTAINER_CONTENT_TYPE,
        'Authorization' => "Bearer #{get_access_token(@client_id, @issuer)}",
      },
      query: {
        limit: page_limit,
      },
    }
    options[:query][:rlid] = resource_link_id if Policies::Lti.issuer_accepts_resource_link?(@issuer)
    res = make_request(url, options)
    next_page = next_page_url(res[:headers])
    parsed_res = res[:body]
    while next_page
      current_page = make_request(next_page, options)
      parsed_res[:members].concat(current_page[:body][:members])
      return parsed_res unless parsed_res[:members].length <= Policies::Lti::MAX_COURSE_MEMBERSHIP
      next_page = next_page_url(current_page[:headers])
    end
    parsed_res
  end
end

def make_request(url, options)
  res = HTTParty.get(url, options)
  raise "Error getting context membership: #{res.code} #{res.body}" unless res.code == HTTP::Status::OK
  return {headers: res.headers, body: JSON.parse(res.body, symbolize_names: true)}
end

# Get the next page URL from the Link header in the response.
# Returns nil if no next page is present.
private def next_page_url(headers)
  link_header = headers&.[](:link)
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
