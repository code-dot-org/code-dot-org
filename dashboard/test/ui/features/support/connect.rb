require 'selenium/webdriver'
require 'cgi'
require 'httparty'
require_relative '../../../../../deployment'
require_relative '../../../../../lib/cdo/aws/device_farm'
require 'active_support/core_ext/object/blank'
require_relative '../../utils/selenium_browser'
require 'retryable'

UI_TEST_DIR = File.expand_path('../..', __dir__)

# Load the browser config for the active provider from its JSON file. Only
# one of the two globals is populated per run; the other stays empty.
$saucelabs_browser_config = {}
$device_farm_browser_config = {}
if ENV['TEST_DEVICE_FARM'] == 'true'
  browsers = JSON.parse(File.read(File.join(UI_TEST_DIR, 'browsers_device_farm.json')))
  $device_farm_browser_config = browsers.detect {|b| b['name'] == ENV['BROWSER_CONFIG']} || {}
else
  browsers = JSON.parse(File.read(File.join(UI_TEST_DIR, 'browsers_saucelabs.json')))
  $saucelabs_browser_config = browsers.detect {|b| b['name'] == ENV['BROWSER_CONFIG']} || {}
end

MAX_CONNECT_RETRIES = 3
SAUCELABS_SELENIUM_URL = ENV.fetch('SAUCELABS_SELENIUM_URL', 'https://ondemand.us-west-1.saucelabs.com/wd/hub').freeze

# Run all feature scenarios in a single session.
# TODO: the SauceLabs branch misses Sauce's mobile configs, which use
# `appium:mobile` rather than the bare `mobile` key. Sauce iPhone/iPad runs
# that don't carry the @single_session tag fall through to per-scenario
# sessions. Mirror runner.rb's `mobile_browser?` (which checks both keys)
# as a follow-up.
def single_session?
  is_mobile =
    if test_device_farm?
      $device_farm_browser_config['mobile']
    else
      $saucelabs_browser_config['mobile']
    end
  is_mobile || $single_session
end

# Should we run the tests using the local Selenium webdriver rather than a
# remote provider (SauceLabs or Device Farm)?
#
# Used not only to modify the behavior of `get_browser` but also to avoid
# unnecessarily applying various Saucelabs-specific accommodations throughout
# the codebase. We expect TEST_LOCAL to be set by `runner.rb`.
def test_local?
  return ENV['TEST_LOCAL'] == 'true'
end

# Should we run the tests using AWS Device Farm instead of SauceLabs?
# We expect TEST_DEVICE_FARM to be set by `runner.rb`.
def test_device_farm?
  return ENV['TEST_DEVICE_FARM'] == 'true'
end

def saucelabs_browser(test_run_name, http_client: nil)
  raise 'Please define CDO.saucelabs_username' if CDO.saucelabs_username.blank?
  raise 'Please define CDO.saucelabs_authkey'  if CDO.saucelabs_authkey.blank?

  capabilities = Selenium::WebDriver::Remote::Capabilities.new($saucelabs_browser_config.except('name'))

  sauce_options = {
    name: test_run_name,
    tags: [ENV.fetch('GIT_BRANCH', nil)],
    build: ENV.fetch('CI_BUILD_NUMBER', nil) || ENV.fetch('GIT_COMMIT', nil),
    idleTimeout: 90,
    seleniumVersion: Selenium::WebDriver::VERSION,
    username: CDO.saucelabs_username,
    access_key: CDO.saucelabs_authkey,
    tunnelIdentifier: CDO.saucelabs_tunnel_name,
  }

  sauce_options[:priority] = ENV['SAUCELABS_PRIORITY'].to_i if ENV['SAUCELABS_PRIORITY']
  capabilities['sauce:options'] ||= {}
  capabilities['sauce:options'].merge!(sauce_options)

  browser = SeleniumBrowser.remote(
    SAUCELABS_SELENIUM_URL,
    capabilities: capabilities,
    http_client: http_client
  )
  return browser
end

def device_farm_desktop_browser(http_client: nil)
  # One-shot TestGrid URL, ready immediately.
  url = Cdo::AWS::DeviceFarm.create_test_grid_url

  capabilities = Selenium::WebDriver::Remote::Capabilities.new(
    $device_farm_browser_config.except(*Cdo::AWS::DeviceFarm::INTERNAL_KEYS)
  )

  SeleniumBrowser.remote(
    url,
    capabilities: capabilities,
    http_client: http_client
  )
end

# Provisions a real mobile device, then connects Selenium with retries
# (the Appium endpoint may return 400 briefly after status becomes RUNNING).
def device_farm_mobile_browser(http_client: nil)
  session = Cdo::AWS::DeviceFarm.create_mobile_session(
    device_arn: $device_farm_browser_config['device_arn']
  )
  $device_farm_mobile_session_arn = session[:session_arn]

  capabilities = Selenium::WebDriver::Remote::Capabilities.new(
    $device_farm_browser_config.except(*Cdo::AWS::DeviceFarm::INTERNAL_KEYS)
  )

  Retryable.retryable(
    tries: Cdo::AWS::DeviceFarm::MOBILE_CONNECT_TRIES,
    sleep: Cdo::AWS::DeviceFarm::MOBILE_CONNECT_RETRY_SLEEP,
  ) do
    SeleniumBrowser.remote(
      session[:url],
      capabilities: capabilities,
      http_client: http_client
    )
  end
end

# Set HTTP read timeout to the specified value during the block.
# Invocable from Cucumber steps.
def with_read_timeout(timeout, &block)
  $selenium_http_client ?
    $selenium_http_client.with_read_timeout(timeout, &block) :
    yield
end

# Set the virtual browser to either portrait or landscape orientation.
# Invocable from Cucumber steps.
def change_orientation(orientation)
  $selenium_http_client.call(
    :post,
    "/wd/hub/session/#{$browser.session_id}/orientation",
    {orientation: orientation.upcase}
  )
end

# Connects via Device Farm and logs the session's AWS console URL.
# Assumes test_device_farm? and $selenium_http_client have been established
# by the caller.
def get_device_farm_browser
  is_mobile = $device_farm_browser_config['mobile']
  browser =
    if is_mobile
      # Provision once, then retry the Selenium connection (Appium server
      # may need a few seconds after the session reaches RUNNING).
      device_farm_mobile_browser(http_client: $selenium_http_client)
    else
      Retryable.retryable(tries: MAX_CONNECT_RETRIES) do
        device_farm_desktop_browser(http_client: $selenium_http_client)
      end
    end
  console_url =
    if is_mobile
      Cdo::AWS::DeviceFarm.mobile_session_url($device_farm_mobile_session_arn)
    else
      Cdo::AWS::DeviceFarm.desktop_session_url(browser.session_id)
    end
  puts "visual log on device farm: <a href='#{console_url}'>#{console_url}</a>" if console_url
  browser
end

def get_browser(test_run_name)
  browser = nil
  $selenium_http_client ||= SeleniumBrowser::Client.new(read_timeout: 2.minutes)
  if test_local?
    headless = ENV['TEST_LOCAL_HEADLESS'] == 'true'
    browser = SeleniumBrowser.local(browser: ENV.fetch('BROWSER_CONFIG', nil), headless: headless)
  elsif test_device_farm?
    browser = get_device_farm_browser
  else
    browser = Retryable.retryable(tries: MAX_CONNECT_RETRIES) do
      saucelabs_browser(test_run_name, http_client: $selenium_http_client)
    end
    $saucelabs_session_id = browser.session_id
    visual_log_url = "https://saucelabs.com/tests/#{$saucelabs_session_id}"
    puts "visual log on sauce labs: <a href='#{visual_log_url}'>#{visual_log_url}</a>"
  end

  # Time to wait for page loads to complete (default 5 minutes).
  browser.manage.timeouts.page_load = 2.minutes

  # Time to wait for any async script to timeout (default 30 seconds).
  # IE11 requires this to be explicitly set.
  browser.manage.timeouts.script_timeout = 30.seconds

  # Maximize the window on desktop, as some tests require 1280px width.
  # TODO: ENV['MOBILE'] is always a non-empty string ("true"/"false"), so this
  # condition is always truthy and maximize never runs for remote browsers.
  # SauceLabs works around this via sauce:options screenResolution. If Device
  # Farm desktop sessions need 1280px, change to: ENV['MOBILE'] == 'true'
  unless ENV['MOBILE']
    max_width, max_height = browser.execute_script('return [window.screen.availWidth, window.screen.availHeight];')
    browser.manage.window.resize_to(max_width, max_height)
  end
  browser
end

$browser = nil
$device_farm_mobile_session_arn = nil

Before('@dashboard_db_access') do
  require_rails_env
end

Before do |scenario|
  @tags = scenario.source_tag_names
  $single_session = true if @tags.include?('@single_session')

  very_verbose "DEBUG: @browser == #{CGI.escapeHTML @browser.inspect}"

  if single_session?
    very_verbose('Single session, using existing browser') if $browser
    $browser ||= get_browser ENV.fetch('TEST_RUN_NAME', nil)
    @browser ||= $browser
  else
    $browser = @browser = get_browser "#{ENV.fetch('TEST_RUN_NAME', nil)}_#{scenario.name}"
  end

  debug_cookies(@browser.manage.all_cookies) if @browser && ENV['VERY_VERBOSE']
end

def log_result(result)
  # Device Farm has no equivalent "stamp this session as passed/failed"
  # API; the session's AWS console URL is printed at session-start for any
  # post-mortem needs.
  return if test_device_farm?
  return unless $saucelabs_session_id

  url = "https://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@saucelabs.com/rest/v1/#{CDO.saucelabs_username}/jobs/#{$saucelabs_session_id}"
  HTTParty.put(
    url,
    body: {"passed" => result}.to_json,
    headers: {'Content-Type' => 'application/json'}
  )
rescue => exception
  puts "Error logging result: #{exception}"
end

# Quit current browser session.
def quit_browser
  with_read_timeout(5.seconds) do
    $browser&.quit
  rescue => exception
    puts "Error quitting browser session: #{exception}"
  end
  # Release the Device Farm device so subsequent sessions don't block
  # on PENDING_CONCURRENCY.
  if $device_farm_mobile_session_arn
    Cdo::AWS::DeviceFarm.stop_mobile_session($device_farm_mobile_session_arn)
    $device_farm_mobile_session_arn = nil
  end
  $browser = @browser = nil
end

$all_passed = true

After do |scenario|
  if single_session?
    $all_passed &&= scenario.passed?
    # clear session state
    with_read_timeout(10) do
      steps 'Then I sign out' if $browser
    rescue => exception
      puts "Session reset error: #{exception}"
    end
  else
    log_result scenario.passed?
    quit_browser
  end
end

def saucelabs_context(str)
  unless test_local? || test_device_farm?
    $browser&.execute_script("sauce:context=#{str}")
  end
rescue => exception
  puts "Context error: #{exception}"
end

failed = false
AfterConfiguration do |config|
  config.on_event :test_case_started do |event|
    saucelabs_context "Scenario: #{event.test_case.name}"
  end
  config.on_event :test_step_started do |event|
    last = event.test_step.source.last
    # Don't record context for (skipped) steps in scenario after failure.
    next if failed && last.is_a?(Cucumber::Core::Ast::Step)
    saucelabs_context last
  end
  config.on_event :test_step_finished do |event|
    if event.result.failed?
      failed = true
      saucelabs_context "Failed: #{event.result.exception}"
    end
  end
  config.on_event :test_case_finished do |_|
    saucelabs_context 'Passed' unless failed
    failed = false
  end
end

at_exit do
  log_result $all_passed if single_session?
  quit_browser
end

def very_verbose(msg)
  puts msg if ENV['VERY_VERBOSE']
end
