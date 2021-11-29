Feature: Encrypted Level

Scenario: Load Encrypted Play Lab Level
  When I am on "http://studio.code.org/s/allthethings/lessons/5/levels/6"
  And I wait until element "#runButton" is visible
  # Left button will only show up if soft_buttons is correctly parsed
  # from the encrypted_properties field in the XML in the .level file.
  Then element "#leftButton" is visible

