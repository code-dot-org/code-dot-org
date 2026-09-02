# frozen_string_literal: true

# Client for ClassLink's One Roster proxy API.
#
# ClassLink rostering uses a central partner credential, not per-user OAuth:
# our partner key fetches per-district credentials from /applications, and
# those district credentials (a bearer token plus an opaque
# oneroster_application_id path segment) authorize One Roster calls for any
# class in that district. Districts credentials are cached per tenant with a
# TTL; a 401 self-heals by re-fetching /applications and retrying once when
# the bearer actually changed (see recover_from_401).
#
# Two path-escaping rules point in opposite directions and both matter:
# oneroster_application_id arrives pre-percent-escaped and is interpolated
# verbatim (re-encoding turns %2F into %252F and the request fails opaquely),
# while sourcedId segments are district-supplied arbitrary strings and are
# always escaped.
#
# One Roster user records carry PII we never consume (password, sms, phone,
# email, and guardian references in agents[]): user-returning methods reduce
# records to USER_FIELDS, and no method logs a raw payload.
class Clients::ClasslinkOneRoster
  # Host from ClassLink's partner documentation for the One Roster proxy.
  API_HOST = 'https://oneroster-proxy.classlink.io'

  # 1000 covers any real class or teacher in one page, so the pagination loop
  # rarely runs twice — but it stays well under the documented ceiling of
  # 10000, where a silently clamped response would be indistinguishable from
  # a legitimate final short page.
  PAGE_LIMIT = 1000

  CACHE_NAMESPACE = 'clients/classlink_one_roster/applications'
  CACHE_TTL = 5.days

  # The only fields we consume from One Roster user records. Everything else
  # (password, sms, phone, email, middleName, agents[], orgs[]) is dropped at
  # the client boundary.
  USER_FIELDS = %w(sourcedId givenName familyName role).freeze

  class Error < StandardError; end

  # A response whose expected collection key is absent or not an array —
  # including an HTTP 200 carrying an error envelope. Raised rather than read
  # as empty, so a success-shaped failure is never applied as a roster.
  class MalformedResponseError < Error; end

  # A 401 that token refresh cannot explain: the fresh bearer matches the
  # cached one, the district is no longer in /applications, or the retry with
  # a fresh bearer also 401ed. Surfaces as the district-not-enabled message.
  class DistrictAuthorizationError < Error; end

  # Returns the raw application records from /applications. This endpoint
  # honors limit/offset but sends no count headers, so the shared pagination
  # helper's short-page rule is its only terminator. The top-level status
  # field is logged when unexpected but never branched on: gating on an
  # undocumented field would turn a benign format change into a global
  # rostering outage.
  def self.fetch_applications
    records = fetch_all_pages("#{API_HOST}/applications", 'applications', bearer: CDO.classlink_roster_api_key, one_roster: false) do |body|
      status = body['status']
      Rails.logger.info("ClassLink /applications returned status=#{status.inspect}") unless status == 1
    end
    Rails.logger.warn('ClassLink /applications returned an empty application list') if records.empty?
    records
  end

  # Cache-aside lookup of the district credentials for a tenant. Returns
  # {bearer:, oneroster_application_id:} or nil when the district has no
  # enabled, active application — the legitimate "rostering unavailable"
  # state, which a blank partner key (non-production) also resolves to.
  def self.application_for_tenant(tenant_id)
    return nil if CDO.classlink_roster_api_key.blank?

    tenant = tenant_id.to_s
    cached = read_cache(tenant)
    return cached if cached

    record = fetch_applications.find {|r| r['tenant_id'].to_s == tenant && eligible?(r)}
    return nil unless record

    entry = cache_entry(record)
    write_cache(tenant, entry)
    entry
  end

  # Current-term classes the teacher teaches. Each class's title is the
  # display name; classCode and periods arrive empty and carry nothing.
  def self.teacher_classes(oneroster_application_id, bearer, teacher_sourced_id)
    one_roster_collection(
      oneroster_application_id, bearer,
      "teachers/#{escape_path_segment(teacher_sourced_id)}/classes",
      'classes'
    )
  end

  # Students enrolled in a class, reduced to USER_FIELDS. The response can
  # include teacher records, so filter to role == "student" — an exact string
  # compare, since ClassLink booleans and roles are strings and "false" is
  # truthy in Ruby.
  def self.class_students(oneroster_application_id, bearer, class_sourced_id)
    users = one_roster_collection(
      oneroster_application_id, bearer,
      "classes/#{escape_path_segment(class_sourced_id)}/students",
      'users'
    )
    users.filter_map {|user| user.slice(*USER_FIELDS) if user['role'] == 'student'}
  end

  # Teachers of a class, reduced to USER_FIELDS. Used to verify that a
  # requester actually teaches the class before an import or sync.
  def self.class_teachers(oneroster_application_id, bearer, class_sourced_id)
    users = one_roster_collection(
      oneroster_application_id, bearer,
      "classes/#{escape_path_segment(class_sourced_id)}/teachers",
      'users'
    )
    users.map {|user| user.slice(*USER_FIELDS)}
  end

  private_class_method def self.eligible?(record)
    record['enabled'] == 'true' && record['tenant_status'] == 'Active'
  end

  # oneroster_application_id is the path segment; the similarly named id and
  # application_id fields identify other things and fail opaquely in a path.
  private_class_method def self.cache_entry(record)
    {
      bearer: record['bearer'],
      oneroster_application_id: record['oneroster_application_id'],
    }
  end

  # The application id is interpolated verbatim: it arrives pre-escaped.
  private_class_method def self.one_roster_collection(oneroster_application_id, bearer, path, envelope_key)
    url = "#{API_HOST}/#{oneroster_application_id}/ims/oneroster/v1p1/#{path}"
    begin
      fetch_all_pages(url, envelope_key, bearer: bearer)
    rescue RestClient::Unauthorized
      fresh_bearer = recover_from_401(oneroster_application_id, bearer)
      begin
        fetch_all_pages(url, envelope_key, bearer: fresh_bearer)
      rescue RestClient::Unauthorized
        raise DistrictAuthorizationError, 'One Roster request still unauthorized after bearer refresh'
      end
    end
  end

  # Distinguishes bearer rotation from a genuine authorization failure: a 401
  # with a fresh bearer that differs from the one we used means our cache was
  # stale — update it and let the caller retry once. A matching bearer (or a
  # district gone from /applications) means the district's authorization
  # itself failed, which no retry fixes.
  private_class_method def self.recover_from_401(oneroster_application_id, stale_bearer)
    record = fetch_applications.find do |r|
      r['oneroster_application_id'] == oneroster_application_id && eligible?(r)
    end
    if record.nil? || record['bearer'] == stale_bearer
      raise DistrictAuthorizationError, 'One Roster request unauthorized and the district bearer is not stale'
    end

    write_cache(record['tenant_id'].to_s, cache_entry(record))
    record['bearer']
  end

  # Fetches every page of a collection. Requests are identical across pages
  # except for offset; One Roster collections also pin an explicit total
  # order (sort=sourcedId, unique) so page boundaries are stable. Each page
  # is validated structurally before it is read: the envelope key must be
  # present and an array. Termination must not require the count headers —
  # /applications sends none — so a short page (fewer records than limit)
  # always ends the loop; an empty page and a reached x-total-count are
  # redundant backstops kept so no endpoint can inherit a truncation bug.
  private_class_method def self.fetch_all_pages(url, envelope_key, bearer:, one_roster: true)
    records = []
    offset = 0
    loop do
      params = {limit: PAGE_LIMIT, offset: offset}
      if one_roster
        params[:sort] = 'sourcedId'
        params[:orderBy] = 'asc'
      end
      response = RestClient.get(url, {params: params, authorization: "Bearer #{bearer}"})
      body = JSON.parse(response.body)
      yield body if block_given?

      page = body[envelope_key]
      unless page.is_a?(Array)
        # Deliberately no body in the message: One Roster payloads carry PII.
        raise MalformedResponseError, "One Roster response missing '#{envelope_key}' collection"
      end

      records.concat(page)

      break if page.size < PAGE_LIMIT
      break if page.empty?
      total = response.headers[:x_total_count]&.to_i
      break if total && records.size >= total
      offset += PAGE_LIMIT
    end
    records
  end

  private_class_method def self.escape_path_segment(value)
    ERB::Util.url_encode(value.to_s)
  end

  private_class_method def self.read_cache(tenant_id)
    json = CDO.shared_cache.read("#{CACHE_NAMESPACE}/#{tenant_id}")
    return nil unless json
    JSON.parse(json).symbolize_keys
  end

  private_class_method def self.write_cache(tenant_id, value)
    CDO.shared_cache.write("#{CACHE_NAMESPACE}/#{tenant_id}", value.to_json, expires_in: CACHE_TTL)
  end
end
