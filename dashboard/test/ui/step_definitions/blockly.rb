Given(/^block "([^"]*)" is at a ((?:blockly )?)location "([^"]*)"$/) do |block, is_blockly, identifier|
  @locations ||= {}
  block_id = get_block_id(block)
  @block = @browser.find_element(:css, "g[block-id='#{block_id}']")
  x = is_blockly ? get_block_workspace_left(block_id) : get_block_absolute_left(block_id)
  y = is_blockly ? get_block_workspace_top(block_id) : get_block_absolute_top(block_id)
  @locations[identifier] = BlocklyHelpers::Point.new(x, y)
end

When(/^I click block "([^"]*)"$/) do |block|
  @browser.execute_script("$(\"[block-id='#{get_block_id(block)}']\").simulate( 'drag', {handle: 'corner', dx: 0, dy: 0, moves: 5});")
end

# Note: this is an offset relative to the current position of the block
When /^I drag block "([^"]*)" to offset "([^"]*), ([^"]*)"$/ do |block_id, dx, dy|
  drag_block_relative(get_block_id(block_id), dx, dy)
end

When /^I begin to drag block "([^"]*)" to offset "([^"]*), ([^"]*)"$/ do |from, dx, dy|
  @browser.execute_script("$(\"[block-id='#{get_block_id(from)}']\").simulate( 'drag', {skipDrop: true, handle: 'corner', dx: #{dx}, dy: #{dy}, moves: 5});")
end

When /^I drag block "([^"]*)" to block "([^"]*)"$/ do |from, to|
  code = generate_drag_code(get_block_id(from), get_block_id(to), 0, 30)
  @browser.execute_script code
end

When /^I drag block matching selector "([^"]*)" to block matching selector "([^"]*)"$/ do |from, to|
  code = generate_selector_drag_code(from, to, 0, 30)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" to block "([^"]*)" plus offset (\d+), (\d+)$/ do |from, to, dx, dy|
  code = generate_drag_code(get_block_id(from), get_block_id(to), dx, dy)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" above block "([^"]*)"$/ do |from, to|
  from_id = get_block_id(from)
  to_id = get_block_id(to)
  height = @browser.execute_script("return $(\"[block-id='#{from_id}']\")[0].getBoundingClientRect().height;") - 10
  destination_has_parent = @browser.execute_script("return $(\"[block-id='#{to_id}']\").parent().attr('block-id') !== undefined;")
  code = generate_drag_code(from_id, to_id, 0, destination_has_parent ? 0 : -height)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" into first position in repeat block "([^"]*)"$/ do |from, to|
  code = generate_drag_code(get_block_id(from), get_block_id(to), 35, 50)
  @browser.execute_script code
end

Then /^block "([^"]*)" is at offset "([^"]*), ([^"]*)"$/ do |block, x, y|
  point = get_block_coordinates(get_block_id(block))
  point.x.should eq x.to_i
  point.y.should eq y.to_i
end

Then /^block "([^"]*)" is((?:n't| not)?) at ((?:blockly )?)location "([^"]*)"$/ do |block, negation, is_blockly, location_identifier|
  block_id = get_block_id(block)
  actual_x = is_blockly ? get_block_workspace_left(block_id) : get_block_absolute_left(block_id)
  actual_y = is_blockly ? get_block_workspace_top(block_id) : get_block_absolute_top(block_id)
  location = @locations[location_identifier]
  if negation == ''
    "#{actual_x},#{actual_y}".should eq "#{location.x},#{location.y}"
  else
    "#{actual_x},#{actual_y}".should_not eq "#{location.x},#{location.y}"
  end
end

Then /^I scroll the ([a-zA-Z]*) blockspace to the bottom$/ do |workspace_type|
  block_space_name = workspace_type + 'BlockSpace'
  scrollable_height = get_scrollable_height(block_space_name)
  @browser.execute_script("Blockly.#{block_space_name}.scrollTo(0, #{scrollable_height})")
end

Then /^block "([^"]*)" is visible in the workspace$/ do |block|
  block_id = get_block_id(block)

  # Check block existence, blockly-way
  steps "Then block \"#{block}\" has not been deleted"

  # Check block position is within visible blockspace
  # Get block dimensions
  block_left = @browser.execute_script("return $(\"[block-id='#{block_id}']\")[0].getBoundingClientRect().left")
  block_right = @browser.execute_script("return $(\"[block-id='#{block_id}']\")[0].getBoundingClientRect().right")
  block_top = @browser.execute_script("return $(\"[block-id='#{block_id}']\")[0].getBoundingClientRect().top")
  block_bottom = @browser.execute_script("return $(\"[block-id='#{block_id}']\")[0].getBoundingClientRect().bottom")

  # Get blockspace dimensions
  # blockspaceRect includes the toolbox on the left, but not the headers on the top.
  block_space_left = @browser.execute_script('return Blockly.mainBlockSpaceEditor.svg_.getBoundingClientRect().left')
  block_space_right = @browser.execute_script('return Blockly.mainBlockSpaceEditor.svg_.getBoundingClientRect().right')
  block_space_top = @browser.execute_script('return Blockly.mainBlockSpaceEditor.svg_.getBoundingClientRect().top')
  block_space_bottom = @browser.execute_script('return Blockly.mainBlockSpaceEditor.svg_.getBoundingClientRect().bottom')
  toolbox_width = @browser.execute_script('return Blockly.mainBlockSpaceEditor.getToolboxWidth()')

  # Minimum part of block (in pixels) that must be within workspace to be 'visible'
  block_margin = 10
  block_bottom.should be > block_space_top + block_margin
  block_top.should be < block_space_bottom - block_margin
  block_left.should be < block_space_right - block_margin
  block_right.should be > block_space_left + block_margin + toolbox_width
end

Then /^block "([^"]*)" is child of block "([^"]*)"$/ do |child, parent|
  @child_item = @browser.find_element(:css, "g[block-id='#{get_block_id(child)}']")
  @parent_item = @browser.find_element(:css, "g[block-id='#{get_block_id(parent)}']")
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  @parent_item.should eq @actual_parent_item
end

Then /^block "([^"]*)" is not child of block "([^"]*)"$/ do |child, parent|
  @child_item = @browser.find_element(:css, "g[block-id='#{get_block_id(child)}']")
  @parent_item = @browser.find_element(:css, "g[block-id='#{get_block_id(parent)}']")
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  @parent_item.should_not eq @actual_parent_item
end

And /^I've initialized the workspace with an auto\-positioned flappy puzzle$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  blocks_xml = '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title><next><block type="flappy_playSound"><title name="VALUE">"sfx_wing"</title></block></next></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
  arranged_blocks_xml = @browser.execute_script("return __TestInterface.arrangeBlockPosition('" + blocks_xml + "', {});")
  @browser.execute_script("__TestInterface.loadBlocks('" + arranged_blocks_xml + "');")
end

And /^I've initialized the workspace with an auto\-positioned flappy puzzle with extra newlines$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  blocks_xml = '\n\n    <xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title><next><block type="flappy_playSound"><title name="VALUE">"sfx_wing"</title></block></next></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
  arranged_blocks_xml = @browser.execute_script("return __TestInterface.arrangeBlockPosition('" + blocks_xml + "', {});")
  @browser.execute_script("__TestInterface.loadBlocks('" + arranged_blocks_xml + "');")
end

And /^I've initialized the workspace with a manually\-positioned playlab puzzle$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  blocks_xml = '<xml><block type="studio_whenArrow" x="20"><title name="VALUE">up</title><next><block type="studio_move"><title name="DIR">1</title></block></next></block><block type="studio_whenArrow" y="20"><title name="VALUE">down</title><next><block type="studio_move"><title name="DIR">2</title></block></next></block><block type="studio_whenArrow" x="20" y="20"><title name="VALUE">left</title><next><block type="studio_move"><title name="DIR">4</title></block></next></block><block type="studio_whenArrow"><title name="VALUE">right</title><next><block type="studio_move"><title name="DIR">8</title></block></next></block></xml>'
  arranged_blocks_xml = @browser.execute_script("return __TestInterface.arrangeBlockPosition('" + blocks_xml + "', {});")
  @browser.execute_script("__TestInterface.loadBlocks('" + arranged_blocks_xml + "');")
end

And /^I've initialized the workspace with the solution blocks$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  @browser.execute_script("__TestInterface.loadBlocks(appOptions.level.solutionBlocks);")
end

And /^I've initialized the workspace with a studio say block saying "([^"]*)"$/ do |phrase|
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  xml = '<xml><block type="when_run" deletable="false"><next><block type="studio_saySprite"><title name="SPRITE">0</title><title name="TEXT">'+ phrase +'</title></block></next></block></xml>'
  @browser.execute_script("__TestInterface.loadBlocks('" + xml + "');")
end

Then(/^block "([^"]*)" is in front of block "([^"]*)"$/) do |block_front, block_back|
  block_front_id = get_block_id(block_front)
  block_back_id = get_block_id(block_back)
  blocks_have_same_parent = @browser.execute_script("return $(\"[block-id='#{block_front_id}']\").parent()[0] === $(\"[block-id='#{block_back_id}']\").parent()[0]")
  raise('Cannot evaluate blocks with different parents') unless blocks_have_same_parent
  block_front_index = @browser.execute_script("return $(\"[block-id='#{block_front_id}']\").index()")
  block_back_index = @browser.execute_script("return $(\"[block-id='#{block_back_id}']\").index()")
  block_front_index.should be > block_back_index
end

Then(/^the workspace has "(.*?)" blocks of type "(.*?)"$/) do |n, type|
  code = "return Blockly.mainBlockSpace.getAllBlocks().reduce(function (a, b) { return a + (b.type === '" + type + "' ? 1 : 0) }, 0)"
  result = @browser.execute_script(code)
  result.should eq n.to_i
end

Then(/^block "([^"]*)" has (not )?been deleted$/) do |block_id, negation|
  code = "return Blockly.mainBlockSpace.getAllBlocks().some(function (block) { return block.id == '" + get_block_id(block_id) + "'; })"
  result = @browser.execute_script(code)
  if negation.nil?
    result.should eq false
  else
    result.should eq true
  end
end

Then /^block "([^"]*)" has class "(.*?)"$/ do |block_id, class_name|
  item = @browser.find_element(:css, "g[block-id='#{get_block_id(block_id)}']")
  classes = item.attribute("class")
  classes.include?(class_name).should eq true
end

Then /^block "([^"]*)" doesn't have class "(.*?)"$/ do |block_id, class_name|
  item = @browser.find_element(:css, "g[block-id='#{get_block_id(block_id)}']")
  classes = item.attribute("class")
  classes.include?(class_name).should eq false
end

Then /^the modal function editor is closed$/ do
  modal_dialog_visible.should eq false
end

Then /^the modal function editor is open$/ do
  modal_dialog_visible.should eq true
end

When(/^I set block "([^"]*)" to have a value of "(.*?)" for title "(.*?)"$/) do |block_id, value, title|
  script = "
    Blockly.mainBlockSpace.getAllBlocks().forEach(function (b) {
      if (b.id === #{get_block_id(block_id)}) {
        b.setTitleValue('#{value}', '#{title}');
      }
    });"
  puts script
  @browser.execute_script(script)

end

When(/^"(.+)" refers to block "(.+)"$/) do |block_alias, block_id|
  add_block_alias(block_alias, block_id)
end
