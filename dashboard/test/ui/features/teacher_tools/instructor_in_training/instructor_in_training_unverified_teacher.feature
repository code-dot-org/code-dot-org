@no_mobile
Feature: Self Paced PL Instructor in Training - Unverified Instructor

  Scenario: View Instructor In Training Dance Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/2"
    And I wait for the lab page to fully load

    And element ".uitest-instructionsTab" is visible
    And element ".uitest-teacherOnlyTab" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Free Response Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/3"

    And element ".submitButton" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training External Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/6"

    And element ".submitButton" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Bubble Choice Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/7"

    And element ".bubble-choice" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training LevelGroup Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/2/levels/1"

    And element ".level-group" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"
