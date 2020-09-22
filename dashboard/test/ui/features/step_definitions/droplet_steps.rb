And(/^I wait to see Droplet text mode$/) do
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until {@browser.execute_script("return parseInt($('.droplet-ace').css('left')) > 0;")}
end

And(/^I wait to see Droplet block mode$/) do
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until {@browser.execute_script("return $('.droplet-gutter > div').css('display') === 'block';")}
end

And(/^the Droplet ACE text is "([^"]*)"$/) do |expected_text|
  # Let us expect newlines in the editor
  expected_text.gsub! '\n', "\n"
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  expect(actual_text).to eq(expected_text)
end

And(/^the Droplet ACE text is '([^']*)'$/) do |expected_text|
  # Let us expect newlines in the editor
  expected_text.gsub! '\n', "\n"
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  expect(actual_text).to eq(expected_text)
end

And(/^no Tooltipster tooltip is visible$/) do
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until {!@browser.execute_script("return $('.tooltipster-base').is(':visible');")}
end

And(/^there is a Tooltipster tooltip with text "([^"]*)"$/) do |tooltip_text|
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until {@browser.execute_script("return $('.tooltipster-content :contains(#{tooltip_text})').length > 0;")}
end

# This doesn't work in IE or on mobile yet, not sure why.
When /^I drag droplet block "([^"]*)" to line (\d+)$/ do |block_name, line_number|
  # Droplet with SVG will trash the block if any part of it overlaps the gutter.
  extra_dx = 5

  code = %{
    var block = $(".droplet-palette-canvas text:contains(#{block_name})");
    var gutterLine = $(".droplet-gutter-line").filter(function (index) { return $(this).text() === "#{line_number}"; });
    var drag_dx = gutterLine.offset().left + gutterLine.outerWidth() - block.offset().left + #{extra_dx};
    var drag_dy = gutterLine.offset().top - block.offset().top;
    block.simulate('drag', {
      handle: 'center',
      dx: drag_dx,
      dy: drag_dy,
      moves: 5
    });
  }
  @browser.execute_script code
end

When /^I click droplet gutter line (\d+)$/ do |line|
  code = %{
    var gutterLine = $(".droplet-gutter-line").filter(function (index) { return $(this).text() === "#{line}"; });
    var x = gutterLine.offset().left + 5;
    var y = gutterLine.offset().top + 5;
    gutterLine.simulate('mousedown', {
      clientX: x,
      clientY: y,
    });
  }

  @browser.execute_script code
end

When /^I ensure droplet is in text mode$/ do
  steps 'And I wait to see "#show-code-header"'
  button_text = @browser.execute_script("return $('#show-code-header').text()")
  if button_text == 'Show Text'
    steps <<-STEPS
      Then I press "show-code-header"
      And I wait to see Droplet text mode
    STEPS
  end
end

When /^I ensure droplet is in block mode$/ do
  steps 'And I wait to see "#show-code-header"'
  button_text = @browser.execute_script("return $('#show-code-header').text()")
  if button_text == 'Show Blocks'
    steps <<-STEPS
      Then I press "show-code-header"
      And I wait to see Droplet block mode
    STEPS
  end
end

When /^I add code "([^"]+)" to ace editor$/ do |code|
  steps 'I ensure droplet is in text mode'
  add_code_to_editor(code)
end

def add_code_to_editor(code)
  script =
    "var aceEditor = __TestInterface.getDroplet().aceEditor;\n" \
    "aceEditor.textInput.focus();\n" \
    "aceEditor.onTextInput(\"#{code}\");\n"

  @browser.execute_script(script)
end

When /^ace editor code is equal to "([^"]+)"$/ do |expected_code|
  actual_code = get_ace_editor_code
  expect(actual_code).to eq(expected_code)
end

def get_ace_editor_code
  script = 'return __TestInterface.getDroplet().aceEditor.getValue().trim();'
  @browser.execute_script(script)
end

When /^I add code for a library function$/ do
  code =
    "// my library function\\n" \
    "function myLibrary() {}"
  add_code_to_editor(code)
end

Given /^I publish a basic library in (Applab|Game Lab)$/ do |lab_type|
  steps <<-STEPS
    And I start a new #{lab_type} project
    And I wait for the page to fully load
    And I wait for initial project save to complete
    And I switch to text mode
    When I add code for a library function
    Then I open the library publish dialog
    And I wait until element "#ui-test-library-description" is visible
    And I press keys "My library" for element "#ui-test-library-description"
    And I click selector "label:contains('Select all functions')"
    Then I click selector "#ui-test-publish-library"
    And I wait until element "b:contains('Successfully published your library:')" is visible
  STEPS
end

Then /^I open the library publish dialog/ do
  steps <<-STEPS
    When I open the share dialog
    And I click selector "#project-share a:contains('Show advanced options')" if it exists
    And I click selector "#project-share li:contains('Share as library')"
    And I click selector "button:contains('Share as library')"
  STEPS
end
