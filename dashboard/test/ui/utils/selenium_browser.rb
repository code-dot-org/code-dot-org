require 'selenium/webdriver'

module SeleniumBrowser
  def self.local_browser
    ensure_chromedriver_running
    sleep 2
    browser = Selenium::WebDriver.for :chrome, url: 'http://127.0.0.1:9515'
    if ENV['MAXIMIZE_LOCAL']
      max_width, max_height = browser.execute_script('return [window.screen.availWidth, window.screen.availHeight];')
      browser.manage.window.resize_to(max_width, max_height)
    end
    browser
  end

  def self.ensure_chromedriver_running
    # Verify that chromedriver is actually running
    unless `ps x`.include?('chromedriver')
      puts "You cannot run with the --local flag unless you are running chromedriver. Automatically running
chromedriver found at #{`which chromedriver`}"
      system('chromedriver &')
    end
  end
end
