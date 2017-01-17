# Test only on chrome; other browsers in the saucelabs ecosystem do not
# come with the appropriate audio codecs, and end up responding with
# "Media resource could not be decoded" errors
@chrome
Feature: Text To Speech

Scenario: Listen to TTS Audio
  Given I am on "http://studio.code.org/s/allthethings/stage/6/puzzle/3?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I close the instructions overlay if it exists

  # note: we expect no audio for the instructions, because this test
  # level is not in course1.
  Then element ".csf-top-instructions .inline-audio" does not exist

  # running with default setup should give me a feedback audio and a
  # block hint audio
  When I press "runButton"
  And I wait to see ".uitest-topInstructions-inline-feedback"
  And I resize top instructions to "500" pixels tall
  Then I see 2 of jquery selector .csf-top-instructions .inline-audio
  And I listen to the 0th inline audio element
  And I listen to the 1st inline audio element

  # requesting a hint should give me another
  When I press "lightbulb"
  Then I see 3 of jquery selector .csf-top-instructions .inline-audio
  And I resize top instructions to "500" pixels tall
  And I listen to the 2nd inline audio element

  # viewing the hint should give me another, while removing the hint
  # request dialog and the feedback.
  When I press ".csf-top-instructions button:contains('Yes')" using jQuery
  And I wait to see ".block-space"
  And I resize top instructions to "500" pixels tall
  Then I see 2 of jquery selector .csf-top-instructions .inline-audio
  And I listen to the 1st inline audio element
