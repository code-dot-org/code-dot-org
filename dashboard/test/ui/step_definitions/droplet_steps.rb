And(/^I wait to see Droplet text mode$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return parseInt($('.droplet-ace').css('left')) > 0;") }
end

And(/^the Droplet ACE text is "([^"]*)"$/) do |expected_text|
  # Let us expect newlines in the editor
  expected_text.gsub! '\n', "\n"
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  actual_text.should eq expected_text
end

And(/^no Tooltipster tooltip is visible$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { !@browser.execute_script("return $('.tooltipster-base').is(':visible');") }
end

And(/^there is a Tooltipster tooltip with text "([^"]*)"$/) do |tooltip_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return $('.tooltipster-content :contains(#{tooltip_text})').length > 0;") }
end

# This doesn't work in IE or on mobile yet, not sure why.
When /^I drag droplet block "([^"]*)" to line (\d+)$/ do |block_name, line_number|
  code = %{
    var block = $("#droplet_palette_block_#{block_name}");
    var gutterLine = $(".droplet-gutter-line").filter(function (index) { return $(this).text() === "#{line_number}"; });
    var drag_dx = gutterLine.offset().left + gutterLine.outerWidth() - block.offset().left;
    var drag_dy = gutterLine.offset().top - block.offset().top;
    block.simulate( 'drag', {
      handle: 'center',
      dx: drag_dx,
      dy: drag_dy,
      moves: 5
    });
  }
  @browser.execute_script code
end
