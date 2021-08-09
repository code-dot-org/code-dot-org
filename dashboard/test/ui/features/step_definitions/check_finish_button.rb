# Helper steps for dance party levels
free_play_level_urls = {
  'blockly' => {
    'Dance Party' => 'http://studio.code.org/s/dance/lessons/1/levels/13?noautoplay=true',
    'Artist' => 'http://studio.code.org/s/20-hour/lessons/5/levels/10?noautoplay=true',
    'Bounce' => 'http://studio.code.org/s/course3/lessons/15/levels/10?noautoplay=true',
    'CS in Algebra' => 'http://studio.code.org/s/algebra/lessons/1/levels/2?noautoplay=true',
    'Flappy' => 'http://studio.code.org/flappy/10?noautoplay=true',
    'Sprite Lab' => 'http://studio.code.org/s/coursee-2019/lessons/9/levels/6?noautoplay=true'
  },
  'droplet' => {
    'App Lab' => 'http://studio.code.org/s/applab-intro/lessons/1/levels/15?noautoplay=true',
    'Game Lab' => 'http://studio.code.org/s/csd3-2019/lessons/22/levels/12?noautoplay=true'
  },
  'minecraft' => {
    'Minecraft Aquatic' => 'http://studio.code.org/s/aquatic/lessons/1/levels/12?noautoplay=true',
    'Minecraft Heroes Journey' => 'http://studio.code.org/s/hero/lessons/1/levels/12?noautoplay=true',
    'Minecraft Adventurer' => 'http://studio.code.org/s/mc/lessons/1/levels/14?noautoplay=true',
    'Minecraft Designer' => 'http://studio.code.org/s/minecraft/lessons/1/levels/12?noautoplay=true'
  }
}

When /^I check that the (blockly|droplet|minecraft) free play level for "([^"]*)" shows the finish button for (small|mobile) screens/i do |level_type, level_name, screen_type|
  individual_steps <<-STEPS
    And I set up the #{level_type} free play level for "#{level_name}"
    #{screen_type == 'small' ? 'And I change the browser window size to 1366 by 600' : ''}
    #{level_type == 'minecraft' ? 'And I wait until the Minecraft game is loaded' : ''}
    And I press "runButton"
    And I check that selector "button:contains('Finish')" is in the viewport
  STEPS
end

When /^I set up the (blockly|droplet|minecraft) free play level for "([^"]*)"/i do |level_type, level_name|
  individual_steps <<-STEPS
    And I am on "#{free_play_level_urls[level_type][level_name]}"
    And I rotate to landscape
    And I wait for the page to fully load
    And I bypass the age dialog
    And I close the instructions overlay if it exists
  STEPS
end
