@no_phone
Feature: Self Paced PL Instructor in Training

  Scenario: View Instructor In Training Applab Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I wait for the lab page to fully load

    Then I press the first ".uitest-teacherOnlyTab" element
    And I wait to see ".editor-column"
    And element ".editor-column" contains text "For Teachers Only"
    And element ".editor-column" contains text "Teacher Only Content Yay!"
    And element ".editor-column" contains text "Example Solution 1"
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training Applab Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I wait for the lab page to fully load

    Then I press the first ".uitest-teacherOnlyTab" element
    And I wait to see ".editor-column"
    And element ".editor-column" contains text "For Teachers Only"
    And element ".editor-column" contains text "Teacher Only Content Yay!"
    And element ".editor-column" contains text "Example Solution 1"
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Applab Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I wait for the lab page to fully load

    And element ".uitest-instructionsTab" is visible
    And element ".uitest-teacherOnlyTab" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"
