require 'eyes_selenium'

# Override default match timeout (2 seconds) to help prevent laggy UI from breaking eyes tests.
# See http://support.applitools.com/customer/en/portal/articles/2099488-match-timeout
MATCH_TIMEOUT = 5

When(/^I open my eyes to test "([^"]*)"$/) do |test_name|
  ensure_eyes_available

  batch_name = test_name + " | " + ENV['BATCH_NAME']
  @eyes.batch = Applitools::Base::BatchInfo.new(batch_name)

  @original_browser = @browser
  config = { app_name: 'Code.org', test_name: test_name, driver: @browser }
  if @original_browser.capabilities.browser_name == 'chrome'
    config[:viewport_size] = {width: 1024, height: 698}
  end
  @browser.capabilities[:takes_screenshot] = true
  @browser = @eyes.open(config)
end

And(/^I close my eyes$/) do
  @browser = @original_browser
  @eyes.close
end

And(/^I see no difference for "([^"]*)"$/) do |identifier|
  @eyes.check_window(identifier, MATCH_TIMEOUT)
end

def ensure_eyes_available
  return if @eyes
  @eyes = Applitools::Eyes.new
  @eyes.api_key = CDO.applitools_eyes_api_key
  # Force eyes to use a consistent host OS identifier for now
  # BrowserStack was reporting Windows 6.0 and 6.1, causing different baselines
  @eyes.host_os = ENV['APPLITOOLS_HOST_OS']
end
