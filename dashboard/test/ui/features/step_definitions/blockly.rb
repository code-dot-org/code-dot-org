Given(/^block "([^"]*)" is at a ((?:blockly )?)location "([^"]*)"$/) do |block, is_blockly, identifier|
  id_selector = get_id_selector
  @locations ||= {}
  block_id = get_block_id(block)
  @block = @browser.find_element(:css, ".blocklySvg g[#{id_selector}='#{block_id}']")
  x = is_blockly ? get_block_workspace_left(block_id) : get_block_absolute_left(block_id)
  y = is_blockly ? get_block_workspace_top(block_id) : get_block_absolute_top(block_id)
  @locations[identifier] = BlocklyHelpers::Point.new(x, y)
end

When /^I add a "([^"]*)" block with id "([^"]*)" to workspace$/ do |type, id|
  script = <<~JS
    Blockly.serialization.blocks.append({
      "type": "#{type}",
      "id": "#{id}"
    }, Blockly.getMainWorkspace());
  JS

  @browser.execute_script(script)
end

When(/^I click block "([^"]*)"$/) do |block|
  id_selector = get_id_selector
  @browser.execute_script("$(\".blocklySvg [#{id_selector}='#{get_block_id(block)}']\").simulate( 'drag', {handle: 'corner', dx: 0, dy: 0, moves: 5});")
end

# This helps click on a field in Google Blockly. It always picks the first element from the list generated
# by the selector.
When(/^I click block field "([^"]*)"$/) do |selector|
  steps "Then I click block field \"#{selector}\" number 0"
end

# This helps click on a field in Google Blockly.
When(/^I click block field "([^"]*)" number (\d+)$/) do |selector, index|
  code = <<~CODE
    $("#{selector}")[#{index}].dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
    $("#{selector}")[#{index}].dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
  CODE

  @browser.execute_script(code)
end

# Note: this is an offset relative to the current position of the block
When /^I drag block "([^"]*)" to offset "([^"]*), ([^"]*)"$/ do |block_id, dx, dy|
  drag_block_relative(get_block_id(block_id), dx, dy)
end

When /^I drag block "([^"]*)" to block "([^"]*)"$/ do |from, to|
  code = generate_drag_code(get_block_id(from), get_block_id(to), 0, 30)
  @browser.execute_script code
end

When /^I connect block "([^"]*)" to block "([^"]*)"$/ do |from, to|
  code = connect_block(from, to)
  @browser.execute_script code
end

When /^I connect block "([^"]*)" inside block "([^"]*)"$/ do |from, to|
  code = connect_block_statement(from, to)
  @browser.execute_script code
end

When /^I move block "([^"]*)" to jigsaw ghost$/ do |id|
  code = move_block_to_jigsaw_ghost(id)
  @browser.execute_script code
end

When /^I delete block "([^"]*)"$/ do |id|
  code = delete_block(id)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" to block "([^"]*)" plus offset (\d+), (\d+)$/ do |from, to, dx, dy|
  code = generate_drag_code(get_block_id(from), get_block_id(to), dx, dy)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" into first position in repeat block "([^"]*)"$/ do |from, to|
  code = generate_drag_code(get_block_id(from), get_block_id(to), 35, 50)
  @browser.execute_script code
end

When /^I drag block number (\d+) to offset "([^"]*), ([^"]*)"$/ do |index, dx, dy|
  block_selector = get_indexed_blockly_draggable_selector(index.to_i)
  drag_indexed_block_to_offset(block_selector, dx, dy)
end

Then /^block "([^"]*)" is near offset "([^"]*), ([^"]*)"$/ do |block, x, y|
  point = get_block_coordinates(get_block_id(block))
  expect(point.x).to be_within(3).of(x.to_i)
  expect(point.y).to be_within(3).of(y.to_i)
end

Then /^block "([^"]*)" is((?:n't| not)?) at ((?:blockly )?)location "([^"]*)"$/ do |block, negation, is_blockly, location_identifier|
  block_id = get_block_id(block)
  actual_x = is_blockly ? get_block_workspace_left(block_id) : get_block_absolute_left(block_id)
  actual_y = is_blockly ? get_block_workspace_top(block_id) : get_block_absolute_top(block_id)
  location = @locations[location_identifier]
  if negation == ''
    expect("#{actual_x},#{actual_y}").to eq("#{location.x},#{location.y}")
  else
    expect("#{actual_x},#{actual_y}").not_to eq("#{location.x},#{location.y}")
  end
end

Then /^I scroll the ([a-zA-Z]*) blockspace to the top$/ do |workspace_type|
  block_space_name = workspace_type + 'BlockSpace'
  @browser.execute_script("Blockly.#{block_space_name}.scrollTo(0, 0)")
end

Then /^I scroll the ([a-zA-Z]*) blockspace to the bottom$/ do |workspace_type|
  block_space_name = workspace_type + 'BlockSpace'
  scrollable_height = get_scrollable_height(block_space_name)
  @browser.execute_script("Blockly.#{block_space_name}.scrollTo(0, #{scrollable_height})")
end

# This function only works for Google Blockly
Then /^I scroll the main blockspace to block "(.*?)"$/ do |block_id|
  @browser.execute_script("Blockly.mainBlockSpace.centerOnBlock('#{block_id}')")
end

Then /^block "([^"]*)" is visible in the workspace$/ do |block|
  block_id = get_block_id(block)

  # Check block existence, blockly-way
  steps "Then block \"#{block}\" has not been deleted"

  script = <<-JS
    const workspace = Blockly.getMainWorkspace();
    const block = workspace.getBlockById('#{block_id}');
    const boundingRect = block.getBoundingRectangle();
    const viewMetrics = workspace.getMetricsManager().getViewMetrics();
    const toolboxWidth = workspace.getToolbox() ? workspace.getToolbox().getWidth() : 0;

    return {
      blockLeft: boundingRect.left,
      blockRight: boundingRect.right,
      blockTop: boundingRect.top,
      blockBottom: boundingRect.bottom,
      viewLeft: viewMetrics.left + toolboxWidth,
      viewRight: viewMetrics.left + viewMetrics.width,
      viewTop: viewMetrics.top,
      viewBottom: viewMetrics.top + viewMetrics.height
    };
  JS

  dimensions = @browser.execute_script(script)

  block_margin = 10

  expect(dimensions["blockBottom"]).to be > dimensions["viewTop"] + block_margin
  expect(dimensions["blockTop"]).to be < dimensions["viewBottom"] - block_margin
  expect(dimensions["blockLeft"]).to be < dimensions["viewRight"] - block_margin
  expect(dimensions["blockRight"]).to be > dimensions["viewLeft"] + block_margin
end

Then /^block "([^"]*)" is child of block "([^"]*)"$/ do |child, parent|
  id_selector = get_id_selector
  @child_item = @browser.find_element(:css, ".blocklySvg g[#{id_selector}='#{get_block_id(child)}']")
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  # check for block id without relying on selenium element equality.
  actual_parent_id = @actual_parent_item.attribute(id_selector)
  expect(actual_parent_id).to eq(get_block_id(parent))
end

Then /^block "([^"]*)" is not child of block "([^"]*)"$/ do |child, parent|
  id_selector = get_id_selector
  @child_item = @browser.find_element(:css, ".blocklySvg g[#{id_selector}='#{get_block_id(child)}']")
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  # check for block id without relying on selenium element equality.
  actual_parent_id = @actual_parent_item.attribute(id_selector)
  expect(actual_parent_id).not_to eq(get_block_id(parent))
end

Then(/^block "([^"]*)" is in front of block "([^"]*)"$/) do |block_front, block_back|
  id_selector = get_id_selector
  block_front_id = get_block_id(block_front)
  block_back_id = get_block_id(block_back)
  blocks_have_same_parent = @browser.execute_script("return $(\"[#{id_selector}='#{block_front_id}']\").parent()[0] === $(\"[#{id_selector}='#{block_back_id}']\").parent()[0]")
  raise('Cannot evaluate blocks with different parents') unless blocks_have_same_parent
  block_front_index = @browser.execute_script("return $(\"[#{id_selector}='#{block_front_id}']\").index()")
  block_back_index = @browser.execute_script("return $(\"[#{id_selector}='#{block_back_id}']\").index()")
  expect(block_front_index).to be > block_back_index
end

Then(/^the workspace has "(.*?)" blocks of type "(.*?)"$/) do |n, type|
  code = "return Blockly.mainBlockSpace.getAllBlocks().reduce(function (a, b) { return a + (b.type === '" + type + "' ? 1 : 0) }, 0)"
  result = @browser.execute_script(code)
  expect(result).to eq(n.to_i)
end

Then(/^all blocks render with no unknown blocks$/) do
  code = <<~CODE
    return Blockly.Workspace.getAll().map(workspace => {
      const hasUnknownBlock = workspace.getAllBlocks().some(block => !!block.unknownBlock);
      if (hasUnknownBlock) {
        // element ID has name of block that is failing to render
        return workspace.getParentSvg().parentElement.id;
      } else {
        return null;
      }
    });
  CODE

  result = @browser.execute_script(code)
  expect(result.compact.empty?).to eq(true), "Blocks named: #{result.compact.join(', ')} unable to render"
end

Then(/^block "([^"]*)" has (not )?been deleted$/) do |block_id, negation|
  code = "return Blockly.mainBlockSpace.getAllBlocks().some(function (block) { return block.id == '" + get_block_id(block_id) + "'; })"
  result = @browser.execute_script(code)
  if negation.nil?
    expect(result).to eq(false)
  else
    expect(result).to eq(true)
  end
end

Then /^block "([^"]*)" has class "(.*?)"$/ do |block_id, class_name|
  id_selector = get_id_selector
  item = @browser.find_element(:css, ".blocklySvg g[#{id_selector}='#{get_block_id(block_id)}']")
  classes = item.attribute("class")
  expect(classes.include?(class_name)).to eq(true)
end

When /^I wait until block "([^"]*)" has class "(.*?)"$/ do |block_id, class_name|
  id_selector = get_id_selector
  wait_until do
    item = @browser.find_element(:css, ".blocklySvg g[#{id_selector}='#{get_block_id(block_id)}']")
    classes = item.attribute("class")
    classes.include?(class_name)
  end
end

Then /^block "([^"]*)" doesn't have class "(.*?)"$/ do |block_id, class_name|
  id_selector = get_id_selector
  item = @browser.find_element(:css, ".blocklySvg g[#{id_selector}='#{get_block_id(block_id)}']")
  classes = item.attribute("class")
  expect(classes.include?(class_name)).to eq(false)
end

Then /^the modal function editor is closed$/ do
  expect(modal_dialog_visible).to eq(false)
end

Then /^the modal function editor is open$/ do
  expect(modal_dialog_visible).to eq(true)
end

When(/^I set block "([^"]*)" to have a value of "(.*?)" for field "(.*?)"$/) do |block_id, value, field_name|
  script = "
    Blockly.getMainWorkspace().getAllBlocks().forEach(function (b) {
      if (b.id === '#{get_block_id(block_id)}') {
        b.setFieldValue('#{value}', '#{field_name}');
      }
    });"
  puts script
  @browser.execute_script(script)
end

When(/^"(.+)" refers to block "(.+)"$/) do |block_alias, block_id|
  add_block_alias(block_alias, block_id)
end

memorized_code = nil
When(/^I memorize my code$/) do
  memorized_code = current_block_xml
end

Then(/^the project matches my memorized code$/) do
  expect(memorized_code).to_not be_nil
  expect(current_block_xml).to eq(memorized_code)
end

Then(/^I click toolbox block with selector "(.*?)"$/) do |selector|
  script = "
    $('#{selector}').simulate('pointerdown')
    $('#{selector}').simulate('pointerup')
  "
  @browser.execute_script(script)
end

# This only works for Google Blockly
Then(/^I click block field that is number (.*?) in the list of blocks and number (.*?) in the field row$/) do |n1, n2|
  script = "
    Blockly.mainBlockSpace.getAllBlocks()[#{n1.to_i}].inputList[0].fieldRow[#{n2.to_i}].onClick()
  "
  @browser.execute_script(script)
end

# This only works for Google Blockly
Then(/^the open flyout has (.*?) blocks$/) do |n|
  script = "return Blockly.mainBlockSpace.getFlyout().getWorkspace().getTopBlocks().length"
  expect(@browser.execute_script(script)).to eq(n.to_i)
end

# This only works for Google Blockly
Then(/^the function editor workspace has (\d+) blocks$/) do |n|
  script = "return Blockly.getFunctionEditorWorkspace().getAllBlocks().length"
  expect(@browser.execute_script(script)).to eq(n)
end

def current_block_xml
  @browser.execute_script <<-JS
    return __TestInterface.getBlockXML();
  JS
end

When /^I move block "([^"]*)" to (top|left|bottom|right) edge of workspace$/ do |block, edge|
  block_id = get_block_id(block)
  script = <<-JS
    const workspace = Blockly.getMainWorkspace();
    const viewMetrics = workspace.getMetricsManager().getViewMetrics();
    const block = workspace.getBlockById('#{block_id}');
    const boundingRect = block.getBoundingRectangle();

    const blockWidth = boundingRect.right - boundingRect.left;
    const blockHeight = boundingRect.bottom - boundingRect.top;

    let x, y;

    switch ('#{edge}') {
      case 'left':
        x = viewMetrics.left - blockWidth / 2;
        y = boundingRect.top; // Maintain current top position
        break;
      case 'right':
        x = viewMetrics.left + viewMetrics.width - blockWidth / 2;
        y = boundingRect.top; // Maintain current top position
        break;
      case 'top':
        x = boundingRect.left; // Maintain current left position
        y = viewMetrics.top - blockHeight / 2;
        break;
      case 'bottom':
        x = boundingRect.left; // Maintain current left position
        y = viewMetrics.top + viewMetrics.height - blockHeight / 2;
        break;
    }

    block.moveTo(new Blockly.utils.Coordinate(x, y));
  JS
  @browser.execute_script(script)
end

When(/^I show the editor of field "([^"]*)" of block "([^"]*)"$/) do |field, block|
  block_id = get_block_id(block)
  script = <<-JS
    var workspace = Blockly.getMainWorkspace();
    workspace.hideChaff();
    var selectedBlock = workspace.getBlockById('#{block_id}');
    Blockly.common.setSelected(selectedBlock);
    selectedBlock.getField('#{field}').showEditor();
  JS
  @browser.execute_script(script)
end
When(/^I change the field "([^"]*)" editor value to "(\d*)"$/) do |field, val|
  @browser.execute_script("Blockly.selected.getField('#{field}').setEditorValue_(#{val})")
end

When(/^I change the field "([^"]*)" dropdown to "(\d*)"$/) do |field, val|
  @browser.execute_script("Blockly.selected.getField('#{field}').setValue('#{val}')")
  # Refresh the dropdown
  @browser.execute_script("Blockly.selected.getField('#{field}').showEditor()")
end

When(/^I update the field "([^"]*)" dropdown to "(\d*)"$/) do |field, val|
  @browser.execute_script("Blockly.selected.getField('#{field}').setValue('#{val}')")
  # Refresh the dropdown
  @browser.execute_script("Blockly.selected.workspace.hideChaff()")
end

def clear_main_block_space
  wait_until do
    @browser.execute_script("return Blockly && !!Blockly.mainBlockSpace")
  end
  @browser.execute_script("Blockly.mainBlockSpace.clear()")
end
