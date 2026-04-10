module StableIdRedirect
  extend ActiveSupport::Concern

  STABLE_ID_COOKIE = 'statsig_stable_id'.freeze
  UUID_FORMAT = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  # Redirect to a path on code.org, appending the statsig_stable_id from
  # the cookie if present and valid. No cookie = no consent = no param.
  def redirect_to_code_org(path, **options)
    url = CDO.code_org_url(path)
    stable_id = cookies[STABLE_ID_COOKIE]
    if stable_id.present? && stable_id.match?(UUID_FORMAT)
      uri = URI.parse(url)
      params = URI.decode_www_form(uri.query || '')
      params << [STABLE_ID_COOKIE, stable_id]
      uri.query = URI.encode_www_form(params)
      url = uri.to_s
    end
    redirect_to url, allow_other_host: true, **options
  end
end
