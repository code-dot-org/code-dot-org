# coding: utf-8
DEFAULT_WAIT_TIMEOUT = 2 * 60 # 2 minutes
SHORT_WAIT_TIMEOUT = 30 # 30 seconds

MODULE_PROGRESS_COLOR_MAP = {not_started: 'rgb(255, 255, 255)', in_progress: 'rgb(239, 205, 28)', completed: 'rgb(14, 190, 14)'}

def wait_until(timeout = DEFAULT_WAIT_TIMEOUT)
  Selenium::WebDriver::Wait.new(timeout: timeout).until do
    begin
      yield
    rescue Selenium::WebDriver::Error::UnknownError, Selenium::WebDriver::Error::StaleElementReferenceError
      false
    end
  end
end

def wait_short_until(&block)
  wait_until(SHORT_WAIT_TIMEOUT, &block)
end

def element_stale?(element)
  element.enabled?
  false
rescue Selenium::WebDriver::Error::UnknownError, Selenium::WebDriver::Error::StaleElementReferenceError
  true
end

def page_load(wait_until_unload)
  if wait_until_unload
    html = @browser.find_element(tag_name: 'html')
    yield
    wait_until {element_stale?(html)}
  else
    yield
  end
end

def replace_hostname(url)
  if ENV['DASHBOARD_TEST_DOMAIN']
    raise 'Should not use learn.code.org' unless /\/\/learn.code.org\//.match(url).nil?
    url = url.
      gsub(/\/\/studio.code.org\//, "//" + ENV['DASHBOARD_TEST_DOMAIN'] + "/")
  end
  if ENV['PEGASUS_TEST_DOMAIN']
    url = url.gsub(/\/\/code.org\//, "//" + ENV['PEGASUS_TEST_DOMAIN'] + "/")
  end
  if ENV['HOUROFCODE_TEST_DOMAIN']
    url = url.gsub(/\/\/hourofcode.com\//, "//" + ENV['HOUROFCODE_TEST_DOMAIN'] + "/")
  end

  # Convert http to https
  url = url.gsub(/^http:\/\//, 'https://') unless url.start_with? 'http://localhost'
  # Convert x.y.code.org to x-y.code.org
  url.gsub(/(\w+)\.(\w+)\.code\.org/, '\1-\2.code.org')
end

# Get the SCSS color constant for a given status.
def color_for_status(status)
  {
    submitted: 'rgb(118, 101, 160)',    # $level_submitted
    perfect: 'rgb(14, 190, 14)',        # $level_perfect
    passed: 'rgb(159, 212, 159)',       # $level_passed
    attempted: 'rgb(255, 255, 0)',      # $level_attempted
    not_tried: 'rgb(254, 254, 254)',    # $level_not_tried
    review_rejected: 'rgb(204, 0, 0)',  # $level_review_rejected
    review_accepted: 'rgb(11, 142, 11)' # level_review_accepted
  }[status.to_sym]
end

# When an individual step fails in a call to steps, one gets no feedback about
# which step failed. This splits a set of steps into individual steps, and calls
# each separately, so that when one fails we're told which.
def individual_steps(steps)
  steps.split("\n").map(&:strip).each do |separate_step|
    steps separate_step
  end
end

Given /^I am on "([^"]*)"$/ do |url|
  check_window_for_js_errors('before navigation')
  url = replace_hostname(url)
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, sleep: 10, tries: 3) do
    @browser.navigate.to url
    refute_bad_gateway
    refute_site_unreachable
  end
  install_js_error_recorder
end

When /^I wait to see (?:an? )?"([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {id: name} : {class: name}
  wait_until {@browser.find_element(selection_criteria)}
end

When /^I go to the newly opened tab$/ do
  @browser.switch_to.window(@browser.window_handles.last)
end

When /^I close the instructions overlay if it exists$/ do
  steps 'When I click selector "#overlay" if it exists'
end

When /^I wait for the page to fully load$/ do
  steps <<-STEPS
    When I wait to see "#runButton"
    And I close the instructions overlay if it exists
    And I wait to see ".header_user"
  STEPS
end

When /^I close the dialog$/ do
  # Add a wait to closing dialog because it's sometimes animated, now.
  steps <<-STEPS
    When I press "x-close"
    And I wait for 0.75 seconds
  STEPS
end

When /^I close the React alert$/ do
  steps <<-STEPS
    When I click selector ".react-alert button"
  STEPS
end

When /^I wait until "([^"]*)" in localStorage equals "([^"]*)"$/ do |key, value|
  wait_until {@browser.execute_script("return localStorage.getItem('#{key}') === '#{value}';")}
end

When /^I reset the puzzle to the starting version$/ do
  steps <<-STEPS
    Then I click selector "#versions-header"
    And I wait to see a dialog titled "Version History"
    And I see "#showVersionsModal"
    And I wait until element "button:contains(Delete Progress)" is visible
    And I close the dialog
    And I wait until element "#showVersionsModal" is gone
    And I wait for 3 seconds
    Then I click selector "#versions-header"
    And I wait until element "button:contains(Delete Progress)" is visible
    And I click selector "button:contains(Delete Progress)"
    And I click selector "#confirm-button"
    And I wait until element "#showVersionsModal" is gone
    And I wait for 3 seconds
  STEPS
end

Then /^I see "([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {id: name} : {class: name}
  @browser.find_element(selection_criteria)
end

When /^I wait until (?:element )?"([^"]*)" (?:has|contains) text "([^"]*)"$/ do |selector, text|
  wait_until {@browser.execute_script("return $(#{selector.dump}).text();").include? text}
end

def jquery_is_element_visible(selector)
  "return $(#{selector.dump}).is(':visible') && $(#{selector.dump}).css('visibility') !== 'hidden';"
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

When /^I wait until jQuery Ajax requests are finished$/ do
  wait_short_until {@browser.execute_script("return $.active == 0")}
end

Then /^I make all links open in the current tab$/ do
  @browser.execute_script("$('a[target=_blank]').attr('target', '_parent');")
end

Then /^I make all links in "(.*)" open in the current tab$/ do |parent_selector|
  @browser.execute_script("$('a[target=_blank]', $(#{parent_selector.dump}).contents()).attr('target', '_parent');")
end

Then /^check that I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  expect(@browser.current_url).to eq(url)
end

Then /^I wait until current URL contains "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  wait_until {@browser.current_url.include? url}
end

Then /^I wait until I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  wait_until {@browser.current_url == url}
end

Then /^check that the URL contains "([^"]*)"$/i do |url|
  url = replace_hostname(url)
  expect(@browser.current_url).to include(url)
end

When /^I wait for (\d+(?:\.\d*)?) seconds?$/ do |seconds|
  sleep seconds.to_f
end

When /^I submit$/ do
  @element.submit
end

When /^I rotate to landscape$/ do
  if ENV['BS_ROTATABLE'] == "true"
    @browser.rotate(:landscape)
  end
end

When /^I rotate to portrait$/ do
  if ENV['BS_ROTATABLE'] == "true"
    @browser.rotate(:portrait)
  end
end

When /^I inject simulation$/ do
  #@browser.execute_script('$("body").css( "background-color", "black")')
  @browser.execute_script("var fileref=document.createElement('script');  fileref.setAttribute('type','text/javascript'); fileref.setAttribute('src', '/assets/jquery.simulate.js'); document.getElementsByTagName('head')[0].appendChild(fileref)")
end

When /^I press "([^"]*)"( to load a new page)?$/ do |button, load|
  wait_short_until do
    @button = @browser.find_element(id: button)
  end
  page_load(load) {@button.click}
end

When /^I press the first "([^"]*)" element( to load a new page)?$/ do |selector, load|
  wait_short_until do
    @element = @browser.find_element(:css, selector)
  end
  page_load(load) do
    begin
      @element.click
    rescue
      # Single retry to compensate for element changing between find and click
      @element = @browser.find_element(:css, selector)
      @element.click
    end
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

When /^I press the last button with text "([^"]*)"$/ do |name|
  name_selector = "button:contains(#{name})"
  @browser.execute_script("$('" + name_selector + "').simulate('drag', function(){});")
end

When /^I (?:open|close) the small footer menu$/ do
  menu_selector = 'div.small-footer-base a.more-link'
  steps %{
    Then I wait until element "#{menu_selector}" is visible
    And I click selector "#{menu_selector}"
  }
end

When /^I press menu item "([^"]*)"$/ do |menu_item_text|
  menu_item_selector = "ul#more-menu a:contains(#{menu_item_text})"
  steps %{
    Then I wait until element "#{menu_item_selector}" is visible
    And I click selector "#{menu_item_selector}"
  }
end

When /^I press the settings cog$/ do
  cog_selector = '.settings-cog:visible'
  steps %{
    Then I wait until element "#{cog_selector}" is visible
    And I click selector "#{cog_selector}"
  }
end

When /^I press the settings cog menu item "([^"]*)"$/ do |item_text|
  menu_item_selector = ".settings-cog-menu:visible .pop-up-menu-item:contains(#{item_text})"
  steps %{
    Then I wait until element "#{menu_item_selector}" is visible
    And I click selector "#{menu_item_selector}"
  }
end

When /^I select the "([^"]*)" small footer item$/ do |menu_item_text|
  steps %{
    Then I open the small footer menu
    And I press menu item "#{menu_item_text}"
  }
end

When /^I press the SVG text "([^"]*)"$/ do |name|
  name_selector = "text:contains(#{name})"
  @browser.execute_script("$('" + name_selector + "').simulate('drag', function(){});")
end

When /^I select the "([^"]*)" option in dropdown "([^"]*)"$/ do |option_text, element_id|
  select = Selenium::WebDriver::Support::Select.new(@browser.find_element(:id, element_id))
  select.select_by(:text, option_text)
end

When /^I open the topmost blockly category "([^"]*)"$/ do |name|
  name_selector = ".blocklyTreeLabel:contains(#{name})"
  # seems we usually have two of these item, and want the second if the function
  # editor is open, the first if it isn't
  script = "var val = Blockly.functionEditor && Blockly.functionEditor.isOpen() ? 1 : 0; " \
    "$('" + name_selector + "').eq(val).simulate('drag', function(){});"
  @browser.execute_script(script)
end

And(/^I open the blockly category with ID "([^"]*)"$/) do |id|
  # jQuery needs \\s to allow :s and .s in ID selectors
  # Escaping those gives us \\\\ per-character
  category_selector = "#\\\\:#{id}\\\\.label"
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

When /^I click selector "([^"]*)"( to load a new page)?$/ do |jquery_selector, load|
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

When /^I click selector "([^"]*)" once I see it$/ do |selector|
  wait_until do
    @browser.execute_script("return $(\"#{selector}:visible\").length != 0;")
  end
  @browser.execute_script("$(\"#{selector}\")[0].click();")
end

When /^I click selector "([^"]*)" if I see it$/ do |selector|
  begin
    wait_until(5) do
      @browser.execute_script("return $(\"#{selector}:visible\").length != 0;")
    end
    @browser.execute_script("$(\"#{selector}:visible\")[0].click();")
  rescue Selenium::WebDriver::Error::TimeOutError
    # Element never appeared, ignore it
  end
end

When /^I click selector "([^"]*)" within element "([^"]*)"$/ do |jquery_selector, parent_selector|
  # normal a href links can only be clicked this way
  @browser.execute_script("$(\"#{jquery_selector}\", $(\"#{parent_selector}\").contents())[0].click();")
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
  type_into_selector("\'#{input_text}\'", selector)
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

Then /^evaluate JavaScript expression "([^"]*)"$/ do |expression|
  expect(@browser.execute_script("return #{expression}")).to eq(true)
end

Then /^execute JavaScript expression "([^"]*)"$/ do |expression|
  @browser.execute_script("return #{expression}")
end

Then /^mark the current level as completed on the client/ do
  @browser.execute_script 'dashboard.clientState.trackProgress(true, 1, 100, "hourofcode", appOptions.serverLevelId)'
end

Then /^I verify progress in the header of the current page is "([^"]*)" for level (\d+)/ do |test_result, level|
  # Sometimes there's a momentary delay loading progress (which updates the color)
  # so allow a brief wait for the appropriate styling to show up.
  selector = ".header_level_container .react_stage a:nth(#{level.to_i - 1}) :first-child"
  steps %{
    And I wait until element "#{selector}" is in the DOM
    And I wait up to 5 seconds for element "#{selector}" to have css property "background-color" equal to "#{color_for_status(test_result)}"
  }
end

Then /^I open the progress drop down of the current page$/ do
  steps %{
    Then I click selector ".header_popup_link"
    And I wait to see ".user-stats-block"
  }
end

Then /^I verify progress in the drop down of the current page is "([^"]*)" for stage (\d+) level (\d+)/ do |test_result, stage, level|
  selector = "tbody tr:nth(#{stage.to_i - 1}) a:contains(#{level.to_i}) :first-child"
  steps %{
    And I wait until element "#{selector}" is in the DOM
    And element "#{selector}" has css property "background-color" equal to "#{color_for_status(test_result)}"
  }
end

Then /^I verify progress for the selector "([^"]*)" is "([^"]*)"/ do |selector, progress|
  element_has_css(selector, 'background-color', MODULE_PROGRESS_COLOR_MAP[progress.to_sym])
end

Then /^I navigate to the course page for "([^"]*)"$/ do |course|
  steps %{
    Then I am on "http://studio.code.org/s/#{course}"
    And I wait to see ".user-stats-block"
  }
end

Then /^I verify progress for stage (\d+) level (\d+) is "([^"]*)"/ do |stage, level, test_result|
  selector = "tbody tr:nth(#{stage.to_i - 1}) a:contains(#{level.to_i}) :first-child"
  steps %{
    And I wait until element "#{selector}" is visible
    And element "#{selector}" has css property "background-color" equal to "#{color_for_status(test_result)}"
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

Then /^I wait to see a congrats dialog with title containing "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    Then I wait to see a ".congrats"
    And element ".congrats" contains text "#{expected_text}"
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

Then /^element "([^"]*)" contains text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  element_contains_text(selector, expected_text)
end

Then /^element "([^"]*)" eventually contains text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  wait_until(15) {element_contains_text?(selector, expected_text)}
end

Then /^element "([^"]*)" has value "([^"]*)"$/ do |selector, expected_value|
  element_value_is(selector, expected_value)
end

Then /^element "([^"]*)" has escaped value "([^"]*)"$/ do |selector, expected_value|
  element_value_is(selector, YAML.load(%Q(---\n"#{expected_value}"\n)))
end

Then /^element "([^"]*)" has escaped value '([^']*)'$/ do |selector, expected_value|
  element_value_is(selector, YAML.load(%Q(---\n"#{expected_value.gsub('"', '\"')}"\n)))
end

Then /^element "([^"]*)" is (not )?checked$/ do |selector, negation|
  value = @browser.execute_script("return $(\"#{selector}\").is(':checked');")
  expect(value).to eq(negation.nil?)
end

Then /^element "([^"]*)" has attribute "((?:[^"\\]|\\.)*)" equal to "((?:[^"\\]|\\.)*)"$/ do |selector, attribute, expected_text|
  element_has_attribute(selector, attribute, replace_hostname(expected_text))
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
  "return $(#{selector.dump}).length > 0"
end

def element_exists?(selector)
  @browser.execute_script(jquery_element_exists(selector))
end

def element_visible?(selector)
  @browser.execute_script(jquery_is_element_visible(selector))
end

Then /^element "([^"]*)" is (not )?visible$/ do |selector, negation|
  expect(element_visible?(selector)).to eq(negation.nil?)
end

Then /^element "([^"]*)" does not exist/ do |selector|
  expect(element_exists?(selector)).to eq(false)
end

Then /^element "([^"]*)" is hidden$/ do |selector|
  expect(element_visible?(selector)).to eq(false)
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
  wait_until {@browser.execute_script("return $('img[src*=\"#{path}\"]').length != 0;")}
end

Then /^I click an image "([^"]*)"$/ do |path|
  @browser.execute_script("$('img[src*=\"#{path}\"]').click();")
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

Then(/^I slow down execution speed$/) do
  @browser.execute_script("Maze.scale.stepSpeed = 10;")
end

# Note: only works for levels other than the current one
Then(/^check that level (\d+) on this stage is done$/) do |level|
  undone = @browser.execute_script("return $('a[href$=\"level/#{level}\"].other_level').hasClass('level_undone')")
  !undone
end

# Note: only works for levels other than the current one
Then(/^check that level (\d+) on this stage is not done$/) do |level|
  undone = @browser.execute_script("return $('a[href$=\"level/#{level}\"].other_level').hasClass('level_undone')")
  undone
end

Then(/^I reload the page$/) do
  page_load(true) do
    @browser.navigate.refresh
  end
  wait_for_jquery
end

def wait_for_jquery
  wait_until do
    begin
      @browser.execute_script("return (typeof jQuery !== 'undefined');")
    rescue Selenium::WebDriver::Error::ScriptTimeOutError
      puts "execute_script timed out after 30 seconds, likely because this is \
Safari and the browser was still on about:blank when wait_for_jquery \
was called. Ignoring this error and continuing to wait..."
      false
    end
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

And(/^I set the language cookie$/) do
  params = {
    name: "_language",
    value: 'en'
  }

  if ENV['DASHBOARD_TEST_DOMAIN'] && ENV['DASHBOARD_TEST_DOMAIN'] =~ /\.code.org/ &&
      ENV['PEGASUS_TEST_DOMAIN'] && ENV['PEGASUS_TEST_DOMAIN'] =~ /\.code.org/
    params[:domain] = '.code.org' # top level domain cookie
  end

  @browser.manage.add_cookie params

  debug_cookies(@browser.manage.all_cookies)
end

Given(/^I sign in as "([^"]*)"/) do |name|
  steps %Q{
    Given I am on "http://studio.code.org/reset_session"
    Then I am on "http://studio.code.org/"
    And I wait to see "#signin_button"
    Then I click selector "#signin_button"
    And I wait to see ".new_user"
    And I fill in username and password for "#{name}"
    And I click selector "#signin-button"
    And I wait to see ".header_user"
  }
end

Given(/^I am a (student|teacher)$/) do |user_type|
  random_name = "Test#{user_type.capitalize} " + SecureRandom.base64
  steps %Q{
    And I create a #{user_type} named "#{random_name}"
  }
end

def enroll_in_plc_course(user_email)
  require_rails_env
  user = User.find_by_email_or_hashed_email(user_email)
  course = Course.find_by(name: 'All The PLC Things')
  enrollment = Plc::UserCourseEnrollment.create(user: user, plc_course: course.plc_course)
  enrollment.plc_unit_assignments.update_all(status: Plc::EnrollmentUnitAssignment::IN_PROGRESS)
end

Given(/^I am enrolled in a plc course$/) do
  enroll_in_plc_course(@users.first[1][:email])
end

Then(/^I fake completion of the assessment$/) do
  user = User.find_by_email_or_hashed_email(@users.first[1][:email])
  unit_assignment = Plc::EnrollmentUnitAssignment.find_by(user: user)
  unit_assignment.enroll_user_in_unit_with_learning_modules(
    [
      unit_assignment.plc_course_unit.plc_learning_modules.find_by(module_type: Plc::LearningModule::CONTENT_MODULE),
      unit_assignment.plc_course_unit.plc_learning_modules.find_by(module_type: Plc::LearningModule::PRACTICE_MODULE)
    ]
  )
end

def generate_user(name)
  email = "user#{Time.now.to_i}_#{rand(1000)}@testing.xx"
  password = name + "password" # hack
  @users ||= {}
  @users[name] = {
    password: password,
    email: email
  }
  return email, password
end

def generate_teacher_student(name, teacher_authorized)
  email, password = generate_user(name)

  steps %Q{
    Given I create a teacher named "Teacher_#{name}"
  }

  # enroll in a plc course as a way of becoming an authorized teacher
  enroll_in_plc_course(@users["Teacher_#{name}"][:email]) if teacher_authorized

  individual_steps %Q{
    Then I am on "http://code.org/teacher-dashboard#/sections"
    And I wait until element ".jumbotron" is visible
    And I dismiss the language selector
    And I click selector ".btn-white:contains('New section')" once I see it
    Then execute JavaScript expression "$('input').first().val('SectionName').trigger('input')"
    Then execute JavaScript expression "$('select').first().val('2').trigger('change')"
    And I click selector ".btn-primary:contains('Save')" once I see it
    And I click selector "a:contains('Manage Students')" once I see it
    And I save the section url
    Then I sign out
    And I navigate to the section url
    And I wait to see "#user_name"
    And I type "#{name}" into "#user_name"
    And I type "#{email}" into "#user_email"
    And I type "#{password}" into "#user_password"
    And I type "#{password}" into "#user_password_confirmation"
    And I select the "16" option in dropdown "user_age"
    And I click selector "input[type=submit]" once I see it
    And I wait until I am on "http://studio.code.org/courses"
  }
end

And /^I dismiss the language selector$/ do
  steps %Q{
    And I click selector ".close" if I see it
    And I wait until I don't see selector ".close"
  }
end

And(/^I create a teacher-associated student named "([^"]*)"$/) do |name|
  generate_teacher_student(name, false)
end

And(/^I create an authorized teacher-associated student named "([^"]*)"$/) do |name|
  generate_teacher_student(name, true)
end

And(/^I create a student named "([^"]*)"$/) do |name|
  email, password = generate_user(name)

  steps %Q{
    Given I am on "http://studio.code.org/users/sign_up"
    And I wait to see "#user_name"
    And I select the "Student" option in dropdown "user_user_type"
    And I type "#{name}" into "#user_name"
    And I type "#{email}" into "#user_email"
    And I type "#{password}" into "#user_password"
    And I type "#{password}" into "#user_password_confirmation"
    And I select the "16" option in dropdown "user_user_age"
    And I click selector "#signup-button"
    And I wait until I am on "http://studio.code.org/courses"
  }
end

And(/^I create a teacher named "([^"]*)"$/) do |name|
  email, password = generate_user(name)

  steps %Q{
    Given I am on "http://studio.code.org/reset_session"
    Given I am on "http://studio.code.org/users/sign_up?user%5Buser_type%5D=teacher"
    And I wait to see "#user_name"
    And I wait to see "#schooldropdown-block"
    And I type "#{name}" into "#user_name"
    And I type "#{email}" into "#user_email"
    And I type "#{password}" into "#user_password"
    And I type "#{password}" into "#user_password_confirmation"
    And I click selector "#user_terms_of_service_version"
    And I click selector "#signup-button" to load a new page
    And I wait until I am on "http://studio.code.org/home"
  }
end

And(/^I give user "([^"]*)" hidden script access$/) do |name|
  require_rails_env
  user = User.find_by_email_or_hashed_email(@users[name][:email])
  user.permission = UserPermission::HIDDEN_SCRIPT_ACCESS
end

And(/^I save the section url$/) do
  wait_short_until {/\/manage$/.match(@browser.execute_script("return location.hash"))}
  steps %Q{
    And I wait until element ".jumbotron" is visible
  }
  wait_short_until {"" != @browser.execute_script("return $('.jumbotron a').text().trim()")}
  @section_url = @browser.execute_script("return $('.jumbotron a').text().trim()")
end

And(/^I navigate to the section url$/) do
  steps %Q{
    Given I am on "#{@section_url}"
  }
  wait_short_until {/^\/join/.match(@browser.execute_script("return location.pathname"))}
end

# TODO: As of PR#9262, this method is not used. Evaluate its usage or lack
# thereof, removing it if it remains unused.
And(/I display toast "([^"]*)"$/) do |message|
  @browser.execute_script(<<-SCRIPT)
    var div = document.createElement('div');
    div.className = 'ui-test-toast';
    div.textContent = "#{message}";
    div.style.position = 'absolute';
    div.style.top = '50px';
    div.style.right = '50px';
    div.style.padding = '50px';
    div.style.backgroundColor = 'lightyellow';
    div.style.border = 'dashed 3px #eeee00';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '14pt';
    document.body.appendChild(div);
  SCRIPT
end

And(/I fill in username and password for "([^"]*)"$/) do |name|
  steps %Q{
    And I type "#{@users[name][:email]}" into "#user_login"
    And I type "#{@users[name][:password]}" into "#user_password"
  }
end

When(/^I sign out$/) do
  steps %Q{
    And I am on "http://studio.code.org/users/sign_out"
    And I wait until current URL contains "http://code.org/"
  }
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
  if key.start_with?(':')
    element.send_keys(make_symbol_if_colon(key))
  else
    # Workaround for Firefox, see https://code.google.com/p/selenium/issues/detail?id=6822
    key.gsub!(/([^\\])\\n/, "\\1\n") # Cucumber does not convert captured \n to newline.
    key.gsub!(/\\\\n/, "\\n") # Fix up escaped newline
    key.split('').each do |k|
      if k == '('
        element.send_keys :shift, 9
      elsif k == ')'
        element.send_keys :shift, 0
      else
        element.send_keys k
      end
    end
  end
end

And(/^I press keys "([^"]*)" for element "([^"]*)"$/) do |key, selector|
  element = @browser.find_element(:css, selector)
  press_keys(element, key)
end

def make_symbol_if_colon(key)
  # Available symbol keys:
  # https://code.google.com/p/selenium/source/browse/rb/lib/selenium/webdriver/common/keys.rb?name=selenium-2.26.0
  key.start_with?(':') ? key[1..-1].to_sym : key
end

When /^I press keys "([^"]*)"$/ do |keys|
  # Note: Safari webdriver does not support actions API
  @browser.action.send_keys(make_symbol_if_colon(keys)).perform
end

When /^I press enter key$/ do
  @browser.action.send_keys(:return).perform
end

When /^I disable onBeforeUnload$/ do
  @browser.execute_script("window.__TestInterface.ignoreOnBeforeUnload = true;")
end

Then /^I get redirected away from "([^"]*)"$/ do |old_path|
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
  elsif redirect_source == 'dashboard' || redirect_source == 'none'
    state = nil
  end
  expect(@browser.execute_script("return window.history.state")).to eq(state)
end

last_shared_url = nil
Then /^I navigate to the share URL$/ do
  wait_short_until {@button = @browser.find_element(id: 'sharing-input')}
  last_shared_url = @browser.execute_script("return document.getElementById('sharing-input').value")
  @browser.navigate.to last_shared_url
  wait_for_jquery
end

Then /^I navigate to the last shared URL$/ do
  @browser.navigate.to last_shared_url
  wait_for_jquery
end

Then /^I copy the embed code into a new document$/ do
  @browser.execute_script("document.body.innerHTML = $('#project-share textarea').text();")
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
  element = @browser.find_element :css, 'input[type=file]'
  element.send_keys filename
  @browser.execute_script('$("input[type=file]").hide()')

  unless ENV['TEST_LOCAL'] == 'true'
    @browser.file_detector = nil
  end
end

Then /^I scroll our lockable stage into view$/ do
  # use visible pseudo selector as we also have lock icons in (hidden) summary view
  wait_short_until {@browser.execute_script('return $(".fa-lock:visible").length') > 0}
  @browser.execute_script('$(".fa-lock:visible")[0].scrollIntoView(true)')
end

Then /^I open the stage lock dialog$/ do
  wait_short_until {@browser.execute_script("return $('.uitest-locksettings').length") > 0}
  @browser.execute_script("$('.uitest-locksettings').children().first().click()")
end

Then /^I unlock the stage for students$/ do
  # allow editing
  @browser.execute_script("$('.modal-body button').first().click()")
  # save
  @browser.execute_script('$(".modal-body button:contains(Save)").first().click()')
end

Then /^I select the first section$/ do
  steps %{
    And I wait to see ".uitest-sectionselect"
  }
  @browser.execute_script(
    "window.location.search = 'section_id=' + $('.content select').children().eq(1).val();"
  )
end

def refute_bad_gateway
  first_header_text = @browser.execute_script("var el = document.getElementsByTagName('h1')[0]; return el && el.textContent;")
  expect(first_header_text).not_to end_with('Bad Gateway')
end

def refute_site_unreachable
  first_header_text = @browser.execute_script("var el = document.getElementsByTagName('h1')[0]; return el && el.textContent;")
  # This error message is specific to Chrome
  expect(first_header_text).not_to eq('This site can’t be reached')
end

Then /^I wait until the image within element "([^"]*)" has loaded$/ do |selector|
  image_status_selector = "#{selector} div[data-image-status=loaded]"
  wait_until do
    @browser.execute_script("return $(#{image_status_selector.dump}).length > 0;")
  end
end

Then /^I wait until initial thumbnail capture is complete$/ do
  wait_until do
    @browser.execute_script('return dashboard.project.__TestInterface.isInitialCaptureComplete();')
  end
end

Then /^I wait for initial project save to complete$/ do
  wait_until do
    @browser.execute_script('return dashboard.project.__TestInterface.isInitialSaveComplete();')
  end
end

When /^I switch to text mode$/ do
  steps <<-STEPS
    When I press "show-code-header"
    And I wait to see Droplet text mode
  STEPS
end

Then /^the project list contains ([\d]+) (?:entry|entries)$/ do |expected_num|
  actual_num = @browser.execute_script("return $('table.projects td.name').length;")
  expect(actual_num).to eq(expected_num.to_i)
end

Then /^the project at index ([\d]+) is named "([^"]+)"$/ do |index, expected_name|
  actual_name = @browser.execute_script("return $('table.projects td.name').eq(#{index}).text().trim();")
  expect(actual_name).to eq(expected_name)
end
