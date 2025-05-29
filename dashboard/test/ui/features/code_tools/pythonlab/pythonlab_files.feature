@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
Feature: Python Lab manage files and folders

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/50/levels/1"
  And I wait to see "#uitest-codebridge-run"

Scenario: Can add a new, unlocked file
  And I press "uitest-files-plus"
  And I wait to see "#uitest-new-file"
  And I press "uitest-new-file"
  And I wait to see "#uitest-prompt-field"
  And I press keys "new_file.py" for element "#uitest-prompt-field"
  And I press "uitest-generic-dialog-ok"
  And element ".cm-content" contains text "Add your changes to new_file.py"
  And element "#uitest-files-list" contains text "new_file.py"
  And I open the dropdown for file 3
  And element "#uitest-file-3-popup" contains text "Download"
  And element "#uitest-file-3-popup" contains text "Delete"

Scenario: main.py is locked
  And I open the dropdown for file 0
  And element "#uitest-file-0-popup" contains text "Download"
  And element "#uitest-file-0-popup" does not contain text "Rename"
