#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

require 'json'
require 'yaml'
require 'optparse'
require 'ostruct'
require 'colorize'
require 'open3'

$options = OpenStruct.new
$options.config = nil
$options.browser = nil
$options.os_version = nil
$options.browser_version = nil
$options.feature = nil
$options.pegasus_domain = 'test.code.org'
$options.dashboard_domain = 'test.learn.code.org'
$options.tunnel = nil
$options.local = nil
$options.html = nil
$options.maximize = nil
$options.auto_retry = false
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
  opts.on("-f", "--feature Feature", String, "Single feature to run") do |f|
    $options.feature = f
  end
  opts.on("-p", "--pegasus Domain", String, "Specify an override domain for code.org, e.g. localhost:9393") do |d|
    $options.pegasus_domain = d
  end
  opts.on("-d", "--dashboard Domain", String, "Specify an override domain for learn.code.org, e.g. localhost:3000") do |d|
    $options.dashboard_domain = d
  end
  opts.on("-r", "--real_mobile_browser", "Use real mobile browser, not emulator") do
    $options.realmobile = 'true'
  end
  opts.on("-t", "--tunnel", "Tunnel to local machine") do
    $options.tunnel = 'true'
  end
  opts.on("-l", "--local", "Use local webdriver, not BrowserStack") do
    $options.local = 'true'
  end
  opts.on("-m", "--maximize", "Maximize local webdriver window on startup") do
    $options.maximize = true
  end
  opts.on("--html", "Use html reporter") do
    $options.html = true
  end
  opts.on("-a", "--auto_retry", "Retry tests that fail once") do
    $options.auto_retry = true
  end
  opts.on("-p", "--parallel ParallelLimit", String, "Maximum number of browsers to run in parallel (default is 1)") do |p|
    $options.parallel_limit = p.to_i
  end
  opts.on("-V", "--verbose", "Verbose") do
    $options.verbose = true
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

if $options.local
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
  Open3.popen2("cucumber #{arguments}") do |stdin, stdout, wait_thr|
    stdin.close
    return_value = stdout.read
    succeeded = wait_thr.value.exitstatus == 0
    return succeeded, return_value
  end
end

# Kind of hacky way to determine if we have access to the database
# (for example, to create users) on the domain/environment that we are
# testing.
require File.expand_path('../../../config/environment.rb', __FILE__)

if Rails.env.development?
  $options.pegasus_db_access = true if $options.pegasus_domain =~ /localhost/
  $options.dashboard_db_access = true if $options.dashboard_domain =~ /localhost/
elsif Rails.env.test?
  $options.pegasus_db_access = true if $options.pegasus_domain =~ /test/
  $options.dashboard_db_access = true if $options.dashboard_domain =~ /test/
end

Parallel.map($browsers, :in_processes => $options.parallel_limit) do |browser|
  browser_name = browser['name'] || 'UnknownBrowser'
  test_start_time = Time.now

  if $options.pegasus_domain =~ /test/ && !Rails.env.development? && RakeUtils.git_updates_available?
    message = "Skipped <b>dashboard</b> UI tests for <b>#{browser_name}</b> (changes detected)"
    HipChat.log message, color:'yellow'
    HipChat.developers message, color:'yellow' if CDO.hip_chat_logging
    next
  end

  if $options.browser and browser['browser'] and $options.browser.casecmp(browser['browser']) != 0
    next
  end
  if $options.os_version and browser['os_version'] and $options.os_version.casecmp(browser['os_version']) != 0
    next
  end
  if $options.browser_version and browser['browser_version'] and $options.browser_version.casecmp(browser['browser_version']) != 0
    next
  end

  HipChat.log "Testing <b>dashboard</b> UI with <b>#{browser_name}</b>..."
  print "Starting UI tests for #{browser_name}\n"

  ENV['SELENIUM_BROWSER'] = browser['browser']
  ENV['SELENIUM_VERSION'] = browser['browser_version']
  ENV['BS_AUTOMATE_OS'] = browser['os']
  ENV['BS_AUTOMATE_OS_VERSION'] = browser['os_version']
  ENV['BS_ORIENTATION'] = browser['deviceOrientation']
  ENV['BS_ROTATABLE'] = browser['rotatable'] ? "true" : "false"
  ENV['PEGASUS_TEST_DOMAIN'] = $options.pegasus_domain if $options.pegasus_domain
  ENV['DASHBOARD_TEST_DOMAIN'] = $options.dashboard_domain if $options.dashboard_domain
  ENV['TEST_TUNNEL'] = $options.tunnel ? "true" : "false"
  ENV['TEST_LOCAL'] = $options.local ? "true" : "false"
  ENV['MAXIMIZE_LOCAL'] = $options.maximize ? "true" : "false"
  ENV['MOBILE'] = browser['mobile'] ? "true" : "false"
  ENV['TEST_REALMOBILE'] = ($options.realmobile && browser['mobile'] && browser['realMobile'] != false) ? "true" : "false"

  arguments = ''
  arguments += "#{$options.feature}" if $options.feature
  arguments += " -t ~@local_only" unless $options.local
  arguments += " -t ~@no_mobile" if browser['mobile']
  arguments += " -t ~@no_ie" if browser['browser'] == 'Internet Explorer'
  arguments += " -t ~@chrome" if browser['browser'] != 'chrome'
  arguments += " -t ~@skip"
  arguments += " -t ~@webpurify" unless CDO.webpurify_key
  arguments += " -t ~@pegasus_db_access" unless $options.pegasus_db_access
  arguments += " -t ~@dashboard_db_access" unless $options.dashboard_db_access
  arguments += " -S" # strict mode, so that we fail on undefined steps
  arguments += " -f html -o #{browser['name']}_output.html" if $options.html

  succeeded, return_value = run_tests(arguments)

  result_string = succeeded ? "succeeded".green : "failed".red
  HipChat.log "UI tests for #{browser_name} #{result_string}\n"

  if !succeeded && $options.auto_retry
    HipChat.log return_value.lines.last(10).join("\n") if !succeeded
    HipChat.log "Retrying <b>dashboard</b> UI with <b>#{browser_name}</b>..."
    succeeded, return_value = run_tests(arguments)

    result_string = succeeded ? "succeeded".green : "failed".red
    HipChat.log "UI tests for #{browser_name} #{result_string}\n"

    HipChat.log return_value.lines.last(10).join("\n") if !succeeded
  end

  $lock.synchronize do
    if succeeded
      log_success Time.now
      log_success browser.to_yaml
      log_success return_value
    else
      log_error Time.now
      log_error browser.to_yaml
      log_error return_value
      log_browser_error browser.to_yaml
    end
  end

  test_duration = Time.now - test_start_time
  minutes = (test_duration / 60).to_i
  seconds = test_duration - (minutes * 60)
  elapsed = "%.1d:%.2d minutes" % [minutes, seconds]
  if succeeded
    HipChat.log "<b>dashboard</b> UI tests passed with <b>#{browser_name}</b> (#{elapsed})"
  else
    message = "<b>dashboard</b> UI tests failed with <b>#{browser_name}</b> (#{elapsed})"
    HipChat.log message, color:'red'
    HipChat.developers message, color:'red' if CDO.hip_chat_logging
  end
  result_string = succeeded ? "succeeded".green : "failed".red
  print "UI tests for #{browser_name} #{result_string} (#{elapsed})\n"

  succeeded
end.each { |result| result ? $suite_success_count += 1 : $suite_fail_count += 1 }

$logfile.close
$errfile.close
$errbrowserfile.close

$suite_duration = Time.now - $suite_start_time
$average_test_duration = $suite_duration / ($suite_success_count + $suite_fail_count)

puts "#{$suite_success_count.to_s} succeeded.  #{$suite_fail_count.to_s} failed.  " +
  "Test count: #{($suite_success_count + $suite_fail_count).to_s}.  " +
  "Total duration: #{$suite_duration.round(2).to_s} seconds.  " +
  "Average test duration: #{$average_test_duration.round(2).to_s} seconds."

exit $suite_fail_count
