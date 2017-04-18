Then /^I resize top instructions to "(\d*)" pixels tall$/ do |height|
  @browser.execute_script("window.__TestInterface.getStore().dispatch({type: 'instructions/SET_INSTRUCTIONS_RENDERED_HEIGHT', height: #{height}})")
end

Then /^I wait until element "([^"]*)" is an img with src "([^"]*)"$/ do |selector, src|
  wait_until {@browser.execute_script("return $(\"#{selector}\").attr('src') === \"#{src}\";") == true}
end

# The best way to verify that an audio element can play is to listen to
# it all the way through, by clicking on play, waiting for "play" to
# turn into "pause", and then waiting for "pause" to turn back into
# "play"
Then /^I listen to the (\d+)(?:st|nd|rd|th) inline audio element$/ do |n|
  steps <<-STEPS
    Then I click selector ".csf-top-instructions .inline-audio:eq(#{n}) button"
    And I wait for 2 seconds
    And element ".csf-top-instructions .inline-audio:eq(#{n}) button img" is visible
  STEPS
end
