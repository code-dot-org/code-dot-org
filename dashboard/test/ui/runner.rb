#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

require 'json'
require 'yaml'
require 'optparse'
require 'ostruct'
require 'colorize'

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

# start supporting some basic command line filtering of which browsers we run against
opt_parser = OptionParser.new do |opts|
  opts.banner = "Usage: runner.rb [options] \
    Example: runner.rb -b chrome -o 7 -v 31 -f features/sharepage.feature \
    Example: runner.rb -d localhost:3000 -t \
    Example: runner.rb -l \
    Example: runner.rb -r"
  opts.separator ""
  opts.separator "Specific options:"
  opts.on("-c", "--config BrowserConfigName", String, "Specify the name of one of the configs from ") do |c|
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
  opts.on("-V", "--verbose", "Verbose") do
    $options.verbose = true
  end
  opts.on_tail("-h", "--help", "Show this message") do
    puts opts
    exit
  end
end

opt_parser.parse!(ARGV)

browsers = JSON.load(open("browsers.json"))

suiteStartTime = Time.now
suiteSuccessCount = 0
suiteFailCount = 0

if $options.local
  browsers = [{:browser => "local"}]
end

if $options.config
  namedBrowser = browsers.detect {|b| b['name'] == $options.config }
  if !namedBrowser
    puts "No config exists with name #{$options.config}"
    exit
  end
  browsers = [namedBrowser]
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

browsers.each do |browser|
  if $options.pegasus_domain =~ /test/ && !Rails.env.development? && RakeUtils.git_updates_available?
    message = "Skipped <b>dashboard</b> UI tests for <b>#{browser['name'] || browser.inspect}</b> (changes detected)"
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
  testStartTime = Time.now
  HipChat.log "Testing <b>dashboard</b> UI with <b>#{browser['name'] || browser.inspect}</b>..."
  puts "Running with: #{browser["description"] ? browser["description"] : browser.inspect}"

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
  arguments = '';

  arguments += "#{$options.feature}" if $options.feature
  arguments += " -t ~@no_mobile" if browser['mobile']
  arguments += " -t ~@no_ie" if browser['browser'] == 'Internet Explorer'
  arguments += " -t ~@chrome" if browser['browser'] != 'chrome'
  arguments += " -t ~@skip"
  arguments += " -t ~@pegasus_db_access" unless $options.pegasus_db_access
  arguments += " -t ~@dashboard_db_access" unless $options.dashboard_db_access
  arguments += " -S" # strict mode, so that we fail on undefined steps
  arguments += " -f html -o #{browser['name']}_output.html" if $options.html

  puts "  Running: cucumber #{arguments}"

  returnValue = `cucumber #{arguments}`
  succeeded = $?.exitstatus == 0

  if not succeeded
    log_error Time.now
    log_error browser.to_yaml
    log_error returnValue
    log_browser_error browser.to_yaml
  else
    log_success Time.now
    log_success browser.to_yaml
    log_success returnValue
  end

  suiteSuccessCount += 1 unless not succeeded
  suiteFailCount += 1 if not succeeded
  suiteResultString = succeeded ? "succeeded".green : "failed".red
  testDuration = Time.now - testStartTime

  minutes = (testDuration / 60).to_i
  seconds = testDuration - (minutes * 60)
  elapsed = "%.1d:%.2d minutes" % [minutes, seconds]
  if succeeded
    HipChat.log "<b>dashboard</b> UI tests passed with <b>#{browser['name'] || browser.inspect}</b> (#{elapsed})"
  else
    message = "<b>dashboard</b> UI tests failed with <b>#{browser['name'] || browser.inspect}</b> (#{elapsed})"
    HipChat.log message, color:'red'
    HipChat.developers message, color:'red' if CDO.hip_chat_logging
  end
  puts "  Result: " + suiteResultString + ".  Duration: " + testDuration.round(2).to_s + " seconds"
end

$logfile.close
$errfile.close
$errbrowserfile.close

suiteDuration = Time.now - suiteStartTime
averageTestDuration = suiteDuration / (suiteSuccessCount + suiteFailCount)

puts suiteSuccessCount.to_s + " succeeded.  " + suiteFailCount.to_s +
  " failed.  Test count: " + (suiteSuccessCount + suiteFailCount).to_s +
  ".  Total duration: " + suiteDuration.round(2).to_s +
  " seconds.  Average test duration: " + averageTestDuration.round(2).to_s + " seconds."

exit suiteFailCount
