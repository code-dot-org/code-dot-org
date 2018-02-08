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
