#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
require_relative '../../../deployment'

ROOT = File.expand_path('../../../..', __FILE__)

# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= "#{ROOT}//Gemfile"
require 'bundler'
require 'bundler/setup'

require 'cdo/aws/s3'
require 'cdo/chat_client'
require 'cdo/git_utils'
require 'cdo/rake_utils'
require 'cdo/test_flakiness'

require 'haml'
require 'json'
require 'yaml'
require 'optparse'
require 'ostruct'
require 'colorize'
require 'open3'
require 'parallel'
require 'securerandom'
require 'socket'
require 'parallel_tests/cucumber/scenarios'

require_relative './utils/selenium_browser'

require 'active_support/core_ext/object/blank'

ENV['BUILD'] = `git rev-parse --short HEAD`

GIT_BRANCH = GitUtils.current_branch
COMMIT_HASH = RakeUtils.git_revision
S3_LOGS_BUCKET = 'cucumber-logs'
S3_LOGS_PREFIX = ENV['CI'] ? "circle/#{ENV['CIRCLE_BUILD_NUM']}" : "#{Socket.gethostname}/#{GIT_BRANCH}"
LOG_UPLOADER = AWS::S3::LogUploader.new(S3_LOGS_BUCKET, S3_LOGS_PREFIX, true)

# Upload the given log to the cucumber-logs s3 bucket.
# @param [String] filename of log file to be uploaded.
# @return [String] a public hyperlink to the uploaded log, or empty string.
def upload_log_and_get_public_link(filename, metadata)
  return '' unless $options.html
  log_url = LOG_UPLOADER.upload_file(filename, {metadata: metadata})
  " <a href='#{log_url}'>☁ Log on S3</a>"
rescue Exception => msg
  ChatClient.log "Uploading log to S3 failed: #{msg}"
  return ''
end

$options = OpenStruct.new
$options.config = nil
$options.browser = nil
$options.os_version = nil
$options.browser_version = nil
$options.feature = nil
$options.pegasus_domain = 'test.code.org'
$options.dashboard_domain = 'test-studio.code.org'
$options.hourofcode_domain = 'test.hourofcode.com'
$options.local = nil
$options.html = nil
$options.out = nil
$options.maximize = nil
$options.auto_retry = false
$options.magic_retry = false
$options.parallel_limit = 1
$options.abort_when_failures_exceed = Float::INFINITY

# start supporting some basic command line filtering of which browsers we run against
opt_parser = OptionParser.new do |opts|
  opts.banner = "Usage: runner.rb [options] \
    Example: runner.rb -b chrome -o 7 -v 31 -f features/sharepage.feature \
    Example: runner.rb -d localhost:3000 -t \
    Example: runner.rb -l \
    Example: runner.rb -r"
  opts.separator ""
  opts.separator "Specific options:"
  opts.on("-c", "--config BrowserConfigName,BrowserConfigName1", Array, "Specify the name of one or more of the configs from ") do |c|
    $options.config = c
  end
  opts.on("-b", "--browser BrowserName", String, "Specify a browser") do |b|
    $options.browser = b
  end
  opts.on("-o", "--os_version OS Version", String, "Specify an os version") do |os|
    $options.os_version = os
  end
  opts.on("-v", "--browser_version Browser Version", String, "Specify a browser version") do |bv|
    $options.browser_version = bv
  end
  opts.on("-f", "--feature Feature", Array, "Single feature or comma separated list of features to run") do |f|
    $options.feature = f
  end
  opts.on("-l", "--local", "Use local webdriver (not Saucelabs) and local domains") do
    $options.local = 'true'
    $options.pegasus_domain = 'localhost.code.org:3000'
    $options.dashboard_domain = 'localhost.studio.code.org:3000'
    $options.hourofcode_domain = 'localhost.hourofcode.com:3000'
  end
  opts.on("-p", "--pegasus Domain", String, "Specify an override domain for code.org, e.g. localhost.code.org:3000") do |p|
    if p == 'localhost:3000'
      print "WARNING: Some tests may fail using '-p localhost:3000' because cookies will not be available.\n"\
            "Try '-p localhost.code.org:3000' instead (this is the default when using '-l').\n"
    end
    $options.pegasus_domain = p
  end
  opts.on("-d", "--dashboard Domain", String, "Specify an override domain for studio.code.org, e.g. localhost.studio.code.org:3000") do |d|
    if d == 'localhost:3000'
      print "WARNING: Some tests may fail using '-d localhost:3000' because cookies will not be available.\n"\
            "Try '-d localhost.studio.code.org:3000' instead (this is the default when using '-l').\n"
    end
    $options.dashboard_domain = d
  end
  opts.on("--hourofcode Domain", String, "Specify an override domain for hourofcode.com, e.g. localhost.hourofcode.com:3000") do |d|
    $options.hourofcode = d
  end
  opts.on("-r", "--real_mobile_browser", "Use real mobile browser, not emulator") do
    $options.realmobile = 'true'
  end
  opts.on("-m", "--maximize", "Maximize local webdriver window on startup") do
    $options.maximize = true
  end
  opts.on("--circle", "Whether is CircleCI (skip failing Circle tests)") do
    $options.is_circle = true
  end
  opts.on("--html", "Use html reporter") do
    $options.html = true
  end
  opts.on("--out filename", String, "Output filename") do |f|
    $options.out = f
  end
  opts.on("-e", "--eyes", "Run only Applitools eyes tests") do
    $options.run_eyes_tests = true
  end
  opts.on("-a", "--auto_retry", "Retry tests that fail once") do
    $options.auto_retry = true
  end
  opts.on("--retry_count TimesToRetry", String, "Retry tests that fail a given # of times") do |times_to_retry|
    $options.retry_count = times_to_retry.to_i
  end
  opts.on("--magic_retry", "Magically retry tests based on how flaky they are") do
    $options.magic_retry = true
  end
  opts.on("--abort_when_failures_exceed Limit", Numeric, "Maximum allowed feature failures before the whole test run is aborted (default is infinity)") do |max_failures|
    $options.abort_when_failures_exceed = max_failures
  end
  opts.on("-n", "--parallel ParallelLimit", String, "Maximum number of browsers to run in parallel (default is 1)") do |p|
    $options.parallel_limit = p.to_i
  end
  opts.on("--db", String, "Run scripts requiring DB access regardless of environment (otherwise restricted to development/test).") do
    $options.force_db_access = true
  end
  opts.on("-V", "--verbose", "Verbose") do
    $options.verbose = true
  end
  opts.on("--fail_fast", "Fail a feature as soon as a scenario fails") do
    $options.fail_fast = true
  end
  opts.on('-s', '--script Scriptname', String, 'Run tests associated with this script, or have Scriptname somewhere in the URL') do |scriptname|
    f = `egrep -r "Given I am on .*#{scriptname.delete(' ').downcase}" . | cut -f1 -d ':' | sort | uniq | tr '\n' ,`
    $options.feature = f.split ','
  end
  opts.on('--with-status-page', 'Generate a test status summary page for this test run') do
    $options.with_status_page = true
    $options.html = true # Implied by wanting a status page
  end
  opts.on('--output-synopsis', 'Print a synopsis of failing scenarios') do
    $options.output_synopsis = true
  end
  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
end

opt_parser.parse!(ARGV)
passed_features = ARGV + ($options.feature || [])
# Standardize: Drop leading dot-slash on feature paths
passed_features.map! {|feature| feature.gsub(/^\.\//, '')}

$browsers = JSON.load(open("browsers.json"))

$lock = Mutex.new
$suite_start_time = Time.now
$suite_success_count = 0
$suite_fail_count = 0
# How many flaky test reruns occurred across all tests (ignoring the initial attempt).
$total_flaky_reruns = 0
$total_flaky_successful_reruns = 0
$failures = []

if $options.local
  SeleniumBrowser.ensure_chromedriver_running
  $browsers = [{
    "browser": "local",
    "name": "ChromeDriver",
    "browserName": "chrome",
    "version": "latest"
  }]
end

if $options.config
  $browsers = $options.config.map do |name|
    $browsers.detect {|b| b['name'] == name}.tap do |browser|
      unless browser
        puts "No config exists with name #{name}"
        exit
      end
    end
  end
end

$logfile = File.open("success.log", "w")
$errfile = File.open("error.log", "w")
$errbrowserfile = File.open("errorbrowsers.log", "w")

def prefix_string(msg, prefix)
  msg.to_s.lines.map {|line| "#{prefix}#{line}"}.join
end

def log_success(msg)
  $logfile.puts msg
  puts msg if $options.verbose
end

def log_error(msg)
  $errfile.puts msg
  puts msg if $options.verbose
end

def log_browser_error(msg)
  $errbrowserfile.puts msg
  puts msg if $options.verbose
end

def run_tests(env, feature, arguments, log_prefix)
  start_time = Time.now
  scenario_count = ParallelTests::Cucumber::Scenarios.all([feature], test_options: arguments).length
  if scenario_count.zero?
    return true, '0 scenarios', '', Time.now - start_time
  end

  cmd = "cucumber #{feature} #{arguments}"
  puts "#{log_prefix}#{cmd}"
  Open3.popen3(env, cmd) do |stdin, stdout, stderr, wait_thr|
    stdin.close
    stdout = stdout.read
    stderr = stderr.read
    succeeded = wait_thr.value.exitstatus == 0
    return succeeded, stdout, stderr, Time.now - start_time
  end
end

if $options.force_db_access
  $options.pegasus_db_access = true
  $options.dashboard_db_access = true
elsif ENV['CI']
  $options.pegasus_db_access = true
  $options.dashboard_db_access = true
elsif rack_env?(:development)
  $options.pegasus_db_access = true if $options.pegasus_domain =~ /(localhost|ngrok)/
  $options.dashboard_db_access = true if $options.dashboard_domain =~ /(localhost|ngrok)/
elsif rack_env?(:test)
  $options.pegasus_db_access = true if $options.pegasus_domain =~ /test/
  $options.dashboard_db_access = true if $options.dashboard_domain =~ /test/
end

all_features = Dir.glob('features/**/*.feature')
features_to_run = passed_features.empty? ? all_features : passed_features
browser_features = $browsers.product features_to_run

ENV['BATCH_NAME'] = "#{GIT_BRANCH} | #{Time.now}"

test_type = $options.run_eyes_tests ? 'Eyes' : 'UI'
applitools_batch_url = nil
ChatClient.log "Starting #{browser_features.count} <b>dashboard</b> #{test_type} tests in #{$options.parallel_limit} threads..."
puts
if test_type == 'Eyes'
  # Generate a batch ID, unique to this test run.
  # Each Eyes instance will use the same one so that tests from this
  # run get grouped together. This gets used in eyes_steps.rb.
  # See "Aggregating tests from different processes"
  # http://support.applitools.com/customer/en/portal/articles/2516398-aggregating-tests-from-different-processes-machines
  ENV['BATCH_ID'] = "#{GIT_BRANCH}_#{SecureRandom.uuid}".gsub(/[^\w-]+/, '_')
  applitools_batch_url = "https://eyes.applitools.com/app/batches/?startInfoBatchId=#{ENV['BATCH_ID']}&hideBatchList=true"
  ChatClient.log "Batching eyes tests as <a href=\"#{applitools_batch_url}\">#{ENV['BATCH_NAME']}</a>."
end

status_page_url = nil
if $options.with_status_page
  test_status_template = File.read('test_status.haml')
  haml_engine = Haml::Engine.new(test_status_template)
  status_page_filename = "test_status_#{test_type}.html"
  scheme = (rack_env?(:development) && !CDO.https_development) ? 'http:' : 'https:'
  status_page_url = CDO.studio_url('/ui_test/' + status_page_filename, scheme)
  File.open(status_page_filename, 'w') do |file|
    file.write haml_engine.render(
      Object.new,
      {
        api_origin: CDO.studio_url('', scheme),
        s3_bucket: S3_LOGS_BUCKET,
        s3_prefix: S3_LOGS_PREFIX,
        type: test_type,
        git_branch: GIT_BRANCH,
        commit_hash: COMMIT_HASH,
        start_time: $suite_start_time,
        browsers: $browsers.map {|b| b['name'].nil? ? 'UnknownBrowser' : b['name']},
        features: features_to_run
      }
    )
  end
  ChatClient.log "A <a href=\"#{status_page_url}\">status page</a> has been generated for this #{test_type} test run."
end

def test_run_identifier(browser, feature)
  feature_name = feature.gsub('features/', '').gsub('.feature', '').tr('/', '_')
  browser_name = browser_name_or_unknown(browser)
  "#{browser_name}_#{feature_name}" + ($options.run_eyes_tests ? '_eyes' : '')
end

def browser_name_or_unknown(browser)
  browser['name'] || 'UnknownBrowser'
end

$calculate_flakiness = true
# Retrieves / calculates flakiness for given test run identifier, giving up for
# the rest of this script execution if an error occurs during calculation.
# returns the flakiness from 0.0 to 1.0 or nil if flakiness is unknown
def flakiness_for_test(test_run_identifier)
  return nil unless $calculate_flakiness
  TestFlakiness.test_flakiness[test_run_identifier]
rescue Exception => e
  puts "Error calculating flakinesss: #{e.message}. Will stop calculating test flakiness for this run."
  $calculate_flakiness = false
  nil
end

# Sort by flakiness (most flaky at end of array, will get run first)
browser_features.sort! do |browser_feature_a, browser_feature_b|
  (flakiness_for_test(test_run_identifier(browser_feature_b[0], browser_feature_b[1])) || 1.0) <=>
    (flakiness_for_test(test_run_identifier(browser_feature_a[0], browser_feature_a[1])) || 1.0)
end

# We track the number of failed features in this test run so we can abort the run
# if we exceed a certain limit.  See $options.abort_when_failures_exceed.
failed_features = 0

# This lambda function is called by Parallel.map each time it needs a new work
# item.  It should return Parallel::Stop when there is no more work to do.
next_feature = lambda do
  if failed_features > $options.abort_when_failures_exceed
    message = "Abandoning test run; passed limit of #{$options.abort_when_failures_exceed} failed features."
    ChatClient.log message, color: 'red'
    return Parallel::Stop
  end
  return Parallel::Stop if browser_features.empty?
  browser_features.pop
end

parallel_config = {
  # Run in parallel threads on CircleCI (less memory), processes on main test machine (better CPU utilization)
  in_threads: ENV['CI'] ? $options.parallel_limit : nil,
  in_processes: ENV['CI'] ? nil : $options.parallel_limit,

  # This 'finish' lambda runs on the main thread after each Parallel.map work
  # item is completed.
  finish: lambda do |_, _, result|
    succeeded, _, _ = result
    # Count failures so we can abort the whole test run if we exceed the limit
    failed_features += 1 unless succeeded
  end
}
run_results = Parallel.map(next_feature, parallel_config) do |browser, feature|
  browser_name = browser_name_or_unknown(browser)
  test_run_string = test_run_identifier(browser, feature)
  log_prefix = "[#{feature.gsub(/.*features\//, '').gsub('.feature', '')}] "

  if $options.pegasus_domain =~ /test/ && rack_env?(:development) && RakeUtils.git_updates_available?
    message = "Killing <b>dashboard</b> UI tests (changes detected)"
    ChatClient.log message, color: 'yellow'
    raise Parallel::Kill
  end

  if $options.browser && browser['browser'] && $options.browser.casecmp(browser['browser']) != 0
    next
  end
  if $options.os_version && browser['os_version'] && $options.os_version.casecmp(browser['os_version']) != 0
    next
  end
  if $options.browser_version && browser['browser_version'] && $options.browser_version.casecmp(browser['browser_version']) != 0
    next
  end

  # Don't log individual tests because we hit ChatClient rate limits
  # ChatClient.log "Testing <b>dashboard</b> UI with <b>#{test_run_string}</b>..."
  puts "#{log_prefix}Starting UI tests for #{test_run_string}"

  run_environment = {}
  run_environment['BROWSER_CONFIG'] = browser_name

  run_environment['BS_ROTATABLE'] = browser['rotatable'] ? "true" : "false"
  run_environment['PEGASUS_TEST_DOMAIN'] = $options.pegasus_domain if $options.pegasus_domain
  run_environment['DASHBOARD_TEST_DOMAIN'] = $options.dashboard_domain if $options.dashboard_domain
  run_environment['HOUROFCODE_TEST_DOMAIN'] = $options.hourofcode_domain if $options.hourofcode_domain
  run_environment['TEST_LOCAL'] = $options.local ? "true" : "false"
  run_environment['MAXIMIZE_LOCAL'] = $options.maximize ? "true" : "false"
  run_environment['MOBILE'] = browser['mobile'] ? "true" : "false"
  run_environment['FAIL_FAST'] = $options.fail_fast ? "true" : nil
  run_environment['TEST_RUN_NAME'] = test_run_string

  # disable some stuff to make require_rails_env run faster within cucumber.
  # These things won't be disabled in the dashboard instance we're testing against.
  run_environment['SKIP_I18N_INIT'] = 'true'
  run_environment['SKIP_DASHBOARD_ENABLE_PEGASUS'] = 'true'

  # Force Applitools eyes to use a consistent host OS identifier for now
  # BrowserStack was reporting Windows 6.0 and 6.1, causing different baselines
  run_environment['APPLITOOLS_HOST_OS'] = 'Windows 6x' unless browser['mobile']

  if $options.html
    if $options.out
      html_output_filename = $options.out
    else
      html_output_filename = test_run_string + "_output.html"
    end
  end

  # returns the first line of the first selenium error in the html output file.
  def first_selenium_error(filename)
    html = File.read(filename)
    error_regex = %r{<div class="message"><pre>(.*?)</pre>}m
    match = error_regex.match(html)
    full_error = match && match[1]
    full_error ? full_error.strip.split("\n").first : 'no selenium error found'
  end

  arguments = ''
  arguments += " -t #{$options.run_eyes_tests && !browser['mobile'] ? '' : '~'}@eyes"
  arguments += " -t #{$options.run_eyes_tests && browser['mobile'] ? '' : '~'}@eyes_mobile"
  arguments += " -t ~@local_only" unless $options.local
  arguments += " -t ~@no_mobile" if browser['mobile']
  arguments += " -t ~@no_circle" if $options.is_circle
  arguments += " -t ~@no_circle_ie" if $options.is_circle && browser['browserName'] == 'Internet Explorer'
  arguments += " -t ~@no_ie" if browser['browserName'] == 'Internet Explorer'
  arguments += " -t ~@chrome" if browser['browserName'] != 'chrome' && !$options.local
  arguments += " -t ~@no_safari" if browser['browserName'] == 'Safari'
  arguments += " -t ~@no_firefox" if browser['browserName'] == 'firefox'
  arguments += " -t ~@skip"
  arguments += " -t ~@webpurify" unless CDO.webpurify_key
  arguments += " -t ~@pegasus_db_access" unless $options.pegasus_db_access
  arguments += " -t ~@dashboard_db_access" unless $options.dashboard_db_access
  arguments += " -S" # strict mode, so that we fail on undefined steps
  arguments += " --format html --out #{html_output_filename} -f pretty" if $options.html # include the default (-f pretty) formatter so it does both

  # return all text after "Failing Scenarios"
  def output_synopsis(output_text, log_prefix)
    # example output:
    # ["    And I press \"resetButton\"                                                                                                                                    # step_definitions/steps.rb:63\n",
    #  "    Then element \"#runButton\" is visible                                                                                                                         # step_definitions/steps.rb:124\n",
    #  "    And element \"#resetButton\" is hidden                                                                                                                         # step_definitions/steps.rb:130\n",
    #  "\n",
    #  "Failing Scenarios:\n",
    #  "cucumber features/artist.feature:11 # Scenario: Loading the first level\n",
    #  "\n",
    #  "3 scenarios (1 failed, 2 skipped)\n",
    #  "41 steps (1 failed, 38 skipped, 2 passed)\n",
    #  "0m1.548s\n"]

    lines = output_text.lines

    failing_scenarios = lines.rindex("Failing Scenarios:\n")
    if failing_scenarios
      return lines[failing_scenarios..-1].map {|line| "#{log_prefix}#{line}"}.join
    else
      return lines.last(3).map {|line| "#{log_prefix}#{line}"}.join
    end
  end

  def how_many_reruns?(test_run_string)
    if $options.retry_count
      puts "Retrying #{$options.retry_count} times"
      return $options.retry_count
    elsif $options.auto_retry
      return 1
    elsif $options.magic_retry
      flakiness = flakiness_for_test(test_run_string)
      if !flakiness
        $lock.synchronize {puts "No flakiness data for #{test_run_string}".green}
        return 1
      elsif flakiness == 0.0
        $lock.synchronize {puts "#{test_run_string} is not flaky".green}
        return 1
      else
        flakiness_message = "#{test_run_string} is #{flakiness} flaky. "
        recommended_reruns = (1 / Math.log(flakiness, 0.05)).ceil - 1 # reruns = runs - 1
        max_reruns = [1, [recommended_reruns, 5].min].max # Clamp rerun count to range 1-5

        confidence = (1.0 - flakiness**(max_reruns + 1)).round(3)
        flakiness_message += "we should rerun #{max_reruns} times for #{confidence} confidence"

        if max_reruns < 2
          $lock.synchronize {puts flakiness_message.green}
        elsif max_reruns < 3
          $lock.synchronize {puts flakiness_message.yellow}
        else
          $lock.synchronize {puts flakiness_message.red}
        end
        return max_reruns
      end
    else # no retry options
      return 0
    end
  end

  max_reruns = how_many_reruns?(test_run_string)

  # if autorertrying, output a rerun file so on retry we only run failed tests
  rerun_filename = test_run_string + ".rerun"
  if max_reruns > 0
    arguments += " --format rerun --out #{rerun_filename}"
  end

  # In CircleCI we export additional logs in junit xml format so CircleCI can
  # provide pretty test reports with success/fail/timing data upon completion.
  # See: https://circleci.com/docs/test-metadata/#cucumber
  if ENV['CI']
    arguments += " --format junit --out $CIRCLE_TEST_REPORTS/cucumber/#{test_run_string}.xml"
  end

  FileUtils.rm rerun_filename, force: true

  reruns = 0
  succeeded, output_stdout, output_stderr, test_duration = run_tests(run_environment, feature, arguments, log_prefix)
  log_link = upload_log_and_get_public_link(
    html_output_filename,
    {
      commit: COMMIT_HASH,
      success: succeeded.to_s,
      attempt: reruns.to_s,
      duration: test_duration.to_s
    }
  )

  while !succeeded && (reruns < max_reruns)
    reruns += 1

    ChatClient.log "#{test_run_string} first selenium error: #{first_selenium_error(html_output_filename)}" if $options.html
    ChatClient.log output_synopsis(output_stdout, log_prefix), {wrap_with_tag: 'pre'} if $options.output_synopsis
    # Since output_stderr is empty, we do not log it to ChatClient.
    ChatClient.log "<b>dashboard</b> UI tests failed with <b>#{test_run_string}</b> (#{RakeUtils.format_duration(test_duration)})#{log_link}, retrying (#{reruns}/#{max_reruns}, flakiness: #{TestFlakiness.test_flakiness[test_run_string] || '?'})..."

    rerun_arguments = File.exist?(rerun_filename) ? " @#{rerun_filename}" : ''

    succeeded, output_stdout, output_stderr, test_duration = run_tests(run_environment, feature, arguments + rerun_arguments, log_prefix)
    log_link = upload_log_and_get_public_link(
      html_output_filename,
      {
        commit: COMMIT_HASH,
        duration: test_duration.to_s,
        attempt: reruns.to_s,
        success: succeeded.to_s
      }
    )
  end

  $lock.synchronize do
    if succeeded
      log_success prefix_string(Time.now, log_prefix)
      log_success prefix_string(browser.to_yaml, log_prefix)
      log_success prefix_string(output_stdout, log_prefix)
      log_success prefix_string(output_stderr, log_prefix)
    else
      log_error prefix_string(Time.now, log_prefix)
      log_error prefix_string(browser.to_yaml, log_prefix)
      log_error prefix_string(output_stdout, log_prefix)
      log_error prefix_string(output_stderr, log_prefix)
      log_browser_error prefix_string(browser.to_yaml, log_prefix)
    end
  end

  parsed_output = output_stdout.match(/^(?<scenarios>\d+) scenarios?( \((?<info>.*?)\))?/)
  scenario_count = nil
  unless parsed_output.nil?
    scenario_count = parsed_output[:scenarios].to_i
    scenario_info = parsed_output[:info]
    scenario_info = ", #{scenario_info}" unless scenario_info.blank?
  end

  rerun_info = " with #{reruns} reruns" if reruns > 0

  if !parsed_output.nil? && scenario_count == 0 && succeeded
    # Don't log individual skips because we hit ChatClient rate limits
    # ChatClient.log "<b>dashboard</b> UI tests skipped with <b>#{test_run_string}</b> (#{RakeUtils.format_duration(test_duration)}#{scenario_info})"
  elsif succeeded
    # Don't log individual successes because we hit ChatClient rate limits
    # ChatClient.log "<b>dashboard</b> UI tests passed with <b>#{test_run_string}</b> (#{RakeUtils.format_duration(test_duration)}#{scenario_info})"
  else
    ChatClient.log "#{test_run_string} first selenium error: #{first_selenium_error(html_output_filename)}" if $options.html
    ChatClient.log output_synopsis(output_stdout, log_prefix), {wrap_with_tag: 'pre'} if $options.output_synopsis
    ChatClient.log prefix_string(output_stderr, log_prefix), {wrap_with_tag: 'pre'}
    message = "#{log_prefix}<b>dashboard</b> UI tests failed with <b>#{test_run_string}</b> (#{RakeUtils.format_duration(test_duration)}#{scenario_info}#{rerun_info})#{log_link}"
    short_message = message

    message += "<br/>rerun:<br/>bundle exec ./runner.rb --html#{' --eyes' if $options.run_eyes_tests} -c #{browser_name} -f #{feature}"
    ChatClient.log message, color: 'red'
    if rack_env?(:test)
      ChatClient.message 'server operations', short_message, color: 'red'
    end
  end
  result_string =
    if scenario_count == 0
      'skipped'.blue
    elsif succeeded
      'succeeded'.green
    else
      'failed'.red
    end
  puts prefix_string("UI tests for #{test_run_string} #{result_string} (#{RakeUtils.format_duration(test_duration)}#{scenario_info}#{rerun_info})", log_prefix)

  if scenario_count == 0 && !ENV['CI']
    skip_warning = "We didn't actually run any tests, did you mean to do this?\n".yellow
    skip_warning += <<EOS
Check the ~excluded @tags in the cucumber command line above and in the #{feature} file:
  - Do the feature or scenario tags exclude #{browser_name}?
EOS
    unless $options.run_eyes_tests
      skip_warning += "  - Are you trying to run --eyes tests?\n"
    end
    unless $options.dashboard_db_access
      skip_warning += "  - Do you need to run this test on the test instance or against localhost (-l) for @dashboard_db_access?\n"
    end
    print skip_warning
  end

  [succeeded, message, reruns]
end

$logfile.close
$errfile.close
$errbrowserfile.close

# Produce a final report if we aborted due to excess failures
if failed_features > $options.abort_when_failures_exceed
  abandoned_message = "Test run abandoned; limit of #{$options.abort_when_failures_exceed} failed features was exceeded."
  ChatClient.log abandoned_message, color: 'red'
end

# If we aborted for some reason we may have no run results, and should
# exit with a failure code.
exit 1 if run_results.nil?

run_results.each do |succeeded, message, reruns|
  $total_flaky_reruns += reruns
  if succeeded
    $total_flaky_successful_reruns += reruns
    $suite_success_count += 1
  else
    $suite_fail_count += 1
    $failures << message
  end
end

$suite_duration = Time.now - $suite_start_time

ChatClient.log "#{$suite_success_count} succeeded.  #{$suite_fail_count} failed. " \
  "Test count: #{($suite_success_count + $suite_fail_count)}. " \
  "Total duration: #{RakeUtils.format_duration($suite_duration)}. " \
  "Total reruns of flaky tests: #{$total_flaky_reruns}. " \
  "Total successful reruns of flaky tests: #{$total_flaky_successful_reruns}." \
  + (status_page_url ? " <a href=\"#{status_page_url}\">#{test_type} test status page</a>." : '') \
  + (applitools_batch_url ? " <a href=\"#{applitools_batch_url}\">Applitools results</a>." : '')

if $suite_fail_count > 0
  ChatClient.log "Failed tests: \n #{$failures.join("\n")}"
end

exit $suite_fail_count
