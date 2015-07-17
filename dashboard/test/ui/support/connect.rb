require 'selenium/webdriver'

$browser_configs = JSON.load(open("browsers.json"))

if ENV['TEST_LOCAL'] == 'true'
  # This drives a local installation of ChromeDriver running on port 9515, instead of BrowserStack.
  browser = Selenium::WebDriver.for :chrome, :url=>"http://127.0.0.1:9515"

  if ENV['MAXIMIZE_LOCAL'] == 'true'
    max_width, max_height = browser.execute_script("return [window.screen.availWidth, window.screen.availHeight];")
    browser.manage.window.resize_to(max_width, max_height)
  end
else
  if CDO.saucelabs_username.blank?
    raise "Please define CDO.saucelabs_username"
  end

  if CDO.saucelabs_authkey.blank?
    raise "Please define CDO.saucelabs_authkey"
  end

  url = "http://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@ondemand.saucelabs.com:80/wd/hub"

  capabilities = Selenium::WebDriver::Remote::Capabilities.new
  browser_config = $browser_configs.detect {|b| b['name'] == ENV['BROWSER_CONFIG'] }

  browser_config.each do |key, value|
    capabilities[key] = value
  end

  capabilities[:javascript_enabled] = 'true'
  capabilities[:name] = ENV['TEST_RUN_NAME']
  capabilities[:build] = ENV['BUILD']

  p "Capabilities: #{capabilities.inspect}"

  Time.now.tap do |start_time|
    browser = Selenium::WebDriver.for(:remote,
                                      url: url,
                                      desired_capabilities: capabilities,
                                      http_client: Selenium::WebDriver::Remote::Http::Default.new.tap{|c| c.timeout = 5.minutes}) # iOS takes more time
    p "Got browser in #{Time.now - start_time}s"
  end

  p "Browser: #{browser}"

  # Maximize the window on desktop, as some tests require 1280px width.
  unless ENV['MOBILE']
    max_width, max_height = browser.execute_script("return [window.screen.availWidth, window.screen.availHeight];")
    browser.manage.window.resize_to(max_width, max_height)
  end
end

# let's allow much longer timeouts when searching for an element
browser.manage.timeouts.implicit_wait = 2.minutes
browser.send(:bridge).setScriptTimeout(1.minute * 1000)

Before do
  @browser = browser
  @browser.manage.delete_all_cookies

  @sauce_session_id = @browser.send(:bridge).capabilities["webdriver.remote.sessionid"]
  puts 'visual log on sauce labs: https://saucelabs.com/tests/' + @sauce_session_id
end

def log_result(result)
  # Do something after each scenario.
  # The +scenario+ argument is optional, but
  # if you use it, you can inspect status with
  # the #failed?, #passed? and #exception methods.

  url = "https://#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}@saucelabs.com/rest/v1/#{CDO.saucelabs_username}/jobs/#{@sauce_session_id}"
  result = HTTParty.put(url,
                        body: {"passed" => result}.to_json,
                        headers: { 'Content-Type' => 'application/json' } )
end

all_passed = true

After do |scenario|
  all_passed = all_passed && scenario.passed?
  log_result all_passed
end

at_exit do
  browser.quit
end
