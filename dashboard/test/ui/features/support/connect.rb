require 'selenium/webdriver'
require 'cgi'
require 'httparty'
require_relative '../../../../../deployment'
require 'active_support/core_ext/object/blank'
require_relative '../../utils/selenium_browser'
require 'retryable'

$browser_config = JSON.load(open("browsers.json")).detect {|b| b['name'] == ENV['BROWSER_CONFIG']} || {}

MAX_CONNECT_RETRIES = 3

# Run all feature scenarios in a single session.
def single_session?
  $browser_config['mobile'] || $single_session
end

def saucelabs_browser(test_run_name)
  raise "Please define CDO.saucelabs_username" if CDO.saucelabs_username.blank?
  raise "Please define CDO.saucelabs_authkey"  if CDO.saucelabs_authkey.blank?

  is_tunnel = ENV['CIRCLE_BUILD_NUM']
  url = "http://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@#{is_tunnel ? 'localhost:4445' : 'ondemand.saucelabs.com:80'}/wd/hub"

  capabilities = Selenium::WebDriver::Remote::Capabilities.new($browser_config)
  capabilities[:javascript_enabled] = 'true'

  if ENV['BROWSER_CONFIG'] == 'Firefox'
    # Firefox >= 66 has an issue with its content blocker causing page loads to block indefinitely.
    # Set content blocking to 'strict' as a workaround.
    profile = Selenium::WebDriver::Firefox::Profile.new
    profile['browser.contentblocking.category'] = 'strict'
    capabilities[:firefox_profile] = profile
  end

  sauce_capabilities = {
    name: test_run_name,
    tags: [ENV['GIT_BRANCH']],
    build: CDO.circle_run_identifier || ENV['BUILD'],
    idleTimeout: 60
  }
  sauce_capabilities[:tunnelIdentifier] = CDO.circle_run_identifier if CDO.circle_run_identifier
  sauce_capabilities[:priority] = ENV['PRIORITY'].to_i if ENV['PRIORITY']

  # Use w3c-spec sauce:options capabilities format for compatible browsers.
  # Ref: https://wiki.saucelabs.com/display/DOCS/Selenium+W3C+Capabilities+Support+-+Beta
  if $browser_config['w3c']
    sauce_capabilities['seleniumVersion'] = Selenium::WebDriver::VERSION
    capabilities['sauce:options'] = sauce_capabilities
    capabilities['platformName'] = capabilities['platform']
  else
    capabilities.merge!(sauce_capabilities)
  end

  very_verbose "DEBUG: Capabilities: #{CGI.escapeHTML capabilities.inspect}"

  Selenium::WebDriver.for(:remote,
    url: url,
    desired_capabilities: capabilities,
  )
end

# Set HTTP read timeout to the specified value during the block.
def with_read_timeout(timeout, &block)
  $http_client ?
    $http_client.with_read_timeout(timeout, &block) :
    yield
end

def get_browser(test_run_name)
  browser = nil
  if ENV['TEST_LOCAL'] == 'true'
    headless = ENV['TEST_LOCAL_HEADLESS'] == 'true'
    browser = SeleniumBrowser.local(headless, ENV['BROWSER_CONFIG'])
  else
    browser = Retryable.retryable(tries: MAX_CONNECT_RETRIES) do
      saucelabs_browser(test_run_name)
    end
    $session_id = browser.session_id
    visual_log_url = "https://saucelabs.com/tests/#{$session_id}"
    puts "visual log on sauce labs: <a href='#{visual_log_url}'>#{visual_log_url}</a>"
  end

  # Time to wait for page loads to complete (default 5 minutes).
  browser.manage.timeouts.page_load = 2.minutes

  # Time to wait for any async script to timeout (default 30 seconds).
  # IE11 requires this to be explicitly set.
  browser.manage.timeouts.script_timeout = 30.seconds

  # Maximize the window on desktop, as some tests require 1280px width.
  unless ENV['MOBILE']
    max_width, max_height = browser.execute_script('return [window.screen.availWidth, window.screen.availHeight];')
    browser.manage.window.resize_to(max_width, max_height)
  end
  browser
end

$browser = nil

Before('@dashboard_db_access') do
  require_rails_env
end

Before do |scenario|
  @tags = scenario.source_tag_names
  $single_session = true if @tags.include?('@single_session')

  very_verbose "DEBUG: @browser == #{CGI.escapeHTML @browser.inspect}"

  if single_session?
    very_verbose('Single session, using existing browser') if $browser
    $browser ||= get_browser ENV['TEST_RUN_NAME']
    @browser ||= $browser
  else
    $browser = @browser = get_browser "#{ENV['TEST_RUN_NAME']}_#{scenario.name}"
  end

  debug_cookies(@browser.manage.all_cookies) if @browser && ENV['VERY_VERBOSE']
end

def log_result(result)
  return unless $session_id

  url = "https://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@saucelabs.com/rest/v1/#{CDO.saucelabs_username}/jobs/#{$session_id}"
  HTTParty.put(
    url,
    body: {"passed" => result}.to_json,
    headers: {'Content-Type' => 'application/json'}
  )
rescue => e
  puts "Error logging result: #{e}"
end

# Quit current browser session.
def quit_browser
  with_read_timeout(5.seconds) do
    $browser&.quit
  rescue => e
    puts "Error quitting browser session: #{e}"
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
    rescue => e
      puts "Session reset error: #{e}"
    end
  else
    log_result scenario.passed?
    quit_browser
  end
end

def context(str)
  unless ENV['TEST_LOCAL'] == 'true'
    $browser&.execute_script("sauce:context=#{str}")
  end
rescue => e
  puts "Context error: #{e}"
end

failed = false
AfterConfiguration do |config|
  config.on_event :test_case_started do |event|
    context "Scenario: #{event.test_case.name}"
  end
  config.on_event :test_step_started do |event|
    last = event.test_step.source.last
    # Don't record context for (skipped) steps in scenario after failure.
    next if failed && last.is_a?(Cucumber::Core::Ast::Step)
    context last
  end
  config.on_event :test_step_finished do |event|
    if event.result.failed?
      failed = true
      context "Failed: #{event.result.exception}"
    end
  end
  config.on_event :test_case_finished do |_|
    context 'Passed' unless failed
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
