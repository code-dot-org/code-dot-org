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
  TEST_ACCOUNT_USERNAME = 'testcodeorg'.freeze

  # Each feature should be retried until the chance of flaky failure is less than this amount.
  MAX_FAILURE_RATE = 0.005 # 0.5%

  # Queries the SauceLabs API for jobs
  # @param options [Hash] Optional, options overrides.
  # @return [JSON] The JSON parsed response.
  # @see https://wiki.saucelabs.com/display/DOCS/Job+Methods
  def self.get_jobs(options = {})
    options[:limit] ||= PER_REQUEST
    options[:full] ||= 'true'
    options[:skip] ||= 0
    url =  "https://saucelabs.com/rest/v1/#{TEST_ACCOUNT_USERNAME}/jobs"
    url += "?" + URI.encode_www_form(options)
    response = RestClient::Request.execute(
      method: :get,
      url: url,
      user: sauce_username,
      password: sauce_key
    )
    JSON.parse(response.body)
  end

  # Summarizes the job results from SauceLabs.
  # @param num_requests [Integer] The number of API calls.
  # @param per_request [Integer] The number of results per call.
  # @return [Array] Of summary including name, and total and failed counts.
  def self.summarize_by_job(num_requests = NUM_REQUESTS, per_request = PER_REQUEST)
    jobs = []
    num_requests.times do
      jobs += get_jobs(limit: per_request, skip: jobs.count)
    end
    jobs.group_by {|job| job['name']}.map do |name, samples|
      {
        name: name,
        total: samples.count,
        failed: samples.count {|job| !job["passed"]}
      }
    end
  end

  # Calculates the flakiness per test
  # @return [Hash] The test name to flakiness score.
  def self.calculate_test_flakiness
    name_to_flakiness = {}
    summarize_by_job.each do |summary|
      if summary[:total] > MIN_SAMPLES
        name_to_flakiness[summary[:name]] = (1.0 * summary[:failed] / summary[:total]).round(2)
      end
    end
    name_to_flakiness
  end

  # Recommends a number of re-runs based on the flakiness score.
  # @param flakiness [Float] The flakiness score.
  # @return [Array] The recommended number of re-runs and confidence factor.
  def self.recommend_reruns(flakiness)
    recommended_reruns = Math.log(MAX_FAILURE_RATE, flakiness).ceil
    max_reruns = [1, [recommended_reruns, 5].min].max
    confidence = (1.0 - flakiness**(max_reruns + 1)).round(3)
    return [max_reruns, confidence]
  end

  CACHE_FILENAME = (File.dirname(__FILE__) + "/../../dashboard/tmp/cache/flakiness.json").freeze
  CACHE_TTL = 86400 # 1 day of seconds

  def self.cache_test_flakiness
    if File.exist?(CACHE_FILENAME) &&
        (Time.now - File.mtime(CACHE_FILENAME)) < CACHE_TTL
      return JSON.parse(File.read(CACHE_FILENAME))
    end

    @@test_flakiness = calculate_test_flakiness

    File.open(CACHE_FILENAME, 'w') {|f| f.write(JSON.dump(@@test_flakiness))}

    @@test_flakiness
  end

  def self.test_flakiness
    @@test_flakiness ||= cache_test_flakiness
  end
end
