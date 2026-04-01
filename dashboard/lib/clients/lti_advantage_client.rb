class Clients::LtiAdvantageClient
  include LtiAccessToken

  PAGE_LIMIT = 100

  def initialize(client_id, issuer)
    raise ArgumentError unless client_id && issuer
    @client_id = client_id
    @issuer = issuer
    @page_limit = PAGE_LIMIT
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
    }
    initial_url = build_uri(url, resource_link_id)
    res = make_request(initial_url, options)
    next_page = next_page_url(res[:headers])
    parsed_res = res[:body]
    # For Schoology, we need to pass the next page number due to a bug in their API implementation.
    # Since we've already fetched the first page, we start at page 2.
    page = 2
    while next_page
      next_page = @issuer == Policies::Lti::LMS_PLATFORMS[:schoology][:issuer] ?  build_uri_schoology(next_page, page) : build_uri(next_page, resource_link_id)
      current_page = make_request(next_page, options)
      parsed_res[:members].concat(current_page[:body][:members])
      return parsed_res unless parsed_res[:members].length <= Policies::Lti::MAX_COURSE_MEMBERSHIP
      next_page = next_page_url(current_page[:headers])
      page += 1
    end
    parsed_res
  end
end

def make_request(url, options)
  res = HTTParty.get(url, options)
  raise "Error getting context membership: #{res.code} #{res.body}" unless res.code == HTTP::Status::OK
  return {headers: res.headers, body: JSON.parse(res.body, symbolize_names: true)}
end

private def build_uri(url, resource_link_id)
  uri = URI(url)
  existing_params = uri.query ? Rack::Utils.parse_query(uri.query) : {}
  # Rack::Utils.parse_query returns string keys, so we need to use string keys when merging
  rlid_param = Policies::Lti.issuer_accepts_resource_link?(@issuer) ? {'rlid' => resource_link_id} : {}
  page_limit_param = {'limit' => @page_limit}
  query_params = existing_params.merge(page_limit_param, rlid_param)
  uri.query = query_params.to_query
  uri.to_s
end

private def build_uri_schoology(url, page)
  uri = URI(url)
  uri.query = {
    limit: @page_limit,
    page: page,
  }.to_query
  uri.to_s
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
