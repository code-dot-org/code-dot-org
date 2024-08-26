#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'selenium-webdriver'
require 'eyes_selenium'

eyes = Applitools::Selenium::Eyes.new
eyes.api_key = CDO.applitools_eyes_api_key
eyes.force_full_page_screenshot = true

sauce_url = "http://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@ondemand.us-west-1.saucelabs.com:80/wd/hub"
driver = Selenium::WebDriver.for(:remote,
  url: sauce_url,
  capabilities: Selenium::WebDriver::Remote::Capabilities.new({
                                                                'browserName': "chrome",
    'browserVersion': "105",
    'platformName': "Windows 10",
    'sauce:options': {
      'screenResolution': "1280x1024",
      'extendedDebugging': true,
      'seleniumVersion': Selenium::WebDriver::VERSION,
      idleTimeout: 60,
    }
                                                              }
),
)

def then_i_see_no_difference_for(eyes, identifier, stitch_mode)
  if stitch_mode == "none"
    eyes.force_full_page_screenshot = false
  else
    eyes.stitch_mode = stitch_mode == "scroll" ?
      Applitools::STITCH_MODE[:scroll] :
      Applitools::STITCH_MODE[:css]
  end

  # eyes.check_window(identifier, 5, false)
  eyes.check_window(identifier, 5)

  eyes.force_full_page_screenshot = true
  eyes.stitch_mode = Applitools::STITCH_MODE[:css]
end

begin
  eyes.open(driver: driver, app_name: 'Google News', test_name: 'full_page_test.rb')
  driver.get 'https://slashdot.org'

  identifier_frag = "initial load"

  eyes.check(identifier_frag + " this works", Applitools::Selenium::Target.window.fully)

  then_i_see_no_difference_for(eyes, identifier_frag, "")
  then_i_see_no_difference_for(eyes, identifier_frag + " none", "none")
  then_i_see_no_difference_for(eyes, identifier_frag + " scroll", "scroll")
  then_i_see_no_difference_for(eyes, identifier_frag + " css", "css")

  eyes.close
ensure
  driver.quit
  eyes.abort_if_not_closed
end
