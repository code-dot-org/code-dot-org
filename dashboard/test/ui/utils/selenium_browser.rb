require 'selenium/webdriver'
require 'webdrivers'

module SeleniumBrowser
  def self.local_browser(headless=true, browser=:chrome)
    browser = browser.to_sym
    options = {}
    if browser == :chrome
      options[:options] = Selenium::WebDriver::Chrome::Options.new
      options[:options].add_argument('--headless') if headless
    elsif browser == :firefox
      options[:options] = Selenium::WebDriver::Firefox::Options.new
      options[:options].headless! if headless
    end
    browser = Selenium::WebDriver.for browser, options
    if ENV['MAXIMIZE_LOCAL']
      max_width, max_height = browser.execute_script('return [window.screen.availWidth, window.screen.availHeight];')
      browser.manage.window.resize_to(max_width, max_height)
    end
    browser
  end
end
