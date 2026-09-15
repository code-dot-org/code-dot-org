require 'test_helper'
require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)

# With no partner key and no ClassLink SSO outside production, these stubbed
# tests are the only place the client's behavior is exercised before release
# — they are the safety net, not a supplement to integration testing.
class Clients::ClasslinkOneRosterTest < ActiveSupport::TestCase
  API_HOST = Clients::ClasslinkOneRoster::API_HOST
  PAGE_LIMIT = Clients::ClasslinkOneRoster::PAGE_LIMIT

  APPLICATION_ID = '%2FgVa0ed75Gs%43'.freeze
  TENANT_ID = '2222'.freeze
  BEARER = 'district-bearer-uuid'.freeze

  setup do
    CDO.stubs(:classlink_roster_api_key).returns('fake-partner-key')
    CDO.shared_cache.delete("#{Clients::ClasslinkOneRoster::CACHE_NAMESPACE}/#{TENANT_ID}")
  end

  def application_record(overrides = {})
    {
      'id' => 12345,
      'application_id' => 67890,
      'tenant_id' => 2222,
      'bearer' => BEARER,
      'tenant_name' => 'Example Tenant',
      'enabled' => 'true',
      'tenant_status' => 'Active',
      'oneroster_application_id' => APPLICATION_ID,
      'name' => 'CodeAI',
      'version' => '',
    }.merge(overrides)
  end

  def stub_applications(records, status: 1)
    stub_request(:get, "#{API_HOST}/applications").
      with(query: hash_including('limit' => PAGE_LIMIT.to_s, 'offset' => '0')).
      to_return(body: {'status' => status, 'applications' => records}.to_json)
  end

  def one_roster_url(path)
    "#{API_HOST}/#{APPLICATION_ID}/ims/oneroster/v1p1/#{path}"
  end

  def user_record(sourced_id, role: 'student')
    {
      'sourcedId' => sourced_id,
      'givenName' => 'First',
      'familyName' => "Last#{sourced_id}",
      'role' => role,
      # Fields the client must drop at its boundary:
      'password' => 'secret',
      'email' => 'student@example.com',
      'sms' => '555-1234',
      'middleName' => 'Middle',
      'agents' => [{'sourcedId' => 'G1', 'type' => 'user'}],
    }
  end

  # --- application_for_tenant: selection (task 3.6a) ---

  test 'cache miss fetches /applications, caches, and returns the credentials' do
    stub_applications([application_record])

    entry = Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    assert_equal BEARER, entry[:bearer]
    assert_equal APPLICATION_ID, entry[:oneroster_application_id]

    # Cached: a second lookup makes no second request.
    entry_again = Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    assert_equal entry, entry_again
    assert_requested :get, "#{API_HOST}/applications", query: hash_including('offset' => '0'), times: 1
  end

  test 'cache hit is served without calling /applications' do
    CDO.shared_cache.write(
      "#{Clients::ClasslinkOneRoster::CACHE_NAMESPACE}/#{TENANT_ID}",
      {bearer: BEARER, oneroster_application_id: APPLICATION_ID}.to_json
    )

    entry = Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    assert_equal BEARER, entry[:bearer]
    assert_not_requested :get, "#{API_HOST}/applications"
  end

  test 'cached path segment is oneroster_application_id, never id or application_id' do
    stub_applications([application_record])

    entry = Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    assert_equal APPLICATION_ID, entry[:oneroster_application_id]
    refute_equal '12345', entry[:oneroster_application_id].to_s
    refute_equal '67890', entry[:oneroster_application_id].to_s
  end

  test 'integer tenant_id matches a string-form lookup and vice versa' do
    stub_applications([application_record('tenant_id' => 2222)])

    assert Clients::ClasslinkOneRoster.application_for_tenant(2222)
    CDO.shared_cache.delete("#{Clients::ClasslinkOneRoster::CACHE_NAMESPACE}/#{TENANT_ID}")
    assert Clients::ClasslinkOneRoster.application_for_tenant('2222')
  end

  test 'missing applications key raises' do
    stub_request(:get, "#{API_HOST}/applications").
      with(query: hash_including('offset' => '0')).
      to_return(body: {'status' => 0}.to_json)

    assert_raises Clients::ClasslinkOneRoster::MalformedResponseError do
      Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    end
  end

  test 'non-array applications key raises' do
    stub_request(:get, "#{API_HOST}/applications").
      with(query: hash_including('offset' => '0')).
      to_return(body: {'applications' => 'nope'}.to_json)

    assert_raises Clients::ClasslinkOneRoster::MalformedResponseError do
      Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    end
  end

  test 'well-formed empty list reports and yields the unavailable path without raising' do
    stub_applications([])
    Observability::Errors.expects(:report).with(regexp_matches(/empty application list/))

    assert_nil Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
  end

  test 'unexpected top-level status is reported but does not change the outcome' do
    stub_applications([application_record], status: 200)
    Observability::Errors.expects(:report).
      with(regexp_matches(/unexpected status/), context: {status: 200})

    assert Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
  end

  test 'enabled "false" is rejected despite being a truthy string' do
    stub_applications([application_record('enabled' => 'false')])
    assert_nil Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
  end

  test 'tenant_status other than Active is rejected' do
    stub_applications([application_record('tenant_status' => 'Inactive')])
    assert_nil Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
  end

  test 'a list not containing the tenant yields the rostering-unavailable path' do
    stub_applications([application_record('tenant_id' => 9999)])
    assert_nil Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
  end

  test 'blank partner key resolves to unavailable without any request' do
    CDO.stubs(:classlink_roster_api_key).returns('')

    assert_nil Clients::ClasslinkOneRoster.application_for_tenant(TENANT_ID)
    assert_not_requested :get, "#{API_HOST}/applications"
  end

  # --- 401 recovery (tasks 3.4, 3.6) ---

  test '401 with a rotated bearer updates the cache and retries once' do
    url = one_roster_url('classes/33333/students')
    fresh_bearer = 'fresh-bearer-uuid'
    stub_request(:get, url).
      with(query: hash_including('offset' => '0'), headers: {'Authorization' => "Bearer #{BEARER}"}).
      to_return(status: 401)
    stub_request(:get, url).
      with(query: hash_including('offset' => '0'), headers: {'Authorization' => "Bearer #{fresh_bearer}"}).
      to_return(body: {'users' => [user_record('1')]}.to_json)
    stub_applications([application_record('bearer' => fresh_bearer)])

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal ['1'], (students.map {|s| s['sourcedId']})

    cached = JSON.parse(CDO.shared_cache.read("#{Clients::ClasslinkOneRoster::CACHE_NAMESPACE}/#{TENANT_ID}"))
    assert_equal fresh_bearer, cached['bearer']
  end

  test '401 with a matching bearer raises DistrictAuthorizationError without retry' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(status: 401)
    stub_applications([application_record])

    assert_raises Clients::ClasslinkOneRoster::DistrictAuthorizationError do
      Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    end
    assert_requested :get, url, query: hash_including('offset' => '0'), times: 1
  end

  test '401 for a district gone from /applications raises DistrictAuthorizationError' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(status: 401)
    stub_applications([])
    # The re-fetch returns an empty list, which reports on its own.
    Observability::Errors.stubs(:report)

    assert_raises Clients::ClasslinkOneRoster::DistrictAuthorizationError do
      Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    end
  end

  test 'retry after refresh that also 401s raises DistrictAuthorizationError' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(status: 401)
    stub_applications([application_record('bearer' => 'fresh-bearer-uuid')])

    assert_raises Clients::ClasslinkOneRoster::DistrictAuthorizationError do
      Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    end
    assert_requested :get, url, query: hash_including('offset' => '0'), times: 2
  end

  # --- user record handling (tasks 3.1a, 3.1c) ---

  test 'class_students filters to role == "student" and drops unconsumed fields' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => [user_record('1'), user_record('2', role: 'teacher')]}.to_json)

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal ['1'], (students.map {|s| s['sourcedId']})
    assert_equal %w(sourcedId givenName familyName role).sort, students.first.keys.sort
  end

  test 'class_teachers returns reduced teacher records' do
    url = one_roster_url('classes/33333/teachers')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => [user_record('11111', role: 'teacher')]}.to_json)

    teachers = Clients::ClasslinkOneRoster.class_teachers(APPLICATION_ID, BEARER, '33333')
    assert_equal ['11111'], (teachers.map {|t| t['sourcedId']})
    assert_equal %w(sourcedId givenName familyName role).sort, teachers.first.keys.sort
  end

  test 'teacher_classes reads the classes envelope' do
    url = one_roster_url('teachers/7_1553/classes')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'classes' => [{'sourcedId' => '33333', 'title' => 'Sci5 (Sci5)'}]}.to_json)

    classes = Clients::ClasslinkOneRoster.teacher_classes(APPLICATION_ID, BEARER, '7_1553')
    assert_equal 'Sci5 (Sci5)', classes.first['title']
  end

  # --- path escaping (task 3.1d) ---

  test 'application id containing percent-escapes is interpolated verbatim' do
    url = one_roster_url('classes/33333/students')
    request = stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => []}.to_json)

    Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_requested request
  end

  test 'sourcedId path segments are escaped, including a pipe' do
    url = "#{API_HOST}/#{APPLICATION_ID}/ims/oneroster/v1p1/classes/a%7Cb/students"
    request = stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => []}.to_json)

    Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, 'a|b')
    assert_requested request
  end

  # --- pagination (tasks 3.2, 3.2a, 3.7) ---

  def page_of_users(count, start)
    (start...(start + count)).map {|i| user_record(i.to_s)}
  end

  test 'missing collection key on a 200 raises rather than reading as empty' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'imsx_codeMajor' => 'failure'}.to_json)

    assert_raises Clients::ClasslinkOneRoster::MalformedResponseError do
      Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    end
  end

  test 'single page below the limit makes exactly one request' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => page_of_users(2, 0)}.to_json)

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal 2, students.size
    assert_requested :get, url, query: hash_including('limit' => PAGE_LIMIT.to_s), times: 1
  end

  test 'multi-page fetch stitches records across offsets and stops on the short page' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => page_of_users(PAGE_LIMIT, 0)}.to_json, headers: {'x-total-count' => (PAGE_LIMIT + 5).to_s})
    stub_request(:get, url).
      with(query: hash_including('offset' => PAGE_LIMIT.to_s)).
      to_return(body: {'users' => page_of_users(5, PAGE_LIMIT)}.to_json, headers: {'x-total-count' => (PAGE_LIMIT + 5).to_s})

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal PAGE_LIMIT + 5, students.size
    assert_equal (0...(PAGE_LIMIT + 5)).map(&:to_s), (students.map {|s| s['sourcedId']})
  end

  test 'multi-page fetch with no count headers terminates on the short page' do
    # The /applications case: it sends neither x-count nor x-total-count.
    records = (0...PAGE_LIMIT).map {|i| application_record('tenant_id' => i)}
    stub_request(:get, "#{API_HOST}/applications").
      with(query: hash_including('offset' => '0')).
      to_return(body: {'status' => 1, 'applications' => records}.to_json)
    stub_request(:get, "#{API_HOST}/applications").
      with(query: hash_including('offset' => PAGE_LIMIT.to_s)).
      to_return(body: {'status' => 1, 'applications' => [application_record('tenant_id' => 2222)]}.to_json)

    apps = Clients::ClasslinkOneRoster.fetch_applications
    assert_equal PAGE_LIMIT + 1, apps.size
  end

  test 'empty page stops the loop even when x-total-count claims more' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => page_of_users(PAGE_LIMIT, 0)}.to_json, headers: {'x-total-count' => (3 * PAGE_LIMIT).to_s})
    stub_request(:get, url).
      with(query: hash_including('offset' => PAGE_LIMIT.to_s)).
      to_return(body: {'users' => []}.to_json, headers: {'x-total-count' => (3 * PAGE_LIMIT).to_s})

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal PAGE_LIMIT, students.size
    assert_requested :get, url, query: hash_including('offset' => PAGE_LIMIT.to_s), times: 1
    assert_not_requested :get, url, query: hash_including('offset' => (2 * PAGE_LIMIT).to_s)
  end

  test 'exact-multiple-of-limit total makes one extra request that returns zero and stops' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => page_of_users(PAGE_LIMIT, 0)}.to_json)
    stub_request(:get, url).
      with(query: hash_including('offset' => PAGE_LIMIT.to_s)).
      to_return(body: {'users' => []}.to_json)

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal PAGE_LIMIT, students.size
    assert_requested :get, url, query: hash_including('offset' => PAGE_LIMIT.to_s), times: 1
  end

  test 'x-total-count reached stops the loop without an extra request' do
    url = one_roster_url('classes/33333/students')
    stub_request(:get, url).
      with(query: hash_including('offset' => '0')).
      to_return(body: {'users' => page_of_users(PAGE_LIMIT, 0)}.to_json, headers: {'x-total-count' => PAGE_LIMIT.to_s})

    students = Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_equal PAGE_LIMIT, students.size
    assert_not_requested :get, url, query: hash_including('offset' => PAGE_LIMIT.to_s)
  end

  test 'sort and orderBy are present and identical on every One Roster page request' do
    url = one_roster_url('classes/33333/students')
    ordering = {'sort' => 'sourcedId', 'orderBy' => 'asc'}
    stub_request(:get, url).
      with(query: hash_including(ordering.merge('offset' => '0'))).
      to_return(body: {'users' => page_of_users(PAGE_LIMIT, 0)}.to_json)
    stub_request(:get, url).
      with(query: hash_including(ordering.merge('offset' => PAGE_LIMIT.to_s))).
      to_return(body: {'users' => []}.to_json)

    Clients::ClasslinkOneRoster.class_students(APPLICATION_ID, BEARER, '33333')
    assert_requested :get, url, query: hash_including(ordering.merge('offset' => '0'))
    assert_requested :get, url, query: hash_including(ordering.merge('offset' => PAGE_LIMIT.to_s))
  end

  test '/applications is fetched with an explicit limit' do
    stub_applications([application_record])

    Clients::ClasslinkOneRoster.fetch_applications
    assert_requested :get, "#{API_HOST}/applications", query: hash_including('limit' => PAGE_LIMIT.to_s)
  end
end
