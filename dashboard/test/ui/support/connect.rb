require 'selenium/webdriver'

require_relative '../../../config/deployment.rb'

def browserstack_username
  ENV['BROWSERSTACK_USERNAME'] || CDO.browserstack_username
end

def browserstack_authkey
  ENV['BROWSERSTACK_AUTHKEY'] || CDO.browserstack_authkey
end

class Object
  def nil_or_empty?()
    self.nil? || self.empty?
  end
end

$browser_configs = JSON.load(open("browsers.json"))

if ENV['TEST_LOCAL'] == 'true'
  # This drives a local installation of ChromeDriver running on port 9515, instead of BrowserStack.
  browser = Selenium::WebDriver.for :chrome, :url=>"http://127.0.0.1:9515"

  if ENV['MAXIMIZE_LOCAL'] == 'true'
    max_width, max_height = browser.execute_script("return [window.screen.availWidth, window.screen.availHeight];")
    browser.manage.window.resize_to(max_width, max_height)
  end
else
  # BrowserStack
  if browserstack_username.nil_or_empty? || browserstack_authkey.nil_or_empty?
    raise "Missing BrowserStack credentials in environment."
  end

  url = "http://laurelfan:77874902-c45e-4d52-881c-fd897a4e1570@ondemand.saucelabs.com:80/wd/hub"

  capabilities = Selenium::WebDriver::Remote::Capabilities.new
  browser_config = $browser_configs.detect {|b| b['name'] == ENV['BROWSER_CONFIG'] }

  browser_config.each do |key, value|
    next if key == 'device'
    capabilities[key] = value
  end

  # capabilities['os'] = ENV['BS_AUTOMATE_OS'] || 'windows'
  # capabilities['os_version'] = ENV['BS_AUTOMATE_OS_VERSION'] || '7'
  # capabilities['browser'] = ENV['SELENIUM_BROWSER'] || 'chrome'
  # capabilities['browser_version'] = ENV['SELENIUM_VERSION'] || '31'

  capabilities['project'] = ENV['BS_AUTOMATE_PROJECT'] if ENV['BS_AUTOMATE_PROJECT']
  capabilities['build'] = ENV['BS_AUTOMATE_BUILD'] if ENV['BS_AUTOMATE_BUILD']

  # capabilities['rotatable'] = ENV['BS_ROTATABLE'] if ENV['BS_ROTATABLE']
  # capabilities['deviceOrientation'] = ENV['BS_ORIENTATION'] if ENV['BS_ORIENTATION']

  capabilities['browserstack.tunnel'] = 'true' if ENV['TEST_TUNNEL'] == 'true'

  capabilities["browserstack.debug"] = "true" unless ENV['TEST_REALMOBILE'] == 'true'
  capabilities["realMobile"] = ENV['TEST_REALMOBILE'] == 'true' ? 'true' : 'false'
  capabilities["resolution"] = '1280x1024'
  capabilities[:javascript_enabled] = 'true'
  capabilities[:name] = ENV['TEST_RUN_NAME']

  browser = Selenium::WebDriver.for(:remote, :url => url, :desired_capabilities => capabilities)

  # Maximize the window on desktop, as some tests require 1280px width.
  if ENV['MOBILE'] != "true"
    max_width, max_height = browser.execute_script("return [window.screen.availWidth, window.screen.availHeight];")
    browser.manage.window.resize_to(max_width, max_height)
  end
end

# let's allow much longer timeouts
browser.manage.timeouts.implicit_wait = 25

Before do
  @browser = browser
  @browser.manage.delete_all_cookies
  @browser.navigate.to "https://test-studio.code.org"
end

at_exit do
  browser.quit
end
