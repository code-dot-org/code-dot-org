And /^I drag the play sound block to offset "(\d*), (\d*)"$/ do |dx, dy|
  drag_block_relative(2, dx, dy)
end

And /^I press dropdown number (\d+)$/ do |n|
  elements = @browser.find_elements(:class, 'blocklyText')
  elements[n.to_i].find_element(:xpath, '../*[last()]').click
end

Then /^the dropdown is (.*)$/ do |visibility|
  if visibility == "visible"
    expected = 'block'
  elsif visibility == "hidden"
    expected = 'none'
  else
    raise "unexpected visibility"
  end

  element = @browser.find_element(:class, 'blocklyWidgetDiv')
  expect(element.attribute('style').match(Regexp.new("display: #{expected}"))).not_to eq(nil)
end

Then /^I select item (\d+) from the dropdown$/ do |n|
  elements = @browser.find_elements(:class, 'goog-menuitem-content')
  elements[n.to_i].click
end

Then /^the dropdown field has text "(.*?)"$/ do |text|
  element_has_text("[block-id='4'] .blocklyEditableText", text)
end

And /^I press the image dropdown$/ do
  @browser.execute_script("$('.blocklyRectangularDropdownArrow').parent().siblings().filter('[fill-opacity]').simulate( 'drag', {handle: 'corner', dx: 0, dy: 0, moves: 5});")
end
