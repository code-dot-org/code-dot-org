
When(/^I begin to edit the direction of turn block "([^"]*)"$/) do |block|
  @browser.execute_script("$(\"[block-id='#{get_block_id(block)}'] > .blocklyEditableText:nth-of-type(1)\").simulate('click');")
end

When(/^I begin to edit the angle of turn block "([^"]*)"$/) do |block|
  @browser.execute_script("$(\"[block-id='#{get_block_id(block)}'] > .blocklyEditableText:nth-of-type(2)\").simulate('click');")
end

When(/^I change the angle text to "(\d*)"$/) do |val|
  @browser.execute_script("$('.blocklyWidgetDiv .blocklyHtmlInput').val(#{val})")
  @browser.execute_script("Blockly.fireUiEvent($('.blocklyWidgetDiv .blocklyHtmlInput')[0], 'keyup')")
end

When(/^I change the angle dropdown to "(\d*)"$/) do |val|
  @browser.execute_script("$('.blocklyWidgetDiv .goog-menu .goog-option:contains(#{val})').simulate('mousedown')")
end

When(/^I drag the Angle Helper circle to coordinates \((\d*),(\d*)\)$/) do |x, y|
  @browser.execute_script("Blockly.fireUiEvent($('.blocklyWidgetDiv svg')[0], 'mousedown')")
  @browser.execute_script("Blockly.fireUiEvent($('.blocklyWidgetDiv svg')[0], 'mousemove', {offsetX: #{x}, offsetY: #{y}})")
  @browser.execute_script("Blockly.fireUiEvent($('.blocklyWidgetDiv svg')[0], 'mousemove')")
end

Then(/^the angle text is at "(\d*)"$/) do |val|
  expect(@browser.execute_script("return $('.blocklyWidgetDiv .blocklyHtmlInput').val()")).to eq(val)
end

Then(/^the angle dropdown is at "(\d*)"$/) do |val|
  expect(@browser.execute_script("return $('.blocklyWidgetDiv .goog-menu .goog-option-selected .goog-menuitem-content').text()")).to eq(val)
end

Then(/^the Angle Helper circle is at coordinates \((\d*),(\d*)\)$/) do |x, y|
  expect(@browser.execute_script("return parseInt($('.blocklyWidgetDiv circle').attr('cx')")).to eq(x)
  expect(@browser.execute_script("return parseInt($('.blocklyWidgetDiv circle').attr('cy')")).to eq(y)
end
