require 'selenium/webdriver'
require 'cgi'
require 'httparty'
require_relative '../../../../../deployment'
require 'active_support/core_ext/object/blank'
require_relative '../../utils/selenium_browser'
require 'retryable'

$browser_config = JSON.load(open("browsers.json")).detect {|b| b['name'] == ENV['BROWSER_CONFIG']}

MAX_CONNECT_RETRIES = 3

def slow_browser?
  ['iPhone', 'iPad'].include? ENV['BROWSER_CONFIG']
end

def saucelabs_browser(test_run_name)
  raise "Please define CDO.saucelabs_username" if CDO.saucelabs_username.blank?
  raise "Please define CDO.saucelabs_authkey"  if CDO.saucelabs_authkey.blank?

  is_tunnel = ENV['CIRCLE_BUILD_NUM']
  url = "http://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@#{is_tunnel ? 'localhost:4445' : 'ondemand.saucelabs.com:80'}/wd/hub"

  capabilities = Selenium::WebDriver::Remote::Capabilities.new($browser_config)

  capabilities[:javascript_enabled] = 'true'
  capabilities[:tunnelIdentifier] = CDO.circle_run_identifier if CDO.circle_run_identifier
  capabilities[:name] = test_run_name
  capabilities[:tags] = [ENV['GIT_BRANCH']]
  capabilities[:build] = CDO.circle_run_identifier || ENV['BUILD']
  capabilities[:idleTimeout] = 600
  very_verbose "DEBUG: Capabilities: #{CGI.escapeHTML capabilities.inspect}"

  $http_client = SeleniumBrowser::Client.new(read_timeout: 2.minutes)
  with_read_timeout(5.minutes) do
    Selenium::WebDriver.for(:remote,
      url: url,
      desired_capabilities: capabilities,
      http_client: $http_client
    )
  end
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

  # Maximize the window on desktop, as some tests require 1280px width.
  unless ENV['MOBILE']
    max_width, max_height = browser.execute_script('return [window.screen.availWidth, window.screen.availHeight];')
    browser.manage.window.resize_to(max_width, max_height)
  end
  browser
end

$browser = nil

Before do |scenario|
  very_verbose "DEBUG: @browser == #{CGI.escapeHTML @browser.inspect}"

  if slow_browser?
    $browser ||= get_browser ENV['TEST_RUN_NAME']
    very_verbose 'slow browser, using existing'
    @browser ||= $browser
  else
    very_verbose 'fast browser, getting a new one'
    $browser = @browser = get_browser "#{ENV['TEST_RUN_NAME']}_#{scenario.name}"
  end
  @browser.manage.delete_all_cookies

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
  if slow_browser?
    $all_passed &&= scenario.passed?
    # clear session state
    unless @browser.current_url.include?('studio')
      steps 'Then I am on "http://studio.code.org/"'
    end
    @browser.execute_script 'sessionStorage.clear()'
    @browser.execute_script 'localStorage.clear()'
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
  log_result $all_passed if slow_browser?
  quit_browser
end

def very_verbose(msg)
  puts msg if ENV['VERY_VERBOSE']
end
