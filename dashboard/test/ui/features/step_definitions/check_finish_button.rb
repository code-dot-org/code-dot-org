# Helper steps for dance party levels
free_play_level_urls = {
  'blockly' => {
    'Dance Party' => 'http://studio.code.org/courses/dance/units/1/lessons/1/levels/13?noautoplay=true&no_redirect=true',
    'Artist' => 'http://studio.code.org/courses/artist/units/1/lessons/1/levels/10?noautoplay=true&no_redirect=true',
    'Bounce' => 'http://studio.code.org/courses/sports/units/1/lessons/1/levels/8?noautoplay=true&no_redirect=true',
    'Flappy' => 'http://studio.code.org/flappy/10?noautoplay=true&no_redirect=true',
    'Sprite Lab' => 'http://studio.code.org/courses/coursee-2019/units/1/lessons/9/levels/6?noautoplay=true&no_redirect=true'
  },
  'droplet' => {
    'App Lab' => 'http://studio.code.org/courses/applab-intro/units/1/lessons/1/levels/15?noautoplay=true&no_redirect=true',
    'Game Lab' => 'http://studio.code.org/courses/allthethingscourse/units/1/lessons/19/levels/4?noautoplay=true&no_redirect=true'
  },
  'minecraft' => {
    'Minecraft Aquatic' => 'http://studio.code.org/courses/aquatic/units/1/lessons/1/levels/12?noautoplay=true&no_redirect=true',
    'Minecraft Heroes Journey' => 'http://studio.code.org/courses/hero/units/1/lessons/1/levels/12?noautoplay=true&no_redirect=true',
    'Minecraft Adventurer' => 'http://studio.code.org/courses/mc/units/1/lessons/1/levels/14?noautoplay=true&no_redirect=true',
    'Minecraft Designer' => 'http://studio.code.org/courses/minecraft/units/1/lessons/1/levels/12?noautoplay=true&no_redirect=true'
  }
}

When /^I check that the (blockly|droplet|minecraft) free play level for "([^"]*)" shows the finish button for (small|mobile) screens/i do |level_type, level_name, screen_type|
  individual_steps <<-STEPS
    And I set up the #{level_type} free play level for "#{level_name}"
    #{screen_type == 'small' ? 'And I change the browser window size to 1366 by 727' : ''}
    #{level_type == 'minecraft' ? 'And I wait until the Minecraft game is loaded' : ''}
    And I press "runButton"
    And I check that selector "button:contains('Finish')" is in the viewport
  STEPS
end

When /^I set up the (blockly|droplet|minecraft) free play level for "([^"]*)"/i do |level_type, level_name|
  individual_steps <<-STEPS
    And I am on "#{free_play_level_urls[level_type][level_name]}"
    And I wait for the lab page to fully load
    And I bypass the age dialog
    And I close the instructions overlay if it exists
  STEPS
end
