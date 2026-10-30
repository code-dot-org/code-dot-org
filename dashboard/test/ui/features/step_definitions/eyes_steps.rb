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

  batch = Applitools::BatchInfo.new(ENV.fetch('BATCH_NAME', nil))
  batch.id = ENV.fetch('BATCH_ID', nil)
  @eyes.batch = batch

  @eyes.branch_name = GitUtils.current_branch

  @original_browser = @browser
  config = {app_name: 'Code.org', test_name: test_name, driver: @browser}
  if @original_browser.capabilities.browser_name == 'chrome'
    config[:viewport_size] = {width: 1024, height: 690}
  end
  @browser.capabilities[:takes_screenshot] = true
  @eyes.stitch_mode = Applitools::STITCH_MODE[:css]

  @eyes.open(config)
end

And(/^I close my eyes$/) do
  next if CDO.disable_all_eyes_running

  @browser = @original_browser
  fail_on_mismatch = !CDO.ignore_eyes_mismatches
  begin
    @eyes.close(fail_on_mismatch)
  rescue Applitools::TestFailedError => exception
    puts "<span style=\"color: red;\">#{EYES_ERROR_PREFIX} #{Rinku.auto_link(exception.to_s)}</span>"
  end
end

# A Feature can optionally specify the stitch mode ('css' or 'scroll') for Eyes to create the full screenshot.
And(/^I see no difference for "([^"]*)"?( in the current viewport)?( without waiting for Font Awesome to load)?$/) do |identifier, skip_full_page, skip_fa_wait|
  next if CDO.disable_all_eyes_running

  # Capture only after the webfonts have loaded and the header has re-laid-out against
  # them. Otherwise text and icons shift as the fallback font swaps out, producing
  # spurious diffs ("font wiggle").
  wait_until do
    fonts_loaded? && header_relaid_out? && (skip_fa_wait || font_awesome_loaded?)
  end

  is_full_page_screenshot = !skip_full_page
  @eyes.check_window(identifier, MATCH_TIMEOUT, is_full_page_screenshot)
end

And(/^I see no difference for "([^"]*)" within "([^"]*)"$/) do |identifier, selector|
  next if CDO.disable_all_eyes_running

  element = nil
  wait_until do
    element = @browser.find_element(:css, selector)
    element.displayed? && fonts_loaded? && header_relaid_out?
  end

  @eyes.check_region(element, tag: identifier, match_timeout: MATCH_TIMEOUT, stitch_content: true)
end

And(/^The header is finished animating$/) do
  wait_for_jquery

  wait_until do
    @browser.execute_script('return $("#header_middle_content").css("opacity") === \'1\'') == true
  end
end

def ensure_eyes_available
  return if @eyes
  @eyes = Applitools::Selenium::Eyes.new
  @eyes.api_key = CDO.applitools_eyes_api_key
  @eyes.log_handler = Logger.new('../../log/eyes.log')
end

# There are several fonts we sometimes load associated with Font Awesome, but Font Awesome 6 at the "solid" weight (900) is our default,
# and used in the header (which appears across almost all pages), so we wait for that one to load at least.
def font_awesome_loaded?
  @browser.execute_script('return [...document.fonts].find(font => font.family === "Font Awesome 6 Pro" && font.weight === "900")?.status === "loaded"') == true
end

def fonts_loaded?
  # document.fonts.status reads "loaded" whenever nothing is currently loading, which
  # holds before the page's webfonts are even requested. Await the readiness promise
  # instead: it settles only after the in-use fonts have loaded and laid out.
  @browser.execute_async_script(<<~JS) == true
    const done = arguments[arguments.length - 1];
    document.fonts.ready.then(() => done(document.fonts.status === 'loaded'));
  JS
end

# HeaderMiddle.jsx sets data-header-present when the React header mounts and
# data-header-fonts-relaid-out after it re-measures on the font swap. Waiting for the latter
# captures the final layout rather than the fallback-font one. Key on data-header-present
# (set by the component), not the .header_middle element: that element is also server-rendered
# on non-lab dashboard pages that never mount this header, and those must pass straight
# through instead of blocking on a flag that will never appear.
def header_relaid_out?
  @browser.execute_script(<<~JS) == true
    const de = document.documentElement;
    return de.dataset.headerPresent !== 'true' ||
      de.dataset.headerFontsRelaidOut === 'true';
  JS
end
