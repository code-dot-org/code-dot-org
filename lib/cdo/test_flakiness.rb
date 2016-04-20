require 'rest-client'

class TestFlakiness
  def self.sauce_username
    ENV['SAUCE_USERNAME'] || CDO.saucelabs_username
  end

  def self.sauce_key
    ENV['SAUCE_ACCESS_KEY'] || CDO.saucelabs_authkey
  end

  PER_REQUEST = 1500 # maximum returned per API call (undocumented)
  NUM_REQUESTS = 50 # rate limit: 15 request/s with 300 request burst https://wiki.saucelabs.com/display/DOCS/Rate+Limits+for+the+Sauce+Labs+REST+API
  MIN_SAMPLES = 10
  TEST_ACCOUNT_USERNAME = 'testcodeorg'

  def TestFlakiness.calculate_test_flakiness
    jobs = []

    NUM_REQUESTS.times do
      # docs for this API: https://wiki.saucelabs.com/display/DOCS/Job+Methods
      url =  "https://saucelabs.com/rest/v1/#{TEST_ACCOUNT_USERNAME}/jobs"
      url += "?" + URI.encode_www_form(limit: PER_REQUEST, full: 'true', skip: jobs.count)

      response = RestClient::Request.execute(method: :get,
                                             url: url,
                                             user: sauce_username,
                                             password: sauce_key)
      jobs += JSON.parse(response.body)
    end

    jobs_by_name = jobs.group_by {|job| job['name']}

    name_to_flakiness = {}

    jobs_by_name.each do |name, samples|
      total = samples.count
      if total > MIN_SAMPLES
        failed = samples.count {|job| !job["passed"]}
        name_to_flakiness[name] = (1.0 * failed / total).round(2)
      end
    end

    name_to_flakiness
  end

  CACHE_FILENAME = File.dirname(__FILE__) + "/../../dashboard/tmp/cache/flakiness.json"
  CACHE_TTL = 86400 # 1 day of seconds

  def TestFlakiness.cache_test_flakiness
    if File.exist?(CACHE_FILENAME) &&
        (Time.now - File.mtime(CACHE_FILENAME)) < CACHE_TTL
      return JSON.parse(File.read(CACHE_FILENAME))
    end

    @@test_flakiness = calculate_test_flakiness

    File.open(CACHE_FILENAME, 'w') {|f| f.write(JSON.dump(@@test_flakiness)) }

    @@test_flakiness
  end

  def TestFlakiness.test_flakiness
    @@test_flakiness ||= cache_test_flakiness
  end
end
