require 'selenium/webdriver'
require 'webdrivers'

module SeleniumBrowser
  def self.local(headless=true, browser=:chrome)
    browser = browser.to_sym
    options = {}
    if browser == :chrome
      options[:options] = Selenium::WebDriver::Chrome::Options.new
      options[:options].add_argument('headless') if headless
      options[:options].add_argument('window-size=1280,1024')
    elsif browser == :firefox
      options[:options] = Selenium::WebDriver::Firefox::Options.new
      options[:options].headless! if headless
      options[:options].add_argument('window-size=1280,1024')
    end
    Selenium::WebDriver.for browser, options
  end

  require 'selenium/webdriver/remote/http/default'
  class Client < Selenium::WebDriver::Remote::Http::Default
    def read_timeout=(timeout)
      super
      @http&.read_timeout = timeout
    end

    # Set HTTP read timeout within the specified block.
    def with_read_timeout(timeout)
      old_timeout = read_timeout
      self.read_timeout = timeout
      yield
    ensure
      self.read_timeout = old_timeout
    end
  end
end
