Then /^ensure Flappy gameState is ([^\s]*)$/ do |value|
  states = { 'WAITING' => 0, 'ACTIVE' => 1, 'ENDING' => 2, 'OVER' => 3 }

  game_state = @browser.execute_script("return Flappy.gameState;")
  game_state.should eq states[value]
end

Then /^ensure Flappy tickCount is positive$/ do
  tick_count = @browser.execute_script("return Flappy.tickCount;")
  tick_count.should be > 0
end

Then /^I simulate a mousedown on the svg$/ do
  @browser.execute_script("$('\#svgFlappy rect').last().simulate('mousedown')")
end

And /^I've initialized the workspace with my flappy puzzle.$/ do
  @browser.execute_script("Blockly.mainBlockSpace.clear();")
  xml = '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title><next><block type="flappy_playSound"><title name="VALUE">"sfx_wing"</title></block></next></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
  @browser.execute_script("__TestInterface.loadBlocks('" + xml + "');")
end

Then /^I see the first Flappy YouTube video with the correct parameters$/ do
  correct_video_url = 'https://www.youtube.com/embed/VQ4lo6Huylc/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=VQ4lo6Huylc&wmode=transparent'
  correct_video_url.should eq @browser.execute_script("return $('iframe').attr('src')")
end
