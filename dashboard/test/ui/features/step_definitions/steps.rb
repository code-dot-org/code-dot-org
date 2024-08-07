require 'cdo/url_converter'

DEFAULT_WAIT_TIMEOUT = 2.minutes
SHORT_WAIT_TIMEOUT = 30.seconds
MODULE_PROGRESS_COLOR_MAP = {not_started: 'rgb(255, 255, 255)', in_progress: 'rgb(239, 205, 28)', completed: 'rgb(14, 190, 14)'}

def wait_until(timeout = DEFAULT_WAIT_TIMEOUT)
  Selenium::WebDriver::Wait.new(timeout: timeout).until do
    yield
  rescue Selenium::WebDriver::Error::UnknownError => exception
    puts "Unknown error: #{exception}"
    false
  rescue Selenium::WebDriver::Error::WebDriverError => exception
    raise unless exception.message.include?('no such element')
    false
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    false
  end
end

def wait_short_until(&block)
  wait_until(SHORT_WAIT_TIMEOUT, &block)
end

def element_stale?(element)
  element.enabled?
  false
rescue Selenium::WebDriver::Error::JavascriptError => exception
  exception.message.starts_with? 'Element does not exist in cache'
rescue Selenium::WebDriver::Error::UnknownError => exception
  puts "Unknown error: #{exception}"
  true
rescue Selenium::WebDriver::Error::StaleElementReferenceError
  true
rescue Selenium::WebDriver::Error::WebDriverError => exception
  return true if exception.message.include?('stale element reference') ||
    exception.message.include?('no such element')
  puts "Unknown error: #{exception}"
  true
end

def page_load(wait = true, blank_tab: false)
  if wait
    root = @browser.find_element(css: ':root')
    tabs = @browser.window_handles if wait == 'tab'
    yield
    if tabs
      new_tab = wait_until {(@browser.window_handles - tabs).first}
      @browser.switch_to.window(new_tab)
    end
    wait_until {element_stale?(root)}
    unless blank_tab
      wait_until do
        (url = @browser.current_url) != '' &&
          url != 'about:blank' &&
          @browser.execute_script('return document.readyState;') == 'complete'
      end
    end
  else
    yield
  end
end

def replace_hostname(url)
  UrlConverter.new(
    dashboard_host: ENV.fetch('DASHBOARD_TEST_DOMAIN', nil),
    pegasus_host: ENV.fetch('PEGASUS_TEST_DOMAIN', nil),
    hourofcode_host: ENV.fetch('HOUROFCODE_TEST_DOMAIN', nil),
    csedweek_host: ENV.fetch('CSEDWEEK_TEST_DOMAIN', nil),
  ).replace_origin(url)
end

# When an individual step fails in a call to steps, one gets no feedback about
# which step failed. This splits a set of steps into individual steps, and calls
# each separately, so that when one fails we're told which.
def individual_steps(steps)
  steps.split("\n").map(&:strip).each do |separate_step|
    steps separate_step
  end
end

def navigate_to(url)
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, sleep: 10, tries: 3) do
    with_read_timeout(DEFAULT_WAIT_TIMEOUT + 5.seconds) do
      root = @browser.find_element(css: ':root')
      @browser.navigate.to url
      # Wait until the document has actually changed
      if root
        wait_until do
          root != @browser.find_element(css: ':root')
        end
      end
      # Then, wait until the document is done loading
      wait_until do
        @browser.execute_script('return document.readyState;') == 'complete'
      end
    end
    refute_bad_gateway_or_site_unreachable
  end
  install_js_error_recorder
end

Given /^I am on "([^"]*)"$/ do |url|
  check_window_for_js_errors('before navigation')
  begin
    navigate_to replace_hostname(url)
  rescue Selenium::WebDriver::Error::TimeoutError => exception
    puts "Timeout: I am not on #{url} like I want."
    puts "         I am on #{@browser.current_url} instead."
    raise exception
  end
end

And /^I take note of the current loaded page$/ do
  # Remember this page
  @current_page_body = @browser.find_element(:css, 'body')
  @current_page_body_url = @browser.current_url
end

Then /^I wait until I am on a different page than I noted before$/ do
  # When we've seen a page before, look for a different page
  if @current_page_body
    begin
      wait_until do
        @current_page_body != @browser.find_element(:css, 'body')
      end
    rescue Selenium::WebDriver::Error::TimeoutError => exception
      puts "Timeout: I am not still on #{@current_page_body_url} like I want."
      puts "         I am on #{@browser.current_url} instead."
      raise exception
    end
  end
end

When /^I wait to see (?:an? )?"([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {id: name} : {class: name}
  wait_until {!@browser.find_elements(selection_criteria).empty?}
end

When /^I go to a new tab$/ do
  page_load('tab', blank_tab: true) do
    @browser.execute_script('window.open();')
  end
end

When /^I go back$/ do
  @browser.execute_script('window.history.back();')
end

When /^I close the current tab$/ do
  @browser.close
  tabs = @browser.window_handles
  @browser.switch_to.window(tabs.first) if tabs.any?
end

When /^I switch tabs$/ do
  tab = @browser.window_handle
  @browser.switch_to.window(@browser.window_handles.detect {|handle| handle != tab})
end

When /^I switch to the first iframe( once it exists)?$/ do |wait|
  $default_window = @browser.window_handle
  if wait
    wait_short_until do
      @browser.find_elements(tag_name: 'iframe').any?
    end
  end
  @browser.switch_to.frame @browser.find_element(tag_name: 'iframe')
end

When /^I switch to the iframe "([^"]*)"$/ do |iframe_selector|
  $default_window = @browser.window_handle
  @browser.switch_to.frame @browser.find_element(:css, iframe_selector)
end

# Can switch out of iframe content
When /^I switch to the default content$/ do
  @browser.switch_to.default_content
end

When /^I close the instructions overlay if it exists$/ do
  steps 'When I click selector "#overlay" if it exists'
end

When /^I wait for the lab page to fully load$/ do
  steps <<-GHERKIN
    When I wait to see "#runButton"
    And I wait to see ".header_user"
    And I close the instructions overlay if it exists
  GHERKIN
end

When /^I close the dialog$/ do
  # Add a wait to closing dialog because it's sometimes animated, now.
  steps <<-GHERKIN
    When I press "x-close"
    And I wait for 0.75 seconds
  GHERKIN
end

When /^I wait until "([^"]*)" in localStorage equals "([^"]*)"$/ do |key, value|
  wait_until {@browser.execute_script("return localStorage.getItem('#{key}') === '#{value}';")}
end

And /^I add another version to the project$/ do
  steps <<-GHERKIN
    And I add code "// comment A" to ace editor
    And I wait until element "#resetButton" is visible
    And I press "resetButton"
    And I click selector "#runButton" once I see it
  GHERKIN
end

When /^I reset the puzzle to the starting version$/ do
  steps <<-GHERKIN
    Then I click selector "#versions-header"
    And I wait to see a dialog titled "Version History"
    And I see "#showVersionsModal"
    And I wait until element "button:contains(Start over)" is visible
    And I close the dialog
    And I wait until element "#showVersionsModal" is gone
    And I wait for 3 seconds
    Then I click selector "#versions-header"
    And I wait until element "button:contains(Start over)" is visible
    And I click selector "button:contains(Start over)"
    And I click selector "#start-over-button"
    And I wait until element "#showVersionsModal" is gone
    And I wait for 3 seconds
  GHERKIN
end

When /^I reset the puzzle$/ do
  @browser.find_element(:css, '#clear-puzzle-header').click
  @browser.find_element(:css, '#confirm-button').click
end

Then /^I see "([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {id: name} : {class: name}
  selection_criteria = {css: "#{selector_symbol}#{name}"} if name.include?('#')
  @browser.find_element(selection_criteria)
end

When /^I wait until (?:element )?"([^"]*)" (?:has|contains) text "([^"]*)"$/ do |selector, text|
  wait_for_jquery
  wait_until {@browser.execute_script("return $(#{selector.dump}).text();").include? text}
end

When /^I wait until (?:element )?"([^"]*)" does not (?:have|contain) text "([^"]*)"$/ do |selector, text|
  wait_short_until do
    element_text = @browser.execute_script("return $(#{selector.dump}).text();")
    element_text.exclude?(text)
  end
end

When /^I wait until the first (?:element )?"([^"]*)" (?:has|contains) text "([^"]*)"$/ do |selector, text|
  wait_until {@browser.execute_script("return $(#{selector.dump}).first().text();").include? text}
end

When /^I wait until (?:element )?"([^"]*)" (?:has|contains) one or more integers$/ do |selector|
  wait_for_jquery
  wait_until do
    element_text = @browser.execute_script("return $(#{selector.dump}).text();")
    element_text.match?(/\d+/)
  end
end

When /^I wait until (?:element )?"([^"]*)" is (not )?checked$/ do |selector, negation|
  wait_until {@browser.execute_script("return $(\"#{selector}\").is(':checked');") == negation.nil?}
end

def jquery_is_element_visible(selector)
  "return $(#{selector.dump}).is(':visible') && $(#{selector.dump}).css('visibility') !== 'hidden';"
end

def jquery_is_element_displayed(selector)
  "return $(#{selector.dump}).css('display') !== 'none';"
end

def jquery_is_element_open(selector)
  "return $(#{selector.dump}).attr('open') !== undefined;"
end

When /^I wait until element "([^"]*)" is (not )?visible$/ do |selector, negation|
  wait_for_jquery
  wait_until {@browser.execute_script(jquery_is_element_visible(selector)) == negation.nil?}
end

When /^I wait until (?:element )?"([.#])([^"]*)" is (not )?enabled$/ do |selector_symbol, name, negation|
  selection_criteria = selector_symbol == '#' ? {id: name} : {class: name}
  wait_until do
    element = @browser.find_element(selection_criteria)
    element.enabled? == negation.nil?
  end
end

Then /^I wait up to ([\d\.]+) seconds for element "([^"]*)" to be visible$/ do |seconds, selector|
  wait_for_jquery
  Selenium::WebDriver::Wait.new(timeout: seconds.to_f).until do
    @browser.execute_script(jquery_is_element_visible(selector))
  end
end

When /^I wait until element "([^"]*)" is in the DOM$/ do |selector|
  wait_for_jquery
  wait_until {@browser.execute_script("return $(#{selector.dump}).length > 0")}
end

Then /^I wait until element "([.#])([^"]*)" is gone$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {id: name} : {class: name}
  wait_until {@browser.find_elements(selection_criteria).empty?}
end

# Required for inspecting elements within an iframe
When /^I wait until element "([^"]*)" is visible within element "([^"]*)"$/ do |selector, parent_selector|
  wait_until {@browser.execute_script("return $(#{selector.dump}, $(#{parent_selector.dump}).contents()).is(':visible')")}
end

Then /^I wait until element "([^"]*)" is (not )?open$/ do |selector, negation|
  wait_until {element_open?(selector) == negation.nil?}
end

When /^I wait until jQuery Ajax requests are finished$/ do
  wait_short_until {@browser.execute_script("return $.active == 0")}
end

Then /^I make all links open in the current tab$/ do
  @browser.execute_script("$('a[target=_blank]').attr('target', '_parent');")
end

Then /^check that I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  expect(@browser.current_url).to eq(url)
end

Then /^I wait until current URL contains "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  wait_until {@browser.current_url.include? url}
end

And /^check that the URL matches "([^"]*)"$/ do |regex_text|
  expect(@browser.current_url.match(regex_text).nil?).to eq(false)
end

Then /^I wait until I am on "([^"]*)"$/ do |url|
  if @browser.capabilities.browser_name == 'Safari'
    puts "WARNING: 'I wait until I am on' is not reliable in Safari. Consider 'to load a new page' steps instead."
  end
  url = replace_hostname(url)
  begin
    wait_until {@browser.current_url == url}
  rescue Selenium::WebDriver::Error::TimeoutError => exception
    puts "Timeout: I am not on #{url} like I want."
    puts "         I am on #{@browser.current_url} instead."
    raise exception
  end
end

Then /^check that the URL contains "([^"]*)"$/i do |url|
  url = replace_hostname(url)
  expect(@browser.current_url).to include(url)
end

When /^I wait for (\d+(?:\.\d*)?) seconds?$/ do |seconds|
  sleep seconds.to_f
end

When /^I rotate to (landscape|portrait)$/ do |orientation|
  if ENV['BS_ROTATABLE'] == "true"
    $http_client.call(
      :post,
      "/wd/hub/session/#{@browser.session_id}/orientation",
      {orientation: orientation.upcase}
    )
  end
end

When /^I press "([^"]*)"(?: to load a new (page|tab))?$/ do |button, load|
  wait_short_until do
    @button = @browser.find_element(id: button)
  end
  page_load(load) {@button.click}
end

When /^I press the child number (.*) of class "([^"]*)"( to load a new page)?$/ do |number, selector, load|
  wait_short_until do
    @elements = @browser.find_elements(:css, selector)
    @element = @elements[number.to_i]
  end

  page_load(load) do
    @element.click
  rescue
    # Single retry to compensate for element changing between find and click
    @element = @browser.find_element(:css, selector)
    @element.click
  end
end

When /^I press the first "([^"]*)" element(?: to load a new (page|tab))?$/ do |selector, load|
  wait_short_until do
    @element = @browser.find_element(:css, selector)
  end
  page_load(load) do
    @element.click
  rescue
    # Single retry to compensate for element changing between find and click
    @element = @browser.find_element(:css, selector)
    @element.click
  end
end

When /^I press the "([^"]*)" button( to load a new page)?$/ do |button_text, load|
  wait_short_until do
    @button = @browser.find_element(:css, "input[value='#{button_text}']")
  end
  page_load(load) {@button.click}
end

When /^I press "([^"]*)" using jQuery( to load a new page)?$/ do |selector, load|
  page_load(load) do
    @browser.execute_script("$(#{selector.dump}).click()")
  end
end

When /^I press SVG selector "([^"]*)"$/ do |selector|
  @browser.execute_script("$(#{selector.dump}).simulate('drag', function(){});")
end

When /^I press the last button with text "([^"]*)"( to load a new page)?$/ do |name, load|
  name_selector = "button:contains(#{name})"
  page_load(load) do
    @browser.execute_script("$('" + name_selector + "').simulate('drag', function(){});")
  end
end

When /^I press the SVG text "([^"]*)"$/ do |name|
  name_selector = "text:contains(#{name})"
  @browser.execute_script("$('" + name_selector + "').simulate('drag', function(){});")
end

And(/^I scroll to "([^"]*)"$/) do |selector|
  @browser.find_element(:css, selector).location_once_scrolled_into_view
end

When /^I select the "([^"]*)" option in dropdown "([^"]*)"( to load a new page)?$/ do |option_text, element_id, load|
  select_dropdown(@browser.find_element(:id, element_id), option_text, load)
end

When /^I select the "([^"]*)" option in dropdown with class "([^"]*)"( to load a new page)?$/ do |option_text, class_name, load|
  select_dropdown(@browser.find_element(:css, ".#{class_name}"), option_text, load)
end

When /^I select the "([^"]*)" option in dropdown named "([^"]*)"( to load a new page)?$/ do |option_text, element_name, load|
  select_dropdown(@browser.find_element(:css, "select[name=#{element_name}]"), option_text, load)
end

def select_dropdown(element, option_text, load)
  element.location_once_scrolled_into_view
  page_load(load) do
    select = Selenium::WebDriver::Support::Select.new(element)
    select.select_by(:text, option_text)
  end
end

When /^I open the topmost blockly category "([^"]*)"$/ do |name|
  name_selector = ".blocklyTreeLabel:contains(#{name})"
  # seems we usually have two of these item, and want the second if the function
  # editor is open, the first if it isn't
  @browser.execute_script(
    "var val = Blockly.functionEditor && Blockly.functionEditor.isOpen() ? 1 : 0; " \
    "$('#{name_selector}').get(val).dispatchEvent(new MouseEvent('mousedown', {" \
      "bubbles: true," \
      "cancelable: true," \
      "view: window" \
    "}))"
  )
rescue
  script = "var val = Blockly.functionEditor && Blockly.functionEditor.isOpen() ? 1 : 0; " \
    "$('" + name_selector + "').eq(val).simulate('drag', function(){});"
  @browser.execute_script(script)
end

And(/^I open the blockly category with ID "([^"]*)"$/) do |id|
  # jQuery needs \\s to allow :s and .s in ID selectors
  # Escaping those gives us \\\\ per-character
  category_selector = "#\\\\:#{id}\\\\.label"
  @browser.execute_script(
    "$('#{category_selector}').last().get(0).dispatchEvent(new MouseEvent('mousedown', {" \
      "bubbles: true," \
      "cancelable: true," \
      "view: window" \
    "}))"
  )
rescue
  @browser.execute_script("$('" + category_selector + "').last().simulate('drag', function(){});")
end

When /^I press dropdown button with text "([^"]*)"$/ do |text|
  @browser.execute_script("$('.goog-flat-menu-button-caption:contains(#{text})').simulate('drag', function(){});")
end

When /^I press dropdown item with text "([^"]*)"$/ do |text|
  @browser.execute_script("$('.goog-menuitem:contains(#{text})').last().simulate('drag', function(){});")
end

When /^I press the edit button on a function call named "([^"]*)"$/ do |text|
  @browser.execute_script("$('.blocklyDraggable:contains(#{text})').find('.blocklyIconGroup:contains(edit)').first().simulate('drag', function(){})")
end

When /^I press dropdown item "([^"]*)"$/ do |index|
  @browser.execute_script("$('.goog-menuitem').eq(#{index}).simulate('drag', function(){});")
end

When /^I press a button with xpath "([^"]*)"$/ do |xpath|
  wait_until do
    @button = @browser.find_element(:xpath, xpath)
  end
  @button.click
end

# Prefer clicking with selenium over jquery, since selenium clicks will fail
# if the target element is obscured by another element.
When /^I click "([^"]*)"( once it exists)?(?: to load a new (page|tab))?$/ do |selector, wait, load|
  find = -> {@browser.find_element(:css, selector)}
  element = wait ? wait_until(&find) : find.call
  page_load(load) {element.click}
end

When /^I click "([^"]*)" if it is visible$/ do |selector|
  if @browser.execute_script(jquery_is_element_visible(selector))
    find = -> {@browser.find_element(:css, selector)}
    element = find.call
    element.click
  end
end

When /^I select the end of "([^"]*)"$/ do |selector|
  @browser.execute_script("document.querySelector(\"#{selector}\").setSelectionRange(9999, 9999);")
end

When /^I click selector "([^"]*)"(?: to load a new (page|tab))?$/ do |jquery_selector, load|
  # normal a href links can only be clicked this way
  page_load(load) do
    @browser.execute_script("$(\"#{jquery_selector}\")[0].click();")
  end
end

When /^I click selector "([^"]*)" if it exists$/ do |jquery_selector|
  if @browser.execute_script("return $(\"#{jquery_selector}\").length > 0")
    @browser.execute_script("$(\"#{jquery_selector}\")[0].click();")
  end
end

When /^I click selector "([^"]*)" once I see it(?: to load a new (page|tab))?$/ do |selector, load|
  wait_for_jquery
  wait_until do
    @browser.execute_script(jquery_is_element_visible(selector))
  end
  page_load(load) do
    @browser.execute_script("$(\"#{selector}\")[0].click();")
  end
end

When /^I click selector "([^"]*)" if I see it$/ do |selector|
  wait_until(5) do
    @browser.execute_script("return $(\"#{selector}:visible\").length != 0;")
  end
  @browser.execute_script("$(\"#{selector}:visible\")[0].click();")
rescue Selenium::WebDriver::Error::TimeoutError
  # Element never appeared, ignore it
end

When /^I focus selector "([^"]*)"$/ do |jquery_selector|
  @browser.execute_script("$(\"#{jquery_selector}\")[0].focus();")
end

When /^I blur selector "([^"]*)"$/ do |jquery_selector|
  @browser.execute_script("$(\"#{jquery_selector}\")[0].blur();")
end

When /^I send click events to selector "([^"]*)"$/ do |jquery_selector|
  # svg elements can only be clicked this way
  @browser.execute_script("$(\"#{jquery_selector}\").click();")
end

When /^I complete the CAPTCHA$/ do
  @browser.execute_script("$('#g-recaptcha-response').val('test-captcha-response');")
end

When /^I press delete$/ do
  script = "Blockly.mainBlockSpaceEditor.onKeyDown_("
  script += "{"
  script += "  target: {},"
  script += "  preventDefault: function() {},"
  script += "  keyCode: $.simulate.keyCode['DELETE']"
  script += "})"
  @browser.execute_script(script)
end

When /^I hold key "([^"]*)"$/ do |key_code|
  script = "$(window).simulate('keydown',  {keyCode: $.simulate.keyCode['#{key_code}']})"
  @browser.execute_script(script)
end

When /^I type "([^"]*)" into "([^"]*)"$/ do |input_text, selector|
  type_into_selector("\"#{input_text}\"", selector)
end

When /^I type '([^']*)' into "([^"]*)"$/ do |input_text, selector|
  type_into_selector("'#{input_text}'", selector)
end

When /^I type "([^"]*)" into "([^"]*)" if I see it$/ do |input_text, selector|
  type_into_selector("\"#{input_text}\"", selector)

  wait_until(5) do
    @browser.execute_script("return $(\"#{selector}:visible\").length != 0;")
  end
  type_into_selector("\"#{input_text}\"", selector)
rescue Selenium::WebDriver::Error::TimeoutError
  # Element never appeared, ignore it
end

# The selector should be wrapped in appropriate quotes when passed into here.
def type_into_selector(input_text, selector)
  wait_for_jquery
  @browser.execute_script("$('#{selector}').val(#{input_text})")
  @browser.execute_script("$('#{selector}').keyup()")
  @browser.execute_script("$('#{selector}').change()")
end

When /^I set text compression dictionary to "([^"]*)"$/ do |input_text|
  @browser.execute_script("editor.setValue('#{input_text}')")
end

Then /^I should see title "([^"]*)"$/ do |title|
  expect(@browser.title).to eq(title)
end

Then /^I should see title includes "([^"]*)"$/ do |title|
  expect(@browser.title).to include(title)
end

Then /^evaluate JavaScript expression "([^"]*)"$/ do |expression|
  expect(@browser.execute_script("return #{expression}")).to eq(true)
end

Then /^execute JavaScript expression "([^"]*)"( to load a new page)?$/ do |expression, load|
  page_load(load) do
    @browser.execute_script("return #{expression}")
  end
end

Then /^I navigate to the course page for "([^"]*)"$/ do |course|
  steps %{
    Then I am on "http://studio.code.org/s/#{course}"
    And I wait to see ".user-stats-block"
  }
end

# The second regex matches strings in which all double quotes and backslashes
# are quoted (preceded by a backslash).
Then /^element "([^"]*)" has text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  element_has_text(selector, expected_text)
end

Then /^element "([^"]*)" has css property "([^"]*)" equal to "([^"]*)"$/ do |selector, property, expected_value|
  element_has_css(selector, property, expected_value)
end

# Example use case: checking webkit and moz overrides for css properties
Then /^element "([^"]*)" has one of css properties "([^"]*)" equal to "([^"]*)"$/ do |selectors, properties, expected_value|
  properties = properties.split(',')
  element_has_css_multiple_properties(selectors, properties, expected_value)
end

Then /^I wait up to ([\d\.]+) seconds for element "([^"]*)" to have css property "([^"]*)" equal to "([^"]*)"$/ do |seconds, selector, property, expected_value|
  Selenium::WebDriver::Wait.new(timeout: seconds.to_f).until do
    element_css_value(selector, property) == expected_value
  end
end

Then /^elements "([^"]*)" have css property "([^"]*)" equal to "([^"]*)"$/ do |selector, property, expected_values|
  elements_have_css(selector, property, expected_values)
end

Then /^I set selector "([^"]*)" text to "([^"]*)"$/ do |selector, text|
  @browser.execute_script("$(\"#{selector}\").text(\"#{text}\");")
end

Then /^element "([^"]*)" has escaped text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  # Add more unescaping rules here as needed.
  expected_text.gsub!(/\\n/, "\n")
  element_has_text(selector, expected_text)
end

Then /^element "([^"]*)" has html "([^"]*)"$/ do |selector, expected_html|
  element_has_html(selector, expected_html)
end

Then /^I wait to see a dialog titled "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    Then I wait to see a ".dialog-title"
    And element ".dialog-title" has text "#{expected_text}"
  }
end

Then /^I wait to see a dialog containing text "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    Then I wait to see a ".modal-body"
    And element ".modal-body" contains text "#{expected_text}"
  }
end

Then /^I wait to see a modal containing text "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    Then I wait to see a ".modal"
    And element ".modal" contains text "#{expected_text}"
  }
end

Then /^I wait to see a congrats dialog with title containing "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    Then I wait to see a ".congrats"
    And element ".congrats" contains text "#{expected_text}"
  }
end

Then /^I reopen the congrats dialog unless I see the sharing input/ do
  next if @browser.execute_script("return $('#sharing-dialog-copy-button').length > 0;")
  puts "reopening congrats dialog"
  individual_steps %{
    And I press "again-button"
    And I wait until element ".congrats" is not visible
    And I press "resetButton"
    And I press "runButton"
    And I click selector "#finishButton" if I see it
    And I click selector "#rightButton" if I see it
    Then I wait to see a ".congrats"
    Then element ".congrats" contains text "Congratulations"
  }
end

# pixelation and other dashboard levels pull a bunch of hidden dialog elements
# into the dom, so we have to check for the dialog more carefully.
Then /^I wait to see a visible dialog with title containing "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    And I wait to see ".modal-body"
    And element ".modal-body .dialog-title" is visible
    And element ".modal-body .dialog-title" contains text "#{expected_text}"
  }
end

Then /^element "([^"]*)" has "([^"]*)" text from key "((?:[^"\\]|\\.)*)"$/ do |selector, language, loc_key|
  element_has_i18n_text(selector, language, loc_key)
end

Then /^element "([^"]*)" has "([^"]*)" markdown from key "((?:[^"\\]|\\.)*)"$/ do |selector, language, loc_key|
  element_has_i18n_markdown(selector, language, loc_key)
end

Then /^element "([^"]*)" contains text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  element_contains_text(selector, expected_text)
end

Then /^element "([^"]*)" does not contain text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  expect(element_contains_text?(selector, expected_text)).to be false
end

Then /^element "([^"]*)" eventually contains text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  wait_until {element_contains_text?(selector, expected_text)}
end

Then /^element "([^"]*)" has value "([^"]*)"$/ do |selector, expected_value|
  element_value_is(selector, expected_value)
end

Then /^element "([^"]*)" has escaped value "([^"]*)"$/ do |selector, expected_value|
  element_value_is(selector, YAML.safe_load(%Q(---\n"#{expected_value}"\n)))
end

Then /^element "([^"]*)" has escaped value '([^']*)'$/ do |selector, expected_value|
  element_value_is(selector, YAML.safe_load(%Q(---\n"#{expected_value.gsub('"', '\"')}"\n)))
end

Then /^element "([^"]*)" is (not )?checked$/ do |selector, negation|
  value = @browser.execute_script("return $(\"#{selector}\").is(':checked');")
  expect(value).to eq(negation.nil?)
end

Then /^I use jquery to set the text of "([^"]*)" to "([^"]*)"$/ do |selector, value|
  @browser.execute_script("$(\"#{selector}\").text(\"#{value}\");")
end

Then /^element "([^"]*)" has attribute "((?:[^"\\]|\\.)*)" equal to "((?:[^"\\]|\\.)*)"$/ do |selector, attribute, expected_text|
  element_has_attribute(selector, attribute, replace_hostname(expected_text))
end

Then /^element "([^"]*)" is (not )?categorized by OneTrust$/ do |selector, negation|
  wait_for_jquery
  elements = @browser.execute_script("return $(\"#{selector}\").map((index, elem) => { return {src:elem.src, class:elem.className}}).get()")
  # The element needs to exist if we want to verify it is categorized.
  if negation.nil?
    expect(elements).to satisfy('have at least one element should be found', &:any?)
  end
  # Check each element which matches the selector to see if it has the
  # expected OneTrust categorization.
  elements.each do |element|
    # When OneTrust categorizes an element, it adds the class
    # "optanon-category-..." to it, for example "optanon-category-C0002"
    element_class = element['class'] || ''
    has_category = element_class.include?('optanon-category-')
    desc = "#{negation ? 'not ' : ''}have a category"
    expect(element).to satisfy(desc) {|_| has_category == !negation}
  end
end

Then /^element "([^"]*)" is (not )?read-?only$/ do |selector, negation|
  readonly = @browser.execute_script("return $(\"#{selector}\").attr(\"readonly\");")
  if negation.nil?
    expect(readonly).to eq('readonly')
  else
    expect(readonly.nil?).to eq(true)
  end
end

# The second regex encodes that ids should not contain spaces or quotes.
# While this is stricter than HTML5, it is looser than HTML4.
Then /^element "([^"]*)" has id "([^ "']+)"$/ do |selector, id|
  element_has_id(selector, id)
end

def jquery_element_exists(selector)
  wait_for_jquery
  "return $(#{selector.dump}).length > 0"
end

def element_exists?(selector)
  @browser.execute_script(jquery_element_exists(selector))
end

def element_visible?(selector)
  @browser.execute_script(jquery_is_element_visible(selector))
end

def element_displayed?(selector)
  @browser.execute_script(jquery_is_element_displayed(selector))
end

def element_open?(selector)
  @browser.execute_script(jquery_is_element_open(selector))
end

Then /^element "([^"]*)" is (not )?visible$/ do |selector, negation|
  expect(element_visible?(selector)).to eq(negation.nil?)
end

Then /^element "([^"]*)" does exist/ do |selector|
  expect(element_exists?(selector)).to eq(true)
end

Then /^element "([^"]*)" does not exist/ do |selector|
  expect(element_exists?(selector)).to eq(false)
end

Then /^element "([^"]*)" is hidden$/ do |selector|
  expect(element_visible?(selector)).to eq(false)
end

Then /^element "([^"]*)" is (not )?open$/ do |selector, negation|
  expect(element_open?(selector)).to eq(negation.nil?)
end

Then /^element "([^"]*)" is (not )?displayed$/ do |selector, negation|
  expect(element_displayed?(selector)).to eq(negation.nil?)
end

And(/^I select age (\d+) in the age dialog/) do |age|
  dropdown_selection = age
  if age == 21
    dropdown_selection = "21+"
  end
  steps <<~GHERKIN
    And element ".age-dialog" is visible
    And I select the "#{dropdown_selection}" option in dropdown "uitest-age-selector"
    And I click selector "#uitest-submit-age"
  GHERKIN
end

And(/^I do not see "([^"]*)" option in the dropdown "([^"]*)"/) do |option, selector|
  select_options_text = @browser.execute_script("return $('#{selector} option').val()")
  expect((select_options_text.include? option)).to eq(false)
end

And(/^I see option "([^"]*)" or "([^"]*)" in the dropdown "([^"]*)"/) do |option_alpha, option_beta, selector|
  select_options_text = @browser.execute_script("return $('#{selector} option').text()")
  expect((select_options_text.include? option_alpha) || (select_options_text.include? option_beta)).to eq(true)
end

def has_class?(selector, class_name)
  @browser.execute_script("return $(#{selector.dump}).hasClass('#{class_name}')")
end

Then /^element "([^"]*)" has class "([^"]*)"$/ do |selector, class_name|
  expect(has_class?(selector, class_name)).to eq(true)
end

Then /^element "([^"]*)" (?:does not|doesn't) have class "([^"]*)"$/ do |selector, class_name|
  expect(has_class?(selector, class_name)).to eq(false)
end

Then /^SVG element "([^"]*)" within element "([^"]*)" has class "([^"]*)"$/ do |selector, parent_selector, class_name|
  # Can't use jQuery hasClass here, due to limited SVG support
  class_list = @browser.execute_script("return $(\"#{selector}\", $(\"#{parent_selector}\").contents())[0].getAttribute(\"class\")")
  expect(class_list).to include(class_name)
end

def disabled?(selector)
  @browser.execute_script("return $('#{selector}')[0].getAttribute('disabled') !== null || $('#{selector}').hasClass('disabled')")
end

Then /^element "([^"]*)" is (?:enabled|not disabled)$/ do |selector|
  expect(disabled?(selector)).to eq(false)
end

Then /^I wait until "([^"]*)" is (not )?disabled$/ do |selector, negation|
  wait_short_until do
    disabled?(selector) == negation.nil?
  end
end

Then /^element "([^"]*)" is disabled$/ do |selector|
  expect(disabled?(selector)).to eq(true)
end

And /^output url$/ do
  puts @browser.current_url
end

Then /^I drag "([^"]*)" to "([^"]*)"$/ do |source_selector, destination_selector|
  @browser.execute_script(generate_generic_drag_code(source_selector, destination_selector, 0, 0))
end

Then /^there's an image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('img[src*=\"#{path}\"]').length != 0;")
  expect(exists).to eq(true)
end

Then /^I print the HTML contents of element "([^"]*)"$/ do |element_to_print|
  puts @browser.execute_script("return $('##{element_to_print}').html()")
end

Then /^I wait to see an image "([^"]*)"$/ do |path|
  wait_for_jquery
  wait_until {@browser.execute_script("return $('img[src*=\"#{path}\"]').length != 0;")}
end

Then /^I click an image "([^"]*)"$/ do |path|
  @browser.execute_script("$('img[src*=\"#{path}\"]').click();")
end

Then /^I wait for image "([^"]*)" to load$/ do |selector|
  wait = Selenium::WebDriver::Wait.new(timeout: DEFAULT_WAIT_TIMEOUT)
  wait.until {@browser.execute_script("return $('#{selector}').prop('complete');")}
end

Then /^I wait for the video thumbnails to load$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: DEFAULT_WAIT_TIMEOUT)
  wait.until {@browser.execute_script("return Array.from(document.querySelectorAll('img.thumbnail-image')).filter((img) => !img.complete).length == 0;")}
end

Then /^I see jquery selector (.*)$/ do |selector|
  exists = @browser.execute_script("return $(\"#{selector}\").length != 0;")
  expect(exists).to eq(true)
end

Then /^I see (\d*) of jquery selector (.*)$/ do |num, selector|
  expect(@browser.execute_script("return $(\"#{selector}\").length;")).to eq(num.to_i)
end

Then /^I wait until I (don't )?see selector "(.*)"$/ do |negation, selector|
  wait_until do
    @browser.execute_script("return $(\"#{selector}:visible\").length != 0;") == negation.nil?
  end
end

Then /^there's a div with a background image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('div').filter(function(){return $(this).css('background-image').indexOf('#{path}') != -1 }).length > 0")
  expect(exists).to eq(true)
end

Then /^there's an SVG image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('image').filter('[xlink\\\\:href*=\"#{path}\"]').length != 0")
  expect(exists).to eq(true)
end

Then /^there's not an SVG image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('image').filter('[xlink\\\\:href*=\"#{path}\"]').length != 0")
  expect(exists).to eq(false)
end

Then(/^"([^"]*)" should be in front of "([^"]*)"$/) do |selector_front, selector_behind|
  front_z_index = @browser.execute_script("return $('#{selector_front}').css('z-index')").to_i
  behind_z_index = @browser.execute_script("return $('#{selector_behind}').css('z-index')").to_i
  expect(front_z_index).to be > behind_z_index
end

Then(/^I set slider speed to medium/) do
  @browser.execute_script("__TestInterface.setSpeedSliderValue(0.8)")
end

Then(/^I set slider speed to fast/) do
  @browser.execute_script("__TestInterface.setSpeedSliderValue(1)")
end

Then(/^I slow down execution speed$/) do
  @browser.execute_script("Maze.shouldSpeedUpInfiniteLoops = false;")
  @browser.execute_script("Maze.scale.stepSpeed = 10;")
end

Then(/^I reload the page$/) do
  page_load(true) do
    @browser.navigate.refresh
  end
  wait_for_jquery
end

def wait_for_jquery
  wait_until do
    @browser.execute_script("return (typeof jQuery !== 'undefined');")
  rescue Selenium::WebDriver::Error::ScriptTimeoutError
    puts "execute_script timed out after 30 seconds, likely because this is \
Safari and the browser was still on about:blank when wait_for_jquery \
was called. Ignoring this error and continuing to wait..."
    false
  end
end

Then /^I wait for jquery to load$/ do
  wait_for_jquery
end

Then /^element "([^"]*)" is a child of element "([^"]*)"$/ do |child_id, parent_id|
  wait_short_until do
    @child_item = @browser.find_element(:id, child_id)
  end
  actual_parent_item = @child_item.find_element(:xpath, "..")
  actual_parent_id = actual_parent_item.attribute('id')
  expect(actual_parent_id).to eq(parent_id)
end

def set_cookie(key, value)
  params = {
    name: key,
    value: value,
  }

  if ENV.fetch('DASHBOARD_TEST_DOMAIN', nil) && ENV.fetch('DASHBOARD_TEST_DOMAIN', nil) =~ /\.code.org/ &&
      ENV.fetch('PEGASUS_TEST_DOMAIN', nil) && ENV.fetch('PEGASUS_TEST_DOMAIN', nil) =~ /\.code.org/
    params[:domain] = '.code.org' # top level domain cookie
  end

  @browser.manage.add_cookie params
end

Given(/^I use a cookie to mock the DCDO key "([^"]*)" as "(.*)"$/) do |key, json|
  mock_dcdo(key, JSON.parse(json))
rescue JSON::ParserError
  mock_dcdo(key, json)
end

And(/^I set the language cookie$/) do
  set_cookie '_language', 'en'
end

And(/^I set the pagemode cookie to "([^"]*)"$/) do |cookie_value|
  set_cookie 'pm', cookie_value
end

And(/^I set the cookie named "([^"]*)" to "([^"]*)"$/) do |key, value|
  set_cookie key, value
end

Given(/^I am enrolled in a plc course$/) do
  browser_request(url: '/api/test/enroll_in_plc_course', method: 'POST')
end

Given(/^I am assigned to unit "([^"]*)"$/) do |script_name|
  browser_request(
    url: '/api/test/assign_script_as_student',
    method: 'POST',
    body: {script_name: script_name}
  )
end

Given(/^I am assigned to course "([^"]*)" and unit "([^"]*)"$/) do |course_name, script_name|
  browser_request(
    url: '/api/test/assign_course_and_unit_as_student',
    method: 'POST',
    body: {script_name: script_name, course_name: course_name}
  )
end

Then(/^I fake completion of the assessment$/) do
  browser_request(url: '/api/test/fake_completion_assessment', method: 'POST', code: 204)
end

And /^I check the pegasus URL$/ do
  pegasus_url = @browser.execute_script('return window.dashboard.CODE_ORG_URL')
  puts "Pegasus URL is #{pegasus_url}"
end

Then /^the overview page contains ([\d]+) assign (?:button|buttons)$/ do |expected_num|
  actual_num = @browser.execute_script("return $('.uitest-assign-button').length;")
  expect(actual_num).to eq(expected_num.to_i)
end

And /^I dismiss the language selector$/ do
  steps <<~GHERKIN
    And I click selector ".close" if I see it
    And I wait until I don't see selector ".close"
  GHERKIN
end

And /^I dismiss the login reminder$/ do
  steps <<~GHERKIN
    And I click selector ".modal-backdrop" if I see it
    And I wait until I don't see selector ".uitest-login-callout"
  GHERKIN
end

And /^I dismiss the teacher panel$/ do
  steps <<~GHERKIN
    And I click selector ".teacher-panel > .hide-handle > .fa-chevron-right"
    And I wait until I see selector ".teacher-panel > .show-handle > .fa-chevron-left"
  GHERKIN
end

And /^I dismiss the hoc guide dialog$/ do
  steps <<~GHERKIN
    And I click selector "#uitest-no-email-guide" if I see it
    And I wait until I don't see selector "#uitest-no-email-guide"
  GHERKIN
end

# Call `execute_async_script` on the provided `js` code.
# Provides a workaround for Appium (mobile) which doesn't support execute_async_script on HTTPS.
# For Appium, wrap `execute_script` with a polling wait on a window variable that records the result.
def js_async(js, *args, callback_fn: 'callback', finished_var: 'window.asyncCallbackFinished')
  supports_async = !@browser.capabilities['mobile']
  if supports_async
    js = "var #{callback_fn} = arguments[arguments.length - 1];\n#{js}"
    @browser.execute_async_script(js, *args)
  else
    js = <<~JS
      #{finished_var} = undefined;
      var #{callback_fn} = function(result) { #{finished_var} = result; };
      #{js}
    JS
    @browser.execute_script(js, *args)
    wait_short_until {@browser.execute_script("return #{finished_var};")}
  end
end

# Send an asynchronous XmlHttpRequest from the browser.
def browser_request(url:, method: 'GET', headers: {}, body: nil, code: 200, tries: 3)
  if body
    headers['Content-Type'] = 'application/json'
    body = "'#{body.to_json}'"
  end

  js = <<~JS
    var xhr = new XMLHttpRequest();
    xhr.open('#{method}', '#{url}', true);
    #{headers.map {|k, v| "xhr.setRequestHeader('#{k}', '#{v}');"}.join("\n")}
    var csrf = document.head.querySelector("meta[name='csrf-token']")
    if (csrf) {
      xhr.setRequestHeader('X-Csrf-Token', csrf.content)
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        callback(JSON.stringify({
          status: xhr.status,
          response: xhr.responseText
        }));
      }
    };
    xhr.send(#{body});
  JS
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, tries: tries) do
    result = js_async(js)
    status, response = JSON.parse(result).slice('status', 'response').values
    expect(status).to eq(code), "Error code #{status}:\n#{response}"
    response
  end
end

And(/^I submit this level$/) do
  steps <<~GHERKIN
    And I press "runButton"
    And I wait to see "#submitButton"
    And I press "submitButton"
    And I wait to see ".modal"
    And I press "confirm-button" to load a new page
  GHERKIN
end

And(/^I wait until I am on the join page$/) do
  wait_short_until {/^\/join/.match(@browser.execute_script("return location.pathname"))}
end

And(/^I delete the cookie named "([^"]*)"$/) do |cookie_name|
  if @browser.manage.all_cookies.any? {|cookie| cookie[:name] == cookie_name}
    @browser.manage.delete_cookie cookie_name
  end
end

And(/^I clear session storage/) do
  @browser.execute_script("sessionStorage.clear(); localStorage.clear();")
end

When(/^I debug cookies$/) do
  puts "DEBUG: url=#{CGI.escapeHTML @browser.current_url.inspect}"
  debug_cookies(@browser.manage.all_cookies)
end

When(/^I debug element "([^"]*)" text content$/) do |selector|
  text = @browser.execute_script("return $('#{selector}').text()")
  puts "element #{selector} text content: '#{text.to_s.strip}'"
end

When(/^I debug focus$/) do
  puts "Focused element id: #{@browser.execute_script('return document.activeElement.id')}"
end

When /^I debug channel id$/ do
  puts "appOptions.channel: #{@browser.execute_script('return (appOptions && appOptions.channel)')}"
end

And(/^I ctrl-([^"]*)$/) do |key|
  # Note: Safari webdriver does not support actions API
  @browser.action.key_down(:control).send_keys(key).key_up(:control).perform
end

def press_keys(element, key)
  element.send_keys(*convert_keys(key))
end

def convert_keys(keys)
  return keys[1..].to_sym if keys.start_with?(':')
  keys.gsub!(/([^\\])\\n/, "\\1\n") # Cucumber does not convert captured \n to newline.
  keys.gsub!(/\\\\n/, "\\n") # Fix up escaped newline
  # Convert newlines to :enter keys.
  keys.chars.map {|k| k == "\n" ? :enter : k}
end

And(/^I press keys "([^"]*)" for element "([^"]*)"$/) do |key, selector|
  element = @browser.find_element(:css, selector)
  press_keys(element, key)
end

And(/^I wait until element "([^"]*)" has the value "([^"]*)"$/) do |selector, value|
  element = @browser.find_element(:css, selector)
  wait_short_until do
    element_text = element.attribute("value")
    element_text.include? value
  end
end

When /^I press keys "([^"]*)"$/ do |keys|
  @browser.action.send_keys(*convert_keys(keys)).perform
end

When /^I clear the text from element "([^"]*)"$/ do |selector|
  element = @browser.find_element(:css, selector)
  element.clear
end

# Press backspace repeatedly to clear an element.  Handy for React.
When /^I press backspace to clear element "([^"]*)"$/ do |selector|
  element = @browser.find_element(:css, selector)
  press_keys(element, ":backspace") while @browser.execute_script("return $('#{selector}').val()") != ""
end

When /^I press enter key$/ do
  @browser.action.send_keys(:return).perform
end

When /^I press double-quote key$/ do
  @browser.action.send_keys('"').perform
end

When /^I press double-quote key for element "([^"]*)"$/ do |selector|
  press_keys(@browser.find_element(:css, selector), '"')
end

When /^I disable onBeforeUnload$/ do
  @browser.execute_script("window.__TestInterface.ignoreOnBeforeUnload = true;")
end

Then /^I get redirected away from "([^"]*)"$/ do |old_path|
  wait_short_until {!/#{old_path}/.match(@browser.execute_script("return location.pathname"))}
end

Then /^I get redirected away from the current page$/ do
  old_path = @browser.execute_script("return location.pathname")
  wait_short_until {!/#{old_path}/.match(@browser.execute_script("return location.pathname"))}
end

Then /^my query params match "(.*)"$/ do |matcher|
  wait_short_until {/#{matcher}/.match(@browser.execute_script("return location.search;"))}
end

Then /^I wait to see element with ID "(.*)"$/ do |element_id_to_seek|
  wait_short_until {@browser.find_element(id: element_id_to_seek)}
end

Then /^I get redirected to "(.*)" via "(.*)"$/ do |new_path, redirect_source|
  wait_short_until {/#{new_path}/.match(@browser.execute_script("return location.pathname"))}

  if redirect_source == 'pushState'
    state = {"modified" => true}
  elsif ['dashboard', 'none'].include? redirect_source
    state = nil
  end
  expect(@browser.execute_script("return window.history.state")).to eq(state)
end

Then /^I copy the embed code into a new document$/ do
  # Copy the embed code from the share dialog, which contains an iframe whose
  # source is a link to the embed version of this project. Wait for the iframe
  # to load, so that we can safely switch to it after this step completes.
  @browser.execute_script(
    %{
      document.body.innerHTML = $('#project-share textarea').text();
      $('iframe').load(function() {window.iframeLoadedForTesting = true;});
    }
  )
  wait_short_until {@browser.execute_script("return window.iframeLoadedForTesting;")}
end

Then /^I append "([^"]*)" to the URL$/ do |append|
  url = @browser.current_url + append
  @browser.navigate.to url
end

Then /^selector "([^"]*)" has class "(.*?)"$/ do |selector, class_name|
  item = @browser.find_element(:css, selector)
  classes = item.attribute("class")
  expect(classes.include?(class_name)).to eq(true)
end

Then /^selector "([^"]*)" doesn't have class "(.*?)"$/ do |selector, class_name|
  item = @browser.find_element(:css, selector)
  classes = item.attribute("class")
  expect(classes.include?(class_name)).to eq(false)
end

Then /^there is no horizontal scrollbar$/ do
  expect(@browser.execute_script('return document.documentElement.scrollWidth <= document.documentElement.clientWidth')).to eq(true)
end

# Place files in dashboard/test/fixtures
# Note: Safari webdriver does not support file uploads (https://code.google.com/p/selenium/issues/detail?id=4220)
Then /^I upload the file named "(.*?)"$/ do |filename|
  unless ENV['TEST_LOCAL'] == 'true'
    # Needed for remote (Sauce Labs) uploads
    @browser.file_detector = lambda do |args|
      str = args.first.to_s
      str if File.exist? str
    end
  end

  filename = File.expand_path(filename, '../fixtures')
  @browser.execute_script('$("input[type=file]").show()')
  element = @browser.find_element :css, '.uitest-hidden-uploader'
  element.send_keys filename
  @browser.execute_script('$("input[type=file]").hide()')

  unless ENV['TEST_LOCAL'] == 'true'
    @browser.file_detector = nil
  end
end

def refute_bad_gateway_or_site_unreachable
  first_header_text = @browser.execute_script("var el = document.getElementsByTagName('h1')[0]; return el && el.textContent;")
  expect(first_header_text).not_to end_with('Bad Gateway')
  # This error message is specific to Chrome
  expect(first_header_text).not_to eq('This site can’t be reached')
end

Then /^I wait until the image within element "([^"]*)" has loaded$/ do |selector|
  image_status_selector = "#{selector} div[data-image-status=loaded]"
  wait_until do
    @browser.execute_script("return $(#{image_status_selector.dump}).length > 0;")
  end
end

Then /^I save the timestamp from "([^"]*)"$/ do |css|
  @timestamp = @browser.find_element(css: css)['timestamp']
end

Then /^"([^"]*)" contains the saved timestamp$/ do |css|
  timestamp = @browser.find_element(css: css)['timestamp']
  expect(@timestamp).to eq(timestamp)
end

Then /^I save the text from "([^"]*)"$/ do |css|
  @saved_text = @browser.find_element(css: css).text
end

Then /^"([^"]*)" contains the saved text$/ do |css|
  saved_text = @browser.find_element(css: css).text
  expect(@saved_text).to eq(saved_text)
end

When /^I switch to text mode$/ do
  steps <<-GHERKIN
    When I press "show-code-header"
    And I wait to see Droplet text mode
  GHERKIN
end

When /^I wait for the dialog to close$/ do
  steps 'When I wait until element ".modal" is gone'
end

When /^I wait for the dialog to close using jQuery$/ do
  steps 'When I wait until element ".modal" is not visible'
end

Then /^the href of selector "([^"]*)" contains "([^"]*)"$/ do |selector, matcher|
  href = @browser.execute_script("return $(\"#{selector}\").attr('href');")
  expect(href).to include(matcher)
end

And /^element "([^"]*)" contains text matching "([^"]*)"$/ do |selector, regex_text|
  contents = @browser.execute_script("return $(#{selector.dump}).text();")
  expect(contents.match(regex_text).nil?).to eq(false)
end

Then /^I scroll the "([^"]*)" element into view$/ do |selector|
  @browser.execute_script("$('#{selector}')[0].scrollIntoView(true)")
end

saved_url = nil
Then /^I save the URL$/ do
  saved_url = @browser.current_url
end

Then /^current URL is different from the last saved URL$/ do
  expect(@browser.current_url).not_to include(saved_url)
end

Then /^I navigate to the saved URL$/ do
  steps "Then I am on \"#{saved_url}\""
end

channel_id = nil
Then /^I save the channel id$/ do
  channel_id = @browser.execute_script('return (appOptions && appOptions.channel)')
end

And /^I type the saved channel id into element "([^"]*)"/ do |selector|
  individual_steps "And I press keys \"#{channel_id}\" for element \"#{selector}\""
end

Then /^page text does (not )?contain "([^"]*)"$/ do |negation, text|
  body_text = @browser.execute_script('return document.body && document.body.textContent;').to_s
  expect(body_text.include?(text)).to eq(negation.nil?)
end

Then /^I click selector "([^"]*)" (\d+(?:\.\d*)?) times?$/ do |selector, times|
  step_list = []
  times.to_i.times do
    step_list.push("Then I click selector \"#{selector}\" once I see it")
    step_list.push("And I wait for 1 seconds")
  end
  steps step_list.join("\n")
end

When /^I set up code review for teacher "([^"]*)" with (\d+(?:\.\d*)?) students in a group$/ do |teacher_name, student_count|
  add_student_step_list = []
  student_count.to_i.times do |i|
    add_student_step_list.push("Given I create a student named \"student_#{i}\"")
    add_student_step_list.push("And I join the section")
  end

  add_students_to_group_step_list = []
  student_count.to_i.times do
    add_students_to_group_step_list.push("And I add the first student to the first code review group")
  end

  steps <<~GHERKIN
    Given I create a teacher named "#{teacher_name}"
    And I give user "#{teacher_name}" authorized teacher permission
    And I create a new student section assigned to "ui-test-csa-family-script"
    And I sign in as "#{teacher_name}" and go home
    And I save the student section url
    And I save the section id from row 0 of the section table
    #{add_student_step_list.join("\n")}
    And I wait to see ".alert-success"
    And I sign out using jquery
    Given I sign in as "#{teacher_name}" and go home
    And I create a new code review group for the section I saved
    #{add_students_to_group_step_list.join("\n")}
    And I click selector ".uitest-base-dialog-confirm"
    And I click selector "#uitest-code-review-groups-toggle"
  GHERKIN
end

When /^I create a student named "([^"]*)" in a CSA section$/ do |student_name|
  steps <<~GHERKIN
    Given I create a teacher named "Dumbledore"
    And I give user "Dumbledore" authorized teacher permission
    And I create a new student section assigned to "ui-test-csa-family-script"
    And I sign in as "Dumbledore" and go home
    And I save the student section url
    And I save the section id from row 0 of the section table
    Given I create a student named "#{student_name}"
    And I join the section
  GHERKIN
end

And(/^I navigate to the pegasus certificate share page$/) do
  query_params = @browser.execute_script("return window.location.search;")
  session_id = query_params.match(/\?i=([^&]+)/)[1]
  url = "http://code.org/certificates/#{session_id}"
  navigate_to replace_hostname(url)
end

And(/^I see custom certificate image with name "([^"]*)" and course "([^"]*)"$/) do |name, course|
  expect(@browser.execute_script("return $('img[src*=\"/certificate_images/\"]').length")).to eq(1)
  src = @browser.execute_script("return $('img[src*=\"/certificate_images/\"]').attr('src')")
  encoded_params = src.match(%r{/certificate_images/(.*)\.jpg})[1]
  params = JSON.parse(Base64.urlsafe_decode64(encoded_params))
  expect(params['name']).to eq(name)
  expect(params['course']).to eq(course)
end

And(/^I validate rubric ai config for all lessons$/) do
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, tries: 3) do
    response = HTTParty.get(replace_hostname("http://studio.code.org/api/test/get_validate_rubric_ai_config"))
    response_code = response.code
    expect(response_code).to eq(200), "Error code #{response_code}:\n#{response.body}"
  end
end
