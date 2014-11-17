Given /^block "([^"]*)" is at a location "([^"]*)"$/ do |block, identifier|
  @locations ||= {}
  @block = @browser.find_element(:css, "g[block-id='#{block}']")
  x = @browser.execute_script("return $(\"[block-id='#{block}']\").position().left")
  y = @browser.execute_script("return $(\"[block-id='#{block}']\").position().top")
  @locations[identifier] = BlocklyHelpers::Point.new(x, y)
end

When /^I click block "([^"]*)"$/ do |block|
  @browser.execute_script("$(\"[block-id='#{block}']\").simulate( 'drag', {handle: 'corner', dx: 0, dy: 0, moves: 5});")
end

# Note: this is an offset relative to the current position of the block
When /^I drag block "([^"]*)" to offset "([^"]*), ([^"]*)"$/ do |blockId, dx, dy|
  dragBlockRelative(blockId, dx, dy)
end

When /^I begin to drag block "([^"]*)" to offset "([^"]*), ([^"]*)"$/ do |from, dx, dy|
  @browser.execute_script("$(\"[block-id='#{from}']\").simulate( 'drag', {skipDrop: true, handle: 'corner', dx: #{dx}, dy: #{dy}, moves: 5});")
end

When /^I drag block "([^"]*)" to block "([^"]*)"$/ do |from, to|
  code = generate_drag_code(from, to, 0, 30)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" to block "([^"]*)" plus offset (\d+), (\d+)$/ do |from, to, dx, dy|
  code = generate_drag_code(from, to, dx, dy)
  @browser.execute_script code
end

When /^I drag block "([^"]*)" above block "([^"]*)"$/ do |from, to|
  height = @browser.execute_script("return $(\"[block-id='#{from}']\")[0].getBoundingClientRect().height;") - 10
  destination_has_parent = @browser.execute_script("return $(\"[block-id='#{to}']\").parent().attr('block-id') !== undefined;")
  code = generate_drag_code(from, to, 0, destination_has_parent ? 0 : -height);
  @browser.execute_script code
end

When /^I drag block "([^"]*)" into first position in repeat block "([^"]*)"$/ do |from, to|
  code = generate_drag_code(from, to, 35, 50)
  @browser.execute_script code
end

Then /^block "([^"]*)" is at offset "([^"]*), ([^"]*)"$/ do |block, x, y|
  point = get_block_coordinates(block)
  x.to_i.should eq point.x
  y.to_i.should eq point.y
end

Then /^block "([^"]*)" is at location "([^"]*)"$/ do |block, location_identifier|
  actual_x = @browser.execute_script("return $(\"[block-id='#{block}']\").position().left")
  actual_y = @browser.execute_script("return $(\"[block-id='#{block}']\").position().top")
  location = @locations[location_identifier]
  location.x.should eq actual_x
  location.y.should eq actual_y
end

Then /^block "([^"]*)" is child of block "([^"]*)"$/ do |child, parent|
  @child_item = @browser.find_element(:css, "g[block-id='#{child}']")
  @parent_item = @browser.find_element(:css, "g[block-id='#{parent}']")
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  @parent_item.should eq @actual_parent_item
end

Then /^block "([^"]*)" is not child of block "([^"]*)"$/ do |child, parent|
  @child_item = @browser.find_element(:css, "g[block-id='#{child}']")
  @parent_item = @browser.find_element(:css, "g[block-id='#{parent}']")
  @actual_parent_item = @child_item.find_element(:xpath, "..")
  @parent_item.should_not eq @actual_parent_item
end

And /^I've initialized the workspace with an auto\-positioned flappy puzzle$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  blocks_xml = '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title><next><block type="flappy_playSound"><title name="VALUE">"sfx_wing"</title></block></next></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
  arranged_blocks_xml = @browser.execute_script("return BlocklyApps.arrangeBlockPosition('" + blocks_xml + "', {});")
  @browser.execute_script("BlocklyApps.loadBlocks('" + arranged_blocks_xml + "');")
end

And /^I've initialized the workspace with an auto\-positioned flappy puzzle with extra newlines$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  blocks_xml = '\n\n    <xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title><next><block type="flappy_playSound"><title name="VALUE">"sfx_wing"</title></block></next></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
  arranged_blocks_xml = @browser.execute_script("return BlocklyApps.arrangeBlockPosition('" + blocks_xml + "', {});")
  @browser.execute_script("BlocklyApps.loadBlocks('" + arranged_blocks_xml + "');")
end

And /^I've initialized the workspace with a studio say block saying "([^"]*)"$/ do |phrase|
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  xml = '<xml><block type="when_run" deletable="false"><next><block type="studio_saySprite"><title name="SPRITE">0</title><title name="TEXT">'+ phrase +'</title></block></next></block></xml>'
  @browser.execute_script("BlocklyApps.loadBlocks('" + xml + "');")
end

Then(/^block "([^"]*)" is in front of block "([^"]*)"$/) do |block_front, block_back|
  blocks_have_same_parent = @browser.execute_script("return $(\"[block-id='#{block_front}']\").parent()[0] === $(\"[block-id='#{block_back}']\").parent()[0]")
  raise('Cannot evaluate blocks with different parents') unless blocks_have_same_parent
  block_front_index = @browser.execute_script("return $(\"[block-id='#{block_front}']\").index()")
  block_back_index = @browser.execute_script("return $(\"[block-id='#{block_back}']\").index()")
  block_front_index.should be > block_back_index
end

Then(/^the workspace has "(.*?)" blocks of type "(.*?)"$/) do |n, type|
  code = "return Blockly.mainBlockSpace.getAllBlocks().reduce(function (a, b) { return a + (b.type === '" + type + "' ? 1 : 0) }, 0)"
  result = @browser.execute_script(code)
  result.should eq n.to_i
end

Then /^block "([^"]*)" has class "(.*?)"$/ do |blockId, className|
  item = @browser.find_element(:css, "g[block-id='#{blockId}']")
  classes = item.attribute("class")
  classes.include?(className).should eq true
end

Then /^block "([^"]*)" doesn't have class "(.*?)"$/ do |blockId, className|
  item = @browser.find_element(:css, "g[block-id='#{blockId}']")
  classes = item.attribute("class")
  classes.include?(className).should eq false
end

When(/^I set block "([^"]*)" to have a value of "(.*?)" for title "(.*?)"$/) do |blockId, value, title|
  script = "
    Blockly.mainBlockSpace.getAllBlocks().forEach(function (b) {
      if (b.id === #{blockId}) {
        b.setTitleValue('#{value}', '#{title}');
      }
    });"
  puts script
  @browser.execute_script(script);

end
