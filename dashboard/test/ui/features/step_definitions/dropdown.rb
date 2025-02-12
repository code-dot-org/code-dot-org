And /^I drag the play sound block to offset "(\d*), (\d*)"$/ do |dx, dy|
  drag_block_relative(2, dx, dy)
end

Then /^the dropdown is (.*)$/ do |visibility|
  case visibility
  when "visible"
    expected = 'block'
  when "hidden"
    expected = 'none'
  else
    raise "unexpected visibility"
  end
  dropdown_class = google_blockly? ? 'blocklyDropDownDiv' : 'blocklyWidgetDiv'
  element = @browser.find_element(:class, dropdown_class)
  expect(element.attribute('style').match(Regexp.new("display: #{expected}"))).not_to eq(nil)
end

Then /^I select item (\d+) from the dropdown$/ do |n|
  elements = @browser.find_elements(:class, 'goog-menuitem-content')
  elements[n.to_i].click
end
