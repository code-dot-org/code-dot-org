When /^I repro the frame-switch bug$/ do
  @browser.navigate.to 'about:blank'

  @browser.execute_script %{
    document.body.innerHTML = '<iframe id="myframe" src="http://example.com"></iframe>';
    var myframe = document.getElementById("myframe");
    myframe.onload = function() { window.iframeLoadedForTesting = true; };
  }

  Selenium::WebDriver::Wait.new(timeout: 30).until do
    begin
      @browser.execute_script("return window.iframeLoadedForTesting;")
    rescue Selenium::WebDriver::Error::UnknownError, Selenium::WebDriver::Error::StaleElementReferenceError
      false
    end
  end

  @browser.switch_to.frame @browser.find_element(tag_name: 'iframe')
end
