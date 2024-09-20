@no_mobile
Feature: Angle Helper

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/3/levels/7?blocklyVersion=google"
  And I wait to see "#runButton"

@eyes
Scenario: Angle Helper Eyes Tests
  When I open my eyes to test "angle helper"
  Then I show the editor of field "VALUE" of block "turnConstant"
  And I see no difference for "free text angle helper"
  And I click block "turnDropdown"
  And I show the editor of field "VALUE" of block "turnDropdown"
  And I see no difference for "dropdown angle helper"
  And I click block "turnInput"
  And I show the editor of field "NUM" of block "mathNumber"
  And I see no difference for "value input angle helper"
  And I close my eyes

Scenario: Free Text Input Angle Helper
  Then I show the editor of field "VALUE" of block "turnConstant"

  # defaults to 90
  Then the angle text is at "90"
  And the Angle Helper circle is at coordinates (75,127)

  # updating the text input should update the angle helper
  When I change the field "VALUE" editor value to "120"
  Then the angle text is at "120"
  And the Angle Helper circle is at coordinates (49,120)

  # updating the angle helper should update the text input
  When I drag the Angle Helper circle to coordinates (38,38)
  Then the Angle Helper circle is at coordinates (38,38)
  Then the angle text is at "225"

Scenario: Dropdown Angle Helper
  When I show the editor of field "VALUE" of block "turnDropdown"
  # defaults to 270
  Then the angle dropdown is at "270"
  And the Angle Helper circle is at coordinates (74,23)

  # updating the dropdown should update the angle helper
  When I change the field "VALUE" dropdown to "45"

  Then the angle dropdown is at "45"
  And the Angle Helper circle is at coordinates (111,111)

  # updating the angle helper should update the dropdown
  When I drag the Angle Helper circle to coordinates (127,75)
  Then the Angle Helper circle is at coordinates (127,75)
  Then the angle dropdown is at "0"

Scenario: Value Input Angle Helper
  When I show the editor of field "NUM" of block "mathNumber"

  # defaults to 30
  Then the angle text is at "30"
  And the Angle Helper circle is at coordinates (120,101)

  # updating the text input should update the angle helper
  When I change the field "NUM" editor value to "60"
  Then the angle text is at "60"
  And the Angle Helper circle is at coordinates (101,120)

  # updating the angle helper should update the text input
  When I drag the Angle Helper circle to coordinates (38,38)
  Then the Angle Helper circle is at coordinates (38,38)
  Then the angle text is at "225"
