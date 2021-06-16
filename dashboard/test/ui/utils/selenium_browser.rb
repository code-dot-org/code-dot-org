require 'selenium/webdriver'
require 'webdrivers'

module SeleniumBrowser
  def self.local(headless=true, browser=:chrome)
    browser = browser.to_sym
    options = {}
    if browser == :chrome
      Selenium::WebDriver::Chrome.driver_path = '/usr/local/bin/chromedriver'
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

  require 'net/http/persistent'
  # Replaces the misleading 'too many connection resets' error message for read timeouts.
  class HttpClient < Net::HTTP::Persistent
    def request_failed(exception, req, connection)
      if exception.is_a?(Net::ReadTimeout)
        backtrace = exception.backtrace
        exception = Net::ReadTimeout.new("No response after #{read_timeout} seconds")
        exception.set_backtrace(backtrace)
      end
      finish connection
      raise exception
    end
  end

  require 'selenium/webdriver/remote/http/persistent'
  class Client < Selenium::WebDriver::Remote::Http::Persistent
    # Replaces 'unexpected response' message with the actual parsed error from the JSON response, if provided.
    def create_response(code, body, content_type)
      super
    rescue Selenium::WebDriver::Error::WebDriverError => e
      if (msg = e.message.match(/unexpected response, code=(?<code>\d+).*\n(?<error>.*)/))
        error = msg[:error]
        error = JSON.parse(error)['value']['error'] rescue error
        e.message.replace("Error #{msg[:code]}: #{error}")
      end
      raise
    end

    def new_http_client
      HttpClient.new name: 'webdriver'
    end

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
