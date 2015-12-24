@no_mobile
@dashboard_db_access
@as_student
Feature: App Lab Scenarios

  Scenario: Template backed level
    # One of two levels backed by the same template
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/10?noautoplay=true"
    And I rotate to landscape
    And I close the dialog

    Then I reset the puzzle to the starting version
    And I close the dialog
    And the palette has 2 blocks
    And the droplet code is "turnRight(90);\n"

    Then I switch to text mode
    And I append text to droplet "turnLeft(90);\n"
    And the droplet code is "turnRight(90);\nturnLeft(90);\n"
    And I press "runButton"

    # Next level, backed by the same template
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/11?noautoplay=true"
    And I rotate to landscape
    And I close the dialog

    Then the palette has 2 blocks
    And the droplet code is "turnRight(90);\nturnLeft(90);\n"

    Then I switch to text mode
    And I append text to droplet "turnRight(10);\n"
    And the droplet code is "turnRight(90);\nturnLeft(90);\nturnRight(10);\n"
    And I press "runButton"

    # back to the first level
    Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/10?noautoplay=true"
    And I rotate to landscape
    And I close the dialog
    And the droplet code is "turnRight(90);\nturnLeft(90);\nturnRight(10);\n"
