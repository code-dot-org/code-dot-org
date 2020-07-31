require 'rest-client'
require 'cdo/cache_method'

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
  MAX_FAILURE_RATE = 0.001 # 0.1%

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
  # @return [Hash] Of summary by name including total and failed counts.
  def self.summarize_by_job(num_requests = NUM_REQUESTS, per_request = PER_REQUEST)
    jobs = []
    num_requests.times do
      options = {
        limit: per_request,
        skip: jobs.count,
        from: from_timestamp
      }.compact
      new_jobs = get_jobs(options)
      break if new_jobs.empty?
      jobs += new_jobs
    end
    jobs.group_by {|job| job['name']}.map do |name, samples|
      passed = samples.select {|job| job['passed']}
      next if passed.empty?
      summary = {
        'name' => name,
        'total' => samples.count,
        'failed' => samples.count - passed.count,
        'fail_rate' => (1.0 * (samples.count - passed.count) / samples.count).round(2),
        'duration' => 1.0 * passed.sum {|job| job['end_time'].to_f - job['start_time'].to_f} / passed.count
      }
      [name, summary]
    end.compact.to_h
  end

  # Recommends a number of re-runs based on the flakiness score.
  # @param flakiness [Float] The flakiness score.
  # @return [Array] The recommended number of re-runs and confidence factor.
  def self.recommend_reruns(flakiness)
    recommended_reruns = Math.log(MAX_FAILURE_RATE, flakiness)
    max_reruns = [1, [recommended_reruns, 5].min].max.ceil
    confidence = (1.0 - flakiness**(max_reruns + 1)).round(3)
    return [max_reruns, confidence]
  end

  FLAKINESS_TIMESTAMP_FILENAME = (File.dirname(__FILE__) + "/../../bin/ui_test_flakiness_timestamp.json").freeze

  # Sets a timestamp that corresponds to the oldest results we will request from SauceLabs
  # for calculating flakiness.
  # @param timestamp [Integer] Unix timestamp (e.g., Time.now.to_i)
  def self.reset(timestamp)
    File.open(FLAKINESS_TIMESTAMP_FILENAME, "w") {|f| f.write({timestamp: timestamp}.to_json)}
  end

  CACHE_FILENAME = (File.dirname(__FILE__) + "/../../dashboard/tmp/cache/test_summary.json").freeze
  CACHE_TTL = 86400 # 1 day of seconds

  using CacheMethod

  cached def self.test_summary
    if File.exist?(CACHE_FILENAME) &&
        (Time.now - File.mtime(CACHE_FILENAME)) < CACHE_TTL
      return JSON.parse(File.read(CACHE_FILENAME))
    end

    summarize_by_job.reject {|_, s| s['total'] < MIN_SAMPLES}.tap do |summary|
      File.write(CACHE_FILENAME, JSON.dump(summary))
    end
  end

  cached def self.test_flakiness
    test_summary.transform_values {|s| s['fail_rate']}
  end

  cached def self.test_duration
    test_summary.transform_values {|s| s['duration'].round(2)}
  end

  cached def self.test_estimate
    test_summary.transform_values {|s| (recommend_reruns(s['fail_rate']).first * s['duration']).round(2)}
  end

  # Retrieves / calculates flakiness for given test run identifier.
  # Combines all values containing the provided identifier as a prefix into a combined summary.
  cached def self.summary_for(method, test_run_identifier)
    flakiness = self.method(method).call

    # Combine all scenario-specific identifiers.
    scenario_estimates = flakiness.select {|name, _| name =~ /#{test_run_identifier}.+/}
    scenario = scenario_estimates.values.sum
    scenario = scenario.to_f / scenario_estimates.length if method == :test_flakiness

    feature = flakiness[test_run_identifier]
    if scenario_estimates.empty?
      feature
    elsif feature.nil?
      scenario
    else
      # If values for scenarios and feature both exist, average the two.
      (scenario + feature) / 2.0
    end
  end

  cached def self.from_timestamp
    return nil unless File.exist?(FLAKINESS_TIMESTAMP_FILENAME)
    timestamp = JSON.parse(File.read(FLAKINESS_TIMESTAMP_FILENAME))['timestamp']
    return nil unless timestamp.is_a?(Integer)
    current_time = Time.now.to_i
    raise "Timestamp #{timestamp} is in the future. Current server time is #{current_time}." if timestamp > current_time
    timestamp
  end
end
