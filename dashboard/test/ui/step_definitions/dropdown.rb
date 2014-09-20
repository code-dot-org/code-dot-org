And /^I drag the play sound block to offset "(\d*), (\d*)"$/ do |dx, dy|
  dragBlockRelative(2, dx, dy)
end

And /^I press the dropdown$/ do
  elements = @browser.find_elements(:class, 'blocklyText')
  elements[6].click
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
  element.attribute('style').match(Regexp.new("display: #{expected}")).should_not eq nil
end

Then /^I select the crash item from the dropdown$/ do
  elements = @browser.find_elements(:class, 'goog-menuitem-content')
  elements[9].click
end

Then /^the dropdown field has text "(.*?)"$/ do |text|
  element_has_text("[block-id='4'] .blocklyEditableText", text)
end

And /^I press the image dropdown$/ do
  @browser.execute_script("$('.blocklyRectangularDropdownArrow').parent().siblings().filter('[fill-opacity]').simulate( 'drag', {handle: 'corner', dx: 0, dy: 0, moves: 5});")
end
