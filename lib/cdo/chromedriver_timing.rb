require 'csv'
require 'cdo/cache_method'

class ChromedriverTiming
  MAX_SAMPLES = 50
  MAX_FAILURE_RATE = 0.001 # 0.1% - target failure rate after retries

  TIMING_FILE = File.expand_path('../../dashboard/test/ui/chromedriver-feature-timing.csv', __dir__).freeze

  using CacheMethod

  # In-memory storage for timing data
  # Format: { "key" => { avg_run_time: Float, avg_fail_rate: Float, num_runs: Integer } }
  def self.timing_data
    @timing_data ||= load_from_file
  end

  # Load timing data from local CSV file
  # Returns empty hash with warning if file is missing or corrupt
  def self.load_from_file
    return {} unless File.exist?(TIMING_FILE)

    data = {}
    CSV.foreach(TIMING_FILE, headers: true) do |row|
      key = row['key']
      next if key.nil? || key.empty?

      data[key] = {
        avg_run_time: row['avg_run_time'].to_f,
        avg_fail_rate: row['avg_fail_rate'].to_f,
        num_runs: row['num_runs'].to_i
      }
    end
    data
  rescue => exception
    puts "WARNING: Failed to load chromedriver timing data: #{exception.message}. Starting fresh."
    {}
  end

  # Save timing data to local CSV file
  def self.save_to_file
    CSV.open(TIMING_FILE, 'w') do |csv|
      csv << ['key', 'avg_run_time', 'avg_fail_rate', 'num_runs']
      timing_data.sort_by {|key, _| key}.each do |key, values|
        csv << [
          key,
          values[:avg_run_time].round(2),
          values[:avg_fail_rate].round(4),
          values[:num_runs]
        ]
      end
    end
  end

  # Update timing data for a single test
  # @param key [String] Test identifier (e.g., "LocalBrowser_teacher_tools_documentation_landing_page")
  # @param run_time [Float] Duration of the test run in seconds
  # @param failed [Boolean] Whether the test failed
  def self.update_timing(key, run_time, failed)
    fail_rate = failed ? 1.0 : 0.0

    if timing_data[key]
      existing = timing_data[key]
      old_num_runs = existing[:num_runs]
      old_avg_run_time = existing[:avg_run_time]
      old_avg_fail_rate = existing[:avg_fail_rate]

      # Calculate new averages using weighted formula. When at MAX_SAMPLES, use
      # MAX_SAMPLES + 1 in denominator but keep num_runs at MAX_SAMPLES.
      denominator = old_num_runs + 1
      new_avg_run_time = ((old_avg_run_time * old_num_runs) + run_time) / denominator
      new_avg_fail_rate = ((old_avg_fail_rate * old_num_runs) + fail_rate) / denominator
      new_num_runs = [old_num_runs + 1, MAX_SAMPLES].min

      timing_data[key] = {
        avg_run_time: new_avg_run_time,
        avg_fail_rate: new_avg_fail_rate,
        num_runs: new_num_runs
      }
    else
      # First run for this test
      timing_data[key] = {
        avg_run_time: run_time,
        avg_fail_rate: fail_rate,
        num_runs: 1
      }
    end
  end

  # Recommends a number of re-runs based on the flakiness score.
  # @param flakiness [Float] The flakiness score (0.0 to 1.0)
  # @return [Array] The recommended number of re-runs and confidence factor.
  def self.recommend_reruns(flakiness)
    return [1, 1.0] if flakiness.nil? || flakiness <= 0

    recommended_reruns = Math.log(MAX_FAILURE_RATE, flakiness)
    max_reruns = recommended_reruns.clamp(1, 5).ceil
    confidence = (1.0 - (flakiness**(max_reruns + 1))).round(3)
    [max_reruns, confidence]
  end

  # Returns estimated test duration accounting for expected reruns
  # @param key [String] Test identifier
  # @return [Float, nil] Estimated duration in seconds, or nil if no data
  def self.estimate_for_test(key)
    return nil unless timing_data[key]

    data = timing_data[key]
    reruns, _ = recommend_reruns(data[:avg_fail_rate])
    (reruns * data[:avg_run_time]).round(2)
  end

  # Returns flakiness (fail rate) for a test
  # @param key [String] Test identifier
  # @return [Float, nil] Flakiness from 0.0 to 1.0, or nil if no data
  def self.flakiness_for_test(key)
    return nil unless timing_data[key]
    timing_data[key][:avg_fail_rate]
  end

  # Clear cached timing data (useful for testing)
  def self.reset!
    @timing_data = nil
  end

  # Check if we should write timing data (only on PRs to test branch)
  # For Stage 2: Will check ENV['DRONE_TARGET_BRANCH'] == 'test'
  def self.should_write_data?
    # Stage 1: Always write locally for testing
    # Stage 2: ENV['DRONE_TARGET_BRANCH'] == 'test'
    true
  end
end
