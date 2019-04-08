require 'selenium/webdriver'
require 'webdrivers'

module SeleniumBrowser
  def self.local_browser(headless=true)
    options = Selenium::WebDriver::Chrome::Options.new
    if headless
      options.add_argument('--headless')
    end
    browser = Selenium::WebDriver.for :chrome, options: options
    if ENV['MAXIMIZE_LOCAL']
      max_width, max_height = browser.execute_script('return [window.screen.availWidth, window.screen.availHeight];')
      browser.manage.window.resize_to(max_width, max_height)
    end
    browser
  end
end
