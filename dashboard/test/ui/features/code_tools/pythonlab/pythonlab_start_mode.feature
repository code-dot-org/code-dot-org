@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
Feature: Python Lab start mode

Background:
  Given I create a levelbuilder named "Penelope"
  And I am on "http://studio.code.org/s/allthethings/lessons/50/levels/1"
  And I wait until element "#uitest-extra-links-button" is visible
  And I press "uitest-extra-links-button"
  Then I click selector "a:contains([s]tart)" to load a new page
  And I wait to see "#uitest-codebridge-run"

Scenario: Correct file types are in the dropdown
  And I open the dropdown for file 0
  And element "#uitest-file-0-popup" contains text "Make validation file"
  And element "#uitest-file-0-popup" contains text "Make starter file"
  And element "#uitest-file-0-popup" contains text "Make support file"
  And element "#uitest-file-0-popup" does not contain text "Make locked starter file"
  # Click outside to close dropdown
  And I click selector ".cm-content"
  And I open the dropdown for file 2
  And element "#uitest-file-2-popup" contains text "Make validation file"
  And element "#uitest-file-2-popup" contains text "Make locked starter file"
  And element "#uitest-file-2-popup" contains text "Make starter file"
  And element "#uitest-file-2-popup" does not contain text "Make support file"
  And I click selector "#uitest-make-validation"

  # After making a file a validation file, the other file should no longer provide
  # validation as an option.
  And I open the dropdown for file 0
  And element "#uitest-file-0-popup" does not contain text "Make validation file"


