require File.expand_path('../../../../config/environment.rb', __FILE__)

DEFAULT_WAIT_TIMEOUT = 2.minutes
SHORT_WAIT_TIMEOUT = 30.seconds

def wait_with_timeout(timeout = DEFAULT_WAIT_TIMEOUT)
  Selenium::WebDriver::Wait.new(timeout: timeout)
end

def wait_with_short_timeout
  wait_with_timeout(SHORT_WAIT_TIMEOUT)
end

def replace_hostname(url)
  if ENV['DASHBOARD_TEST_DOMAIN']
    url = url.
      gsub(/\/\/learn.code.org\//, "//" + ENV['DASHBOARD_TEST_DOMAIN'] + "/").
      gsub(/\/\/studio.code.org\//, "//" + ENV['DASHBOARD_TEST_DOMAIN'] + "/")
  end
  if ENV['PEGASUS_TEST_DOMAIN']
    url = url.gsub(/\/\/code.org\//, "//" + ENV['PEGASUS_TEST_DOMAIN'] + "/")
  end
  if ENV['HOUROFCODE_TEST_DOMAIN']
    url = url.gsub(/\/\/hourofcode.com\//, "//" + ENV['HOUROFCODE_TEST_DOMAIN'] + "/")
  end

  # Convert http to https
  url = url.gsub(/^http:\/\//,'https://') unless url.starts_with? 'http://localhost'
  # Convert x.y.code.org to x-y.code.org
  url.gsub(/(\w+)\.(\w+)\.code\.org/,'\1-\2.code.org')
end

Given /^I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  @browser.navigate.to "#{url}"
end

When /^I wait to see (?:an? )?"([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {:id => name} : {:class => name}
  wait_with_timeout.until { @browser.find_element(selection_criteria) }
end

When /^I close the dialog$/ do
  # Add a wait to closing dialog because it's sometimes animated, now.
  steps %q{
    When I press "x-close"
    And I wait for 0.75 seconds
  }
end

When /^I close the React alert$/ do
  steps %q{
    When I click selector ".react-alert button"
  }
end

When /^I wait until "([^"]*)" in localStorage equals "([^"]*)"$/ do |key, value|
  wait_with_timeout.until { @browser.execute_script("return localStorage.getItem('#{key}') === '#{value}';") }
end

When /^I reset the puzzle to the starting version$/ do
  steps %q{
    Then I click selector "#versions-header"
    And I wait to see a dialog titled "Version History"
    And I see "#showVersionsModal"
    And I close the dialog
    And I wait for 3 seconds
    Then I click selector "#versions-header"
    And I wait until element "button:contains(Delete Progress)" is visible
    And I click selector "button:contains(Delete Progress)"
    And I click selector "#confirm-button"
    And I wait until element "#showVersionsModal" is gone
  }
end

Then /^I see "([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {:id => name} : {:class => name}
  @browser.find_element(selection_criteria)
end

When /^I wait until (?:element )?"([^"]*)" (?:has|contains) text "([^"]*)"$/ do |selector, text|
  wait_with_timeout.until { @browser.execute_script("return $(#{selector.dump}).text();").include? text }
end

When /^I wait until element "([^"]*)" is visible$/ do |selector|
  wait_with_timeout.until { @browser.execute_script("return $(#{selector.dump}).is(':visible')") }
end

Then /^I wait until element "([.#])([^"]*)" is gone$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {:id => name} : {:class => name}
  wait_with_timeout.until { @browser.find_elements(selection_criteria).empty? }
end

# Required for inspecting elements within an iframe
When /^I wait until element "([^"]*)" is visible within element "([^"]*)"$/ do |selector, parent_selector|
  wait_with_timeout.until { @browser.execute_script("return $(#{selector.dump}, $(#{parent_selector.dump}).contents()).is(':visible')") }
end

Then /^check that I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  @browser.current_url.should eq url
end

Then /^check that the URL contains "([^"]*)"$/i do |url|
  url = replace_hostname(url)
  @browser.current_url.should include url
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

When /^I press "([^"]*)"$/ do |button|
  wait_with_short_timeout.until {
    @button = @browser.find_element(:id => button)
  }
  @button.click
end

When /^I press the first "([^"]*)" element$/ do |selector|
  wait_with_short_timeout.until {
    @element = @browser.find_element(:css, selector)
  }
  begin
    @element.click
  rescue
    # Single retry to compensate for element changing between find and click
    @element = @browser.find_element(:css, selector)
    @element.click
  end
end

When /^I press the "([^"]*)" button$/ do |button_text|
  wait_with_short_timeout.until {
    @button = @browser.find_element(:css, "input[value='#{button_text}']")
  }
  @button.click
end

When /^I press "([^"]*)" using jQuery$/ do |selector|
  @browser.execute_script("$(#{selector.dump}).click()")
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
  script = "var val = Blockly.functionEditor && Blockly.functionEditor.isOpen() ? 1 : 0; " +
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
  wait_with_timeout.until {
    @button = @browser.find_element(:xpath, xpath)
  }
  @button.click
end

When /^I click selector "([^"]*)"$/ do |jquery_selector|
  # normal a href links can only be clicked this way
  @browser.execute_script("$(\"#{jquery_selector}\")[0].click();")
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
  script +="{"
  script +="  target: {},"
  script +="  preventDefault: function() {},"
  script +="  keyCode: $.simulate.keyCode['DELETE']"
  script +="})"
  @browser.execute_script(script)
end

When /^I hold key "([^"]*)"$/ do |key_code|
  script ="$(window).simulate('keydown',  {keyCode: $.simulate.keyCode['#{key_code}']})"
  @browser.execute_script(script)
end

When /^I type "([^"]*)" into "([^"]*)"$/ do |input_text, selector|
  @browser.execute_script("$('" + selector + "').val('" + input_text + "')")
  @browser.execute_script("$('" + selector + "').keyup()")
  @browser.execute_script("$('" + selector + "').change()")
end

When /^I set text compression dictionary to "([^"]*)"$/ do |input_text|
  @browser.execute_script("editor.setValue('#{input_text}')")
end

Then /^I should see title "([^"]*)"$/ do |title|
  @browser.title.should eq title
end

Then /^evaluate JavaScript expression "([^"]*)"$/ do |expression|
  @browser.execute_script("return #{expression}").should eq true
end

Then /^execute JavaScript expression "([^"]*)"$/ do |expression|
  @browser.execute_script("return #{expression}")
end

Then /^mark the current level as completed on the client/ do
  @browser.execute_script 'dashboard.clientState.trackProgress(true, 1, 100, "hourofcode", appOptions.serverLevelId)'
end

Then /^I verify progress in the header of the current page is "([^"]*)" for level (\d+)/ do |test_result, level|
  steps %{
    And I wait to see ".progress_container"
    And I wait for 10 seconds
    And element ".progress_container a.level_link:nth(#{level.to_i - 1})" has class "#{test_result}"
  }
end

Then /^I navigate to the course page and verify progress for course "([^"]*)" stage (\d+) level (\d+) is "([^"]*)"/ do |course, stage, level, test_result|
  steps %{
    Then I am on "http://studio.code.org/s/#{course}"
    And I wait to see ".user-stats-block"
    And I wait for 10 seconds
    And element ".user-stats-block .games:nth(#{stage.to_i - 1}) a.level_link:nth(#{level.to_i - 1})" has class "#{test_result}"
  }
end

# The second regex matches strings in which all double quotes and backslashes
# are quoted (preceded by a backslash).
Then /^element "([^"]*)" has text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  element_has_text(selector, expected_text)
end

Then /^I set selector "([^"]*)" text to "([^"]*)"$/ do |selector, text|
  @browser.execute_script("$(\"#{selector}\").text(\"#{text}\");")
end

Then /^element "([^"]*)" has escaped text "((?:[^"\\]|\\.)*)"$/ do |selector, expected_text|
  # Add more unescaping rules here as needed.
  expectedText.gsub!(/\\n/, "\n")
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

Then /^element "([^"]*)" has value "([^"]*)"$/ do |selector, expected_value|
  element_value_is(selector, expected_value)
end

Then /^element "([^"]*)" is (not )?checked$/ do |selector, negation|
  value = @browser.execute_script("return $(\"#{selector}\").is(':checked');")
  value.should eq negation.nil?
end

Then /^element "([^"]*)" has attribute "((?:[^"\\]|\\.)*)" equal to "((?:[^"\\]|\\.)*)"$/ do |selector, attribute, expected_text|
  element_has_attribute(selector, attribute, replace_hostname(expected_text))
end

# The second regex encodes that ids should not contain spaces or quotes.
# While this is stricter than HTML5, it is looser than HTML4.
Then /^element "([^"]*)" has id "([^ "']+)"$/ do |selector, id|
  element_has_id(selector, id)
end

Then /^element "([^"]*)" is (not )?visible$/ do |selector, negation|
  visibility = @browser.execute_script("return $(#{selector.dump}).css('visibility')")
  visible = @browser.execute_script("return $(#{selector.dump}).is(':visible')") && (visibility != 'hidden')
  visible.should eq (negation.nil?)
end

Then /^element "([^"]*)" does not exist/ do |selector|
  @browser.execute_script("return $(#{selector.dump}).length").should eq 0
end

Then /^element "([^"]*)" is hidden$/ do |selector|
  visibility = @browser.execute_script("return $(#{selector.dump}).css('visibility')")
  visible = @browser.execute_script("return $(#{selector.dump}).is(':visible')") && (visibility != 'hidden')
  visible.should eq false
end

def has_class?(selector, class_name)
  @browser.execute_script("return $(#{selector.dump}).hasClass('#{class_name}')")
end

Then /^element "([^"]*)" has class "([^"]*)"$/ do |selector, class_name|
  has_class?(selector, class_name).should eq true
end

Then /^element "([^"]*)" (?:does not|doesn't) have class "([^"]*)"$/ do |selector, class_name|
  has_class?(selector, class_name).should eq false
end

Then /^SVG element "([^"]*)" within element "([^"]*)" has class "([^"]*)"$/ do |selector, parent_selector, class_name|
  # Can't use jQuery hasClass here, due to limited SVG support
  class_list = @browser.execute_script("return $(\"#{selector}\", $(\"#{parent_selector}\").contents())[0].getAttribute(\"class\")")
  class_list.should include class_name
end

def disabled?(selector)
  @browser.execute_script("return $('#{selector}')[0].getAttribute('disabled') !== null || $('#{selector}').hasClass('disabled')")
end

Then /^element "([^"]*)" is (?:enabled|not disabled)$/ do |selector|
  disabled?(selector).should eq false
end

Then /^element "([^"]*)" is disabled$/ do |selector|
  disabled?(selector).should eq true
end

And /^output url$/ do
  puts @browser.current_url
end

Then /^I drag "([^"]*)" to "([^"]*)"$/ do |source_selector, destination_selector|
  @browser.execute_script(generate_generic_drag_code(source_selector, destination_selector, 0, 0))
end

Then /^there's an image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('img[src*=\"#{path}\"]').length != 0;")
  exists.should eq true
end

Then /^I print the HTML contents of element "([^"]*)"$/ do |element_to_print|
  puts @browser.execute_script("return $('##{element_to_print}').html()")
end

Then /^I wait to see an image "([^"]*)"$/ do |path|
  wait_with_timeout.until { @browser.execute_script("return $('img[src*=\"#{path}\"]').length != 0;") }
end

Then /^I click an image "([^"]*)"$/ do |path|
  @browser.execute_script("$('img[src*=\"#{path}\"]').click();")
end

Then /^I see jquery selector (.*)$/ do |selector|
  exists = @browser.execute_script("return $(\"#{selector}\").length != 0;")
  exists.should eq true
end

Then /^there's a div with a background image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('div').filter(function(){return $(this).css('background-image').indexOf('#{path}') != -1 }).length > 0")
  exists.should eq true
end

Then /^there's an SVG image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('image').filter('[xlink\\\\:href*=\"#{path}\"]').length != 0")
  exists.should eq true
end

Then /^there's not an SVG image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('image').filter('[xlink\\\\:href*=\"#{path}\"]').length != 0")
  exists.should eq false
end

Then(/^"([^"]*)" should be in front of "([^"]*)"$/) do |selector_front, selector_behind|
  front_z_index = @browser.execute_script("return $('#{selector_front}').css('z-index')").to_i
  behind_z_index = @browser.execute_script("return $('#{selector_behind}').css('z-index')").to_i
  front_z_index.should be > behind_z_index
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
  @browser.navigate.refresh
end

Then /^element "([^"]*)" is a child of element "([^"]*)"$/ do |child, parent|
  wait_with_short_timeout.until {
    @child_item = @browser.find_element(:css, child)
  }
  wait_with_short_timeout.until {
    @parent_item = @browser.find_element(:css, parent)
  }
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  @parent_item.should eq @actual_parent_item
end

And(/^I set the language cookie$/) do
  params = {
    name: "_language",
    value: 'en'
  }

  if ENV['DASHBOARD_TEST_DOMAIN'] && ENV['DASHBOARD_TEST_DOMAIN'] =~ /code.org/ &&
      ENV['PEGASUS_TEST_DOMAIN'] && ENV['PEGASUS_TEST_DOMAIN'] =~ /code.org/
    params[:domain] = '.code.org' # top level domain cookie
  end

  @browser.manage.add_cookie params

  debug_cookies(@browser.manage.all_cookies)
end

def encrypted_cookie(user)
  key_generator = ActiveSupport::KeyGenerator.new(CDO.dashboard_secret_key_base, iterations: 1000)

  encryptor = ActiveSupport::MessageEncryptor.new(
    key_generator.generate_key('encrypted cookie'),
    key_generator.generate_key('signed encrypted cookie')
  )

  cookie = {'warden.user.user.key' => [[user.id], user.authenticatable_salt]}

  encrypted_data = encryptor.encrypt_and_sign(cookie)

  CGI.escape(encrypted_data.to_s)
end

def log_in_as(user)
  params = {
    name: "_learn_session_#{Rails.env}",
    value: encrypted_cookie(user)
  }
  params[:secure] = true if @browser.current_url.start_with? 'https://'

  if ENV['DASHBOARD_TEST_DOMAIN'] && ENV['DASHBOARD_TEST_DOMAIN'] =~ /code.org/ &&
      ENV['PEGASUS_TEST_DOMAIN'] && ENV['PEGASUS_TEST_DOMAIN'] =~ /code.org/
    params[:domain] = '.code.org' # top level domain cookie
  end

  puts "Setting cookie: #{CGI::escapeHTML params.inspect}"

  @browser.manage.delete_all_cookies
  @browser.manage.add_cookie params

  debug_cookies(@browser.manage.all_cookies)
end

Given(/^I sign in as "([^"]*)"/) do |name|
  log_in_as(@users[name])
end

Given(/^I am a (student|teacher)$/) do |user_type|
  random_name = "Test#{user_type.capitalize} " + SecureRandom.base64
  steps %Q{
    And I create a #{user_type} named "#{random_name}"
    And I sign in as "#{random_name}"
  }
end

And(/^I create a (student|teacher) named "([^"]*)"$/) do |user_type, name|
  @users ||= {}
  @users[name] = User.find_or_create_by!(email: "user#{Time.now.to_i}_#{rand(1000)}@testing.xx") do |user|
    user.name = name
    user.password = name + "password" # hack
    user.user_type = user_type
    user.age = user_type == 'student' ? 16 : 21
    user.confirmed_at = Time.now
  end
end

And(/I fill in username and password for "([^"]*)"$/) do |name|
  steps %Q{
    And I type "#{@users[name].email}" into "#user_login"
    And I type "#{name}password" into "#user_password"
  }
end

Given(/^I sign in as a (student|teacher)$/) do |user_type|
  steps %Q{
    Given I am on "http://learn.code.org/"
    And I am a #{user_type}
    And I am on "http://learn.code.org/users/sign_in"
  }
end

# Signs in as name by filling in username/password fields. If name does not
# already exist, creates a new student account for name in the db first.
Given(/^I manually sign in as "([^"]*)"$/) do |name|
  steps %Q{
    Given I am on "http://studio.code.org/reset_session"
    Then I am on "http://studio.code.org/"
    And I set the language cookie
    And I create a student named "#{name}"
    Then I am on "http://studio.code.org/"
    And I reload the page
    Then I wait for 2 seconds
    Then I wait to see ".header_user"
    Then I click selector "#signin_button"
    And I wait to see ".new_user"
    And I fill in username and password for "#{name}"
    And I click selector "input[type=submit][value='Sign in']"
    And I wait to see ".header_user"
  }
end

When(/^I sign out$/) do
  steps 'When I am on "http://studio.code.org/users/sign_out"'
end

When(/^I debug cookies$/) do
  puts "DEBUG: url=#{CGI::escapeHTML @browser.current_url.inspect}"
  debug_cookies(@browser.manage.all_cookies)
end

When(/^I debug focus$/) do
  puts "Focused element id: #{@browser.execute_script("return document.activeElement.id")}"
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
  wait_with_short_timeout.until { !/#{old_path}/.match(@browser.execute_script("return location.pathname")) }
end

Then /^my query params match "(.*)"$/ do |matcher|
  wait_with_short_timeout.until { /#{matcher}/.match(@browser.execute_script("return location.search;")) }
end

Then /^I wait to see element with ID "(.*)"$/ do |element_id_to_seek|
  wait_with_short_timeout.until { @browser.find_element(:id => element_id_to_seek) }
end

Then /^I get redirected to "(.*)" via "(.*)"$/ do |new_path, redirect_source|
  wait_with_short_timeout.until { /#{new_path}/.match(@browser.execute_script("return location.pathname")) }

  if redirect_source == 'pushState'
    state = { "modified" => true }
  elsif redirect_source == 'dashboard' || redirect_source == 'none'
    state = nil
  end
  @browser.execute_script("return window.history.state").should eq state
end

last_shared_url = nil
Then /^I navigate to the share URL$/ do
  wait_with_short_timeout.until { @button = @browser.find_element(:id => 'sharing-input') }
  last_shared_url = @browser.execute_script("return document.getElementById('sharing-input').value")
  @browser.navigate.to last_shared_url
end

Then /^I navigate to the last shared URL$/ do
  @browser.navigate.to last_shared_url
end

Then /^I append "([^"]*)" to the URL$/ do |append|
  url = @browser.current_url + append
  @browser.navigate.to "#{url}"
end

Then /^selector "([^"]*)" has class "(.*?)"$/ do |selector, class_name|
  item = @browser.find_element(:css, selector)
  classes = item.attribute("class")
  classes.include?(class_name).should eq true
end

Then /^selector "([^"]*)" doesn't have class "(.*?)"$/ do |selector, class_name|
  item = @browser.find_element(:css, selector)
  classes = item.attribute("class")
  classes.include?(class_name).should eq false
end

Then /^there is no horizontal scrollbar$/ do
  @browser.execute_script('return document.documentElement.scrollWidth <= document.documentElement.clientWidth').should eq true
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
