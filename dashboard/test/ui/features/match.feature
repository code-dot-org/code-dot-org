Feature: Playing match levels

Background:
  Given I am on "http://learn.code.org/s/course1/stage/14/puzzle/13?noautoplay=true"
  Then I rotate to landscape
  And element ".submitButton" is visible

Scenario: Loading the level
  And element ".match .content2" has text "Match the blocks"

# drag simulation does not work in IE/iOS, so we exclude them for now
@no_ie
@no_mobile
Scenario: Solving puzzle
  And I drag ".answer[originalindex=0]" to ".emptyslot:first"
  And I drag ".answer[originalindex=1]" to ".emptyslot:first"
  And I drag ".answer[originalindex=2]" to ".emptyslot:first"
  And I drag ".answer[originalindex=3]" to ".emptyslot:first"
  And I press ".submitButton:first" using jQuery
  Then I wait to see ".modal"
  And element ".modal .dialog-title" contains text "Correct"

@no_ie
@no_mobile
Scenario: Submitting an incorrect solution
  And I drag ".answer[originalindex=3]" to ".emptyslot:first"
  And I drag ".answer[originalindex=2]" to ".emptyslot:first"
  And I drag ".answer[originalindex=1]" to ".emptyslot:first"
  And I drag ".answer[originalindex=0]" to ".emptyslot:first"
  And I press ".submitButton:last" using jQuery
  Then I wait to see ".modal"
  And element ".modal .dialog-title" contains text "Incorrect"
  And I press ".modal #ok-button" using jQuery
  And I wait until element ".xmark" is visible
