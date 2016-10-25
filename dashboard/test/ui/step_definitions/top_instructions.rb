Then /^I resize top instructions to "(\d*)" pixels tall$/ do |height|
  @browser.execute_script("StudioApp.singleton.reduxStore.dispatch({type: 'instructions/SET_INSTRUCTIONS_RENDERED_HEIGHT', height: #{height}})")
end

# The best way to verify that an audio element can play is to listen to
# it all the way through, by clicking on play, waiting for "play" to
# turn into "pause", and then waiting for "pause" to turn back into
# "play"
Then /^I listen to the entirety of the "(\d*)"th inline audio element$/ do |n|
  @browser.execute_script("$('.csf-top-instructions .inline-audio:eq(#{n}) button').click()")
  Then I wait to see ".csf-top-instructions .inline-audio:eq(#{n}) img[src=\"/blockly/media/common_images/pause.png\"]"
  Then I wait to see ".csf-top-instructions .inline-audio:eq(#{n}) img[src=\"/blockly/media/common_images/play.png\"]"
end
