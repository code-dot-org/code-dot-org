require File.expand_path('../../../../config/environment.rb', __FILE__)

def replace_hostname(url)
  if ENV['DASHBOARD_TEST_DOMAIN']
    url = url.gsub(/\/\/learn.code.org\//, "//" + ENV['DASHBOARD_TEST_DOMAIN'] + "/")
  end
  if ENV['PEGASUS_TEST_DOMAIN']
    url = url.gsub(/\/\/code.org\//, "//" + ENV['PEGASUS_TEST_DOMAIN'] + "/")
  end
  url
end

Given /^I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  @browser.navigate.to "#{url}"
end

When /^I wait to see "([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {:id => name} : {:class => name}
  wait = Selenium::WebDriver::Wait.new(:timeout => 60 * 2)
  wait.until { @browser.find_element(selection_criteria) }
end

Then /^I see "([.#])([^"]*)"$/ do |selector_symbol, name|
  selection_criteria = selector_symbol == '#' ? {:id => name} : {:class => name}
  @browser.find_element(selection_criteria)
end

When /^I wait until element "([^"]*)" has text "([^"]*)"$/ do |selector, text|
  wait = Selenium::WebDriver::Wait.new(:timeout => 60 * 2)
  wait.until { element_has_text(selector, text) }
end

When /^I wait until element "([^"]*)" is visible$/ do |selector|
  wait = Selenium::WebDriver::Wait.new(:timeout => 60 * 2)
  wait.until { @browser.execute_script("return $('#{selector}').is(':visible')") }
end

Then /^check that I am on "([^"]*)"$/ do |url|
  url = replace_hostname(url)
  @browser.current_url.should eq url
end

When /^I wait for (\d+) seconds?$/ do |seconds|
  sleep seconds.to_i
end

When /^I submit$/ do
  @element.submit
end

When /^I rotate to landscape$/ do
  if ENV['BS_AUTOMATE_OS'] == 'android'
    @browser.rotate(:landscape)
  end
end

When /^I inject simulation$/ do
  #@browser.execute_script('$("body").css( "background-color", "black")')
  @browser.execute_script("var fileref=document.createElement('script');  fileref.setAttribute('type','text/javascript'); fileref.setAttribute('src', '/assets/jquery.simulate.js'); document.getElementsByTagName('head')[0].appendChild(fileref)")
end

When /^I press "([^"]*)"$/ do |button|
  @button = @browser.find_element(:id, button)
  @button.click
end

When /^I press "([^"]*)" using jQuery$/ do |selector|
  @browser.execute_script("$('" + selector + "').click()");
end

When /^I press dropdown item "([^"]*)"$/ do |index|
  @browser.execute_script("$('.goog-menuitem').eq(#{index}).simulate('drag', function(){})");
end

When /^I press a button with xpath "([^"]*)"$/ do |xpath|
  @button = @browser.find_element(:xpath, xpath)
  @button.click
end

When /^I click selector "([^"]*)"$/ do |jquery_selector|
  @browser.execute_script("$(\"#{jquery_selector}\").click();")
end

When /^I hold key "([^"]*)"$/ do |keyCode|
  script ="$(window).simulate('keydown',  {keyCode: $.simulate.keyCode['#{keyCode}']})"
  @browser.execute_script(script)
end

Then /^I should see title "([^"]*)"$/ do |title|
  @browser.title.should eq title
end

Then /^evaluate JavaScript expression "([^"]*)"$/ do |expression|
  @browser.execute_script("return #{expression}").should eq true
end

# The second regex matches strings in which all double quotes and backslashes
# are quoted (preceded by a backslash).
Then /^element "([^"]*)" has text "((?:[^"\\]|\\.)*)"$/ do |selector, expectedText|
  element_has_text(selector, expectedText)
end

Then /^element "([^"]*)" contains text "((?:[^"\\]|\\.)*)"$/ do |selector, expectedText|
  element_contains_text(selector, expectedText)
end

# The second regex encodes that ids should not contain spaces or quotes.
# While this is stricter than HTML5, it is looser than HTML4.
Then /^element "([^"]*)" has id "([^ "']+)"$/ do |selector, id|
  element_has_id(selector, id)
end

Then /^element "([^"]*)" is visible$/ do |selector|
  visibility = @browser.execute_script("return $('#{selector}').css('visibility')");
  visible = @browser.execute_script("return $('#{selector}').is(':visible')") && (visibility != 'hidden');
  visible.should eq true
end

Then /^element "([^"]*)" is hidden$/ do |selector|
  visibility = @browser.execute_script("return $('#{selector}').css('visibility')");
  visible = @browser.execute_script("return $('#{selector}').is(':visible')") && (visibility != 'hidden');
  visible.should eq false
end

def is_disabled(selector)
  @browser.execute_script("return $('#{selector}')[0].getAttribute('disabled') !== null || $('#{selector}').hasClass('disabled')")
end

Then /^element "([^"]*)" is not disabled$/ do |selector|
  is_disabled(selector).should eq false
end

Then /^element "([^"]*)" is disabled$/ do |selector|
  is_disabled(selector).should eq true
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

Then /^I see jquery selector (.*)$/ do |selector|
  exists = @browser.execute_script("return $(\"#{selector}\").length != 0;")
  exists.should eq true
end

Then /^there's a div with a background image "([^"]*)"$/ do |path|
  exists = @browser.execute_script("return $('div').filter(function(){return $(this).css('background-image').indexOf('#{path}') != -1 }).length > 0");
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
  @browser.execute_script("Turtle.speedSlider.setValue(0.8)");
end

Then(/^I slow down execution speed$/) do
  @browser.execute_script("Maze.scale.stepSpeed = 10;");
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

def encrypted_cookie(user_id)
  key_generator = ActiveSupport::KeyGenerator.new(
      CDO.dashboard_secret_key_base,
      iterations:1000
    )

    encryptor = ActiveSupport::MessageEncryptor.new(
      key_generator.generate_key('encrypted cookie'),
      key_generator.generate_key('signed encrypted cookie')
    )

  cookie = {'warden.user.user.key' => [[user_id]]}

  encrypted_data = encryptor.encrypt_and_sign(cookie)

  CGI.escape(encrypted_data.to_s)
end

def log_in_as(user)
  params = { name: "_learn_session_#{Rails.env}",
            value: encrypted_cookie(user.id)}

  if ENV['DASHBOARD_TEST_DOMAIN'] && ENV['DASHBOARD_TEST_DOMAIN'] =~ /code.org/ &&
      ENV['PEGASUS_TEST_DOMAIN'] && ENV['PEGASUS_TEST_DOMAIN'] =~ /code.org/
    params[:domain] = '.code.org' # top level domain cookie
  end

  @browser.manage.add_cookie params
end

Given(/^I am a teacher$/) do
  @teacher = User.find_or_create_by!(email: 'teacher@testing.xx') do |teacher|
    teacher.name = "Test teacher"
    teacher.password = SecureRandom.base64
    teacher.user_type = 'teacher'
    teacher.age = 40
  end
  log_in_as(@teacher)
end
