$LOAD_PATH.unshift File.expand_path('../../../../../lib', __FILE__)
require 'eyes_selenium'
require 'cdo/git_utils'
require 'open-uri'
require 'json'
require 'rinku'
require_relative '../../utils/selenium_constants'
require 'logger'

# Override default match timeout (2 seconds) to help prevent laggy UI from breaking eyes tests.
# See http://support.applitools.com/customer/en/portal/articles/2099488-match-timeout
MATCH_TIMEOUT = 5

# A Feature can optionally specify the stitch mode ('css' or 'scroll') for Eyes to create the full screenshot.
When(/^I open my eyes to test "([^"]*)"( using stitch mode "([^"]*)")?$/) do |test_name, stitch_mode|
  next if CDO.disable_all_eyes_running
  ensure_eyes_available

  batch = Applitools::BatchInfo.new(ENV['BATCH_NAME'])
  batch.id = ENV['BATCH_ID']
  @eyes.batch = batch

  @eyes.branch_name = GitUtils.current_branch

  pr_base = GitUtils.circle_pr_branch_base_no_origin
  if pr_base
    puts "Branch is #{pr_base}"
    @eyes.parent_branch_name = pr_base
  else
    fallback_branch = GitUtils.current_branch_base_no_origin
    puts "No PR for eyes branch: #{GitUtils.current_branch}, using fallback parent branch #{fallback_branch}"
    @eyes.parent_branch_name = fallback_branch
  end

  @original_browser = @browser
  config = {app_name: 'Code.org', test_name: test_name, driver: @browser}
  if @original_browser.capabilities.browser_name == 'chrome'
    config[:viewport_size] = {width: 1024, height: 690}
  end
  @browser.capabilities[:takes_screenshot] = true
  @eyes.force_full_page_screenshot = true
  # Search for 'scroll' in the string captured by the regular expression.  Default to css stitch mode.
  # Use the safe navigation operator to ensure that nil is not converted by to_s to an empty string.
  @eyes.stitch_mode = (/scroll/.match(stitch_mode)&.to_s&.to_sym || :css)
  @eyes.open(config)
end

And(/^I close my eyes$/) do
  next if CDO.disable_all_eyes_running

  @browser = @original_browser
  fail_on_mismatch = !CDO.ignore_eyes_mismatches
  begin
    @eyes.close(fail_on_mismatch)
  rescue Applitools::TestFailedError => e
    puts "<span style=\"color: red;\">#{EYES_ERROR_PREFIX} #{Rinku.auto_link(e.to_s)}</span>"
  end
end

And(/^I see no difference for "([^"]*)"$/) do |identifier|
  next if CDO.disable_all_eyes_running

  @eyes.check_window(identifier, MATCH_TIMEOUT)
end

def ensure_eyes_available
  return if @eyes
  @eyes = Applitools::Selenium::Eyes.new
  @eyes.api_key = CDO.applitools_eyes_api_key
  # Force eyes to use a consistent host OS identifier for now
  # BrowserStack was reporting Windows 6.0 and 6.1, causing different baselines
  @eyes.host_os = ENV['APPLITOOLS_HOST_OS']
  @eyes.log_handler = Logger.new('../../log/eyes.log')
end
