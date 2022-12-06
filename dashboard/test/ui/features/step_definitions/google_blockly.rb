# Google Blockly blocks do not have hard-coded IDs. Blocks are specified in document order.

# Note: this is an offset relative to the current position of the block
When /^I drag Google Blockly block "([^"]*)" to offset "([^"]*), ([^"]*)"$/ do |block_index, dx, dy|
  @browser.execute_script("$(\"[class='blocklyDraggable']\").eq(#{block_index.to_i}).simulate( 'drag', {handle: 'corner', dx: #{dx}, dy: #{dy}, moves: 5});")
end

When /^I drag Google Blockly block "([^"]*)" to block "([^"]*)"$/ do |target_index, destination_index|
  code = generate_google_blockly_block_drag_code(target_index, destination_index, 0, 30)
  @browser.execute_script code
end

Then /^Google Blockly block "([^"]*)" is near offset "([^"]*), ([^"]*)"$/ do |block_index, x, y|
  point = get_google_blockly_block_coordinates(block_index)
  expect(point.x).to be_within(3).of(x.to_i)
  expect(point.y).to be_within(3).of(y.to_i)
end

Then /^Google Blockly block "([^"]*)" is child of block "([^"]*)"$/ do |child_index, parent_index|
  id_selector = get_id_selector
  child_item = @browser.find_elements(class: 'blocklyDraggable')[child_index.to_i]
  parent_item = @browser.find_elements(class: 'blocklyDraggable')[parent_index.to_i]
  parent_id = parent_item.attribute(id_selector)
  actual_parent_item = child_item.find_element(:xpath, "..")
  actual_parent_id = actual_parent_item.attribute(id_selector)
  expect(actual_parent_id).to eq(parent_id)
end
