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

When(/^I open my eyes to test "([^"]*)"$/) do |test_name|
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
  # Default stitch mode can be customized for each checkpoint in the I See No Difference step.
  @eyes.stitch_mode = :css

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

# A Feature can optionally specify the stitch mode ('css' or 'scroll') for Eyes to create the full screenshot.
And(/^I see no difference for "([^"]*)"(?: using stitch mode "([^"]*)")?$/) do |identifier, stitch_mode|
  next if CDO.disable_all_eyes_running

  @eyes.stitch_mode = (stitch_mode&.to_sym || :css)
  @eyes.check_window(identifier, MATCH_TIMEOUT)
  # Return to default stitch mode for remaining checkpoints in this Scenario.
  @eyes.stitch_mode = :css
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
