@no_mobile
@no_ie
Feature: Angle Helper

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/3/levels/7"
  And I wait to see "#runButton"

@eyes
Scenario: Angle Helper Eyes Tests
  When I open my eyes to test "angle helper"
  Then I begin to edit the angle of turn block "2"
  And I see no difference for "free text angle helper"
  And I click block "3"
  And I begin to edit the angle of turn block "3"
  And I see no difference for "dropdown angle helper"
  And I click block "4"
  And I begin to edit the value of turn block "4"
  And I see no difference for "value input angle helper"
  And I close my eyes

Scenario: Free Text Input Angle Helper
  When I begin to edit the angle of turn block "2"

  # defaults to 90
  Then the angle text is at "90"
  And the Angle Helper circle is at coordinates (75,127)

  # updating the text input should update the angle helper
  When I change the angle text to "120"
  Then the angle text is at "120"
  And the Angle Helper circle is at coordinates (49,120)

  # updating the angle helper should update the text input
  When I drag the Angle Helper circle to coordinates (38,38)
  Then the Angle Helper circle is at coordinates (38,38)
  Then the angle text is at "225"

Scenario: Dropdown Angle Helper
  When I begin to edit the angle of turn block "3"
  # defaults to 270
  Then the angle dropdown is at "270"
  And the Angle Helper circle is at coordinates (74,46)

  # updating the dropdown should update the angle helper
  When I change the angle dropdown to "45"
  # updating the dropdown also automatically closes it, so reopen
  And I begin to edit the angle of turn block "3"

  Then the angle dropdown is at "45"
  And the Angle Helper circle is at coordinates (111,134)

  # updating the angle helper should update the dropdown
  When I drag the Angle Helper circle to coordinates (127,98)
  Then the Angle Helper circle is at coordinates (127,98)
  Then the angle dropdown is at "0"

Scenario: Value Input Angle Helper
  When I begin to edit the value of turn block "4"

  # defaults to 30
  Then the angle text is at "30"
  And the Angle Helper circle is at coordinates (120,101)

  # updating the text input should update the angle helper
  When I change the angle text to "60"
  Then the angle text is at "60"
  And the Angle Helper circle is at coordinates (101,120)

  # updating the angle helper should update the text input
  When I drag the Angle Helper circle to coordinates (35,108)
  Then the Angle Helper circle is at coordinates (35,108)
  Then the angle text is at "140"
