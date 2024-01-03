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
# Updated: Check that image is still visible after pressing play
Then /^I listen to the (\d+)(?:st|nd|rd|th) inline audio element$/ do |n|
  steps <<-STEPS
    Then I click selector ".inline-audio:eq(#{n}) .playPause"
    And I wait for 2 seconds
    And element ".inline-audio:eq(#{n}) .playPause i" is visible
  STEPS
end

Given /^I load the review tab$/ do
  # Load the review tab in the instructions panel
  steps <<-STEPS
     And I wait to see ".uitest-reviewTab"
     And I click selector ".uitest-reviewTab"
     And I wait to see ".review-refresh-button"
  STEPS
end

Given /^I load the code review for peer number (.*) in the list$/ do |number|
  steps <<-STEPS
   And I load the review tab
   And I press ".peer-dropdown-button" using jQuery
   And I wait to see ".code-review-peer-link"
   And I click selector ".code-review-peer-link:nth-child(#{number})" to load a new page
   And I wait to see "#ui-test-code-review-comment-input"
  STEPS
end
