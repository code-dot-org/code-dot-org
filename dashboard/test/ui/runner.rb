#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
require_relative '../../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/test_flakiness'

require 'json'
require 'yaml'
require 'optparse'
require 'ostruct'
require 'colorize'
require 'open3'

ENV['BUILD'] = `git rev-parse --short HEAD`

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
$options.maximize = nil
$options.auto_retry = false
$options.magic_retry = false
$options.parallel_limit = 1

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
    print "WARNING: Some tests may fail using '-p localhost:3000' because cookies will not be available.\n"\
          "Try '-p localhost.code.org:3000' instead (this is the default when using '-l').\n" if p == 'localhost:3000'
    $options.pegasus_domain = p
  end
  opts.on("-d", "--dashboard Domain", String, "Specify an override domain for studio.code.org, e.g. localhost.studio.code.org:3000") do |d|
    print "WARNING: Some tests may fail using '-d localhost:3000' because cookies will not be available.\n"\
          "Try '-d localhost.studio.code.org:3000' instead (this is the default when using '-l').\n" if d == 'localhost:3000'
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
  opts.on("--html", "Use html reporter") do
    $options.html = true
  end
  opts.on("-e", "--eyes", "Run only Applitools eyes tests") do
    $options.run_eyes_tests = true
  end
  opts.on("-a", "--auto_retry", "Retry tests that fail once") do
    $options.auto_retry = true
  end
  opts.on("--magic_retry", "Magically retry tests based on how flaky they are") do
    $options.magic_retry = true
  end
  opts.on("-n", "--parallel ParallelLimit", String, "Maximum number of browsers to run in parallel (default is 1)") do |p|
    $options.parallel_limit = p.to_i
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
  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
end

opt_parser.parse!(ARGV)

$browsers = JSON.load(open("browsers.json"))

$lock = Mutex.new
$suite_start_time = Time.now
$suite_success_count = 0
$suite_fail_count = 0
$failures = []

if $options.local
  #Verify that chromedriver is actually running
  unless `ps`.include?('chromedriver')
    puts "You cannot run with the --local flag unless you are running chromedriver. Automatically running
chromedriver found at #{`which chromedriver`}"
    system("chromedriver &")
  end
  $browsers = [{:browser => "local"}]
end

if $options.config
  $browsers = $options.config.map do |name|
    $browsers.detect {|b| b['name'] == name }.tap do |browser|
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

def run_tests(arguments)
  start_time = Time.now
  puts "cucumber #{arguments}"
  Open3.popen3("cucumber #{arguments}") do |stdin, stdout, stderr, wait_thr|
    stdin.close
    stdout = stdout.read
    stderr = stderr.read
    succeeded = wait_thr.value.exitstatus == 0
    return succeeded, stdout, stderr, Time.now - start_time
  end
end

def format_duration(total_seconds)
  total_seconds = total_seconds.to_i
  minutes = (total_seconds / 60).to_i
  seconds = total_seconds - (minutes * 60)
  "%.1d:%.2d minutes" % [minutes, seconds]
end

# Kind of hacky way to determine if we have access to the database
# (for example, to create users) on the domain/environment that we are
# testing.
require File.expand_path('../../../config/environment.rb', __FILE__)

if Rails.env.development?
  $options.pegasus_db_access = true if $options.pegasus_domain =~ /(localhost|ngrok)/
  $options.dashboard_db_access = true if $options.dashboard_domain =~ /(localhost|ngrok)/
elsif Rails.env.test?
  $options.pegasus_db_access = true if $options.pegasus_domain =~ /test/
  $options.dashboard_db_access = true if $options.dashboard_domain =~ /test/
end

features = $options.feature || Dir.glob('features/**/*.feature')
browser_features = $browsers.product features

git_branch = `git rev-parse --abbrev-ref HEAD`.strip
ENV['BATCH_NAME'] =  "#{git_branch} | #{Time.now}"

test_type = $options.run_eyes_tests ? 'eyes tests' : 'UI tests'
HipChat.log "Starting #{browser_features.count} <b>dashboard</b> #{test_type} in #{$options.parallel_limit} threads</b>..."
if test_type == 'eyes tests'
  HipChat.log "Batching eyes tests as #{ENV['BATCH_NAME']}"
  print "Batching eyes tests as #{ENV['BATCH_NAME']}"
end

Parallel.map(lambda { browser_features.pop || Parallel::Stop }, :in_processes => $options.parallel_limit) do |browser, feature|
  feature_name = feature.gsub('features/', '').gsub('.feature', '').gsub('/', '_')
  browser_name = browser['name'] || 'UnknownBrowser'
  test_run_string = "#{browser_name}_#{feature_name}" + ($options.run_eyes_tests ? '_eyes' : '')

  if $options.pegasus_domain =~ /test/ && !Rails.env.development? && RakeUtils.git_updates_available?
    message = "Killing <b>dashboard</b> UI tests (changes detected)"
    HipChat.log message, color: 'yellow'
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

  # Don't log individual tests because we hit HipChat rate limits
  # HipChat.log "Testing <b>dashboard</b> UI with <b>#{test_run_string}</b>..."
  print "Starting UI tests for #{test_run_string}\n"

  ENV['BROWSER_CONFIG'] = browser_name

  ENV['BS_ROTATABLE'] = browser['rotatable'] ? "true" : "false"
  ENV['PEGASUS_TEST_DOMAIN'] = $options.pegasus_domain if $options.pegasus_domain
  ENV['DASHBOARD_TEST_DOMAIN'] = $options.dashboard_domain if $options.dashboard_domain
  ENV['HOUROFCODE_TEST_DOMAIN'] = $options.hourofcode_domain if $options.hourofcode_domain
  ENV['TEST_LOCAL'] = $options.local ? "true" : "false"
  ENV['MAXIMIZE_LOCAL'] = $options.maximize ? "true" : "false"
  ENV['MOBILE'] = browser['mobile'] ? "true" : "false"
  ENV['FAIL_FAST'] = $options.fail_fast ? "true" : "false"
  ENV['TEST_RUN_NAME'] = test_run_string

  # Force Applitools eyes to use a consistent host OS identifier for now
  # BrowserStack was reporting Windows 6.0 and 6.1, causing different baselines
  ENV['APPLITOOLS_HOST_OS'] = 'Windows 6x' unless browser['mobile']

  if $options.html
    html_output_filename = test_run_string + "_output.html"
  end

  arguments = ''
#  arguments += "#{$options.feature}" if $options.feature
  arguments += feature
  arguments += " -t #{$options.run_eyes_tests && !browser['mobile'] ? '' : '~'}@eyes"
  arguments += " -t #{$options.run_eyes_tests && browser['mobile'] ? '' : '~'}@eyes_mobile"
  arguments += " -t ~@local_only" unless $options.local
  arguments += " -t ~@no_mobile" if browser['mobile']
  arguments += " -t ~@no_ie" if browser['browserName'] == 'Internet Explorer'
  arguments += " -t ~@no_ie9" if browser['browserName'] == 'Internet Explorer' && browser['version'] == '9.0'
  arguments += " -t ~@no_ie10" if browser['browserName'] == 'Internet Explorer' && browser['version'] == '10.0'
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
  def output_synopsis(output_text)
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
      lines[failing_scenarios..-1].join
    else
      lines.last(3).join
    end
  end

  def how_many_reruns?(test_run_string)
    if $options.auto_retry
      return 1
    elsif $options.magic_retry
      # ask saucelabs how flaky the test is
      flakiness = TestFlakiness.test_flakiness[test_run_string]
      if !flakiness
        $lock.synchronize { puts "No flakiness data for #{test_run_string}".green }
        return 0
      elsif flakiness == 0.0
        $lock.synchronize { puts "#{test_run_string} is not flaky".green }
        return 0
      else
        flakiness_message = "#{test_run_string} is #{flakiness} flaky. "
        max_reruns = [(1 / Math.log(flakiness, 0.05)).ceil - 1, # reruns = runs - 1
                      1].max # rerun at least once even if not flaky

        confidence = (1.0 - flakiness ** (max_reruns + 1)).round(3)
        flakiness_message +=  "we should rerun #{max_reruns} times for #{confidence} confidence"

        if max_reruns < 2
          $lock.synchronize { puts flakiness_message.green }
        elsif max_reruns < 3
          $lock.synchronize { puts flakiness_message.yellow }
        else
          $lock.synchronize { puts flakiness_message.red }
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

  FileUtils.rm rerun_filename, force: true

  succeeded, output_stdout, output_stderr, test_duration = run_tests(arguments)

  reruns = 0
  while !succeeded && (reruns < max_reruns)
    reruns += 1
    HipChat.log "<pre>#{output_synopsis(output_stdout)}</pre>"
    # Since output_stderr is empty, we do not log it to HipChat.
    HipChat.log "<b>dashboard</b> UI tests failed with <b>#{test_run_string}</b> (#{format_duration(test_duration)}), retrying (#{reruns}/#{max_reruns}, flakiness: #{TestFlakiness.test_flakiness[test_run_string] || "?"})..."

    rerun_arguments = File.exist?(rerun_filename) ? " @#{rerun_filename}" : ''

    succeeded, output_stdout, output_stderr, test_duration = run_tests(arguments + rerun_arguments)
  end

  $lock.synchronize do
    if succeeded
      log_success Time.now
      log_success browser.to_yaml
      log_success output_stdout
      log_success output_stderr
    else
      log_error Time.now
      log_error browser.to_yaml
      log_error output_stdout
      log_error output_stderr
      log_browser_error browser.to_yaml
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
    # Don't log individual skips because we hit HipChat rate limits
    # HipChat.log "<b>dashboard</b> UI tests skipped with <b>#{test_run_string}</b> (#{format_duration(test_duration)}#{scenario_info})"
  elsif succeeded
    # Don't log individual successes because we hit HipChat rate limits
    # HipChat.log "<b>dashboard</b> UI tests passed with <b>#{test_run_string}</b> (#{format_duration(test_duration)}#{scenario_info})"
  else
    HipChat.log "<pre>#{output_synopsis(output_stdout)}</pre>"
    HipChat.log "<pre>#{output_stderr}</pre>"
    message = "<b>dashboard</b> UI tests failed with <b>#{test_run_string}</b> (#{format_duration(test_duration)}#{scenario_info}#{rerun_info})"

    if $options.html
      link = "https://#{CDO.dashboard_hostname}/ui_test/" + html_output_filename
      message += " <a href='#{link}'>☁ html output</a>"
    end
    short_message = message

    message += "<br/><i>rerun: bundle exec ./runner.rb -c #{browser_name} -f #{feature} #{'--eyes' if $options.run_eyes_tests} --html</i>"
    HipChat.log message, color: 'red'
    HipChat.developers short_message, color: 'red' if Rails.env.test?
  end
  result_string =
    if scenario_count == 0
      'skipped'.blue
    elsif succeeded
      'succeeded'.green
    else
      'failed'.red
    end
  print "UI tests for #{test_run_string} #{result_string} (#{format_duration(test_duration)}#{scenario_info}#{rerun_info})\n"

  if scenario_count == 0
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

  [succeeded, message]
end.each do |succeeded, message|
  if succeeded
    $suite_success_count += 1
  else
    $suite_fail_count += 1
    $failures << message
  end
end

$logfile.close
$errfile.close
$errbrowserfile.close

$suite_duration = Time.now - $suite_start_time

HipChat.log "#{$suite_success_count} succeeded.  #{$suite_fail_count} failed. " +
  "Test count: #{($suite_success_count + $suite_fail_count)}. " +
  "Total duration: #{format_duration($suite_duration)}. "

if $suite_fail_count > 0
  HipChat.log "Failed tests: \n #{$failures.join("\n")}"
end

exit $suite_fail_count
